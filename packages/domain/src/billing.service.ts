import { db, schema } from '@repo/db';
import { eq, and, lte, sql } from 'drizzle-orm';
import {
  calculateLineTotal,
  evaluateDiscount,
  calculateInvoiceTotals,
  calculateNextBillingDate
} from './pricing';
import type { BillingInterval } from '@repo/contracts';

export interface BillingRunResult {
  generatedCount: number;
  skippedCount: number;
  invoices: Array<typeof schema.invoices.$inferSelect>;
  skipped: Array<{ subscriptionId: string; invoiceNumber: string; reason: string }>;
}

export class BillingService {
  private static isLocallyLocked = false;
  private static ADVISORY_LOCK_ID = 89214; // Brightloop billing lock key

  /**
   * Executes an idempotent billing run for all subscriptions due on or before targetDate.
   * Safe against overlapping billing runs using both local mutex and PostgreSQL transaction advisory locks (pg_try_advisory_xact_lock).
   * Transaction-level advisory locks prevent connection-pool lock leakage and guarantee automatic release on commit or rollback.
   */
  public static async runBillingScan(
    targetDate: string = new Date().toISOString().split('T')[0]
  ): Promise<BillingRunResult> {
    // 1. Local process lock check
    if (this.isLocallyLocked) {
      console.log('⚠️ [BillingService] Another billing scan is already in progress locally. Skipping.');
      return { generatedCount: 0, skippedCount: 0, invoices: [], skipped: [] };
    }

    this.isLocallyLocked = true;

    try {
      return await db.transaction(async (tx) => {
        // 2. PostgreSQL Distributed Transaction Advisory Lock
        // Automatically released when the transaction ends (commit or rollback)
        const lockRes = await tx.execute<{ acquired: boolean }>(
          sql`SELECT pg_try_advisory_xact_lock(${this.ADVISORY_LOCK_ID}) as acquired`
        );
        const lockAcquired = !!(lockRes[0]?.acquired);

        if (!lockAcquired) {
          console.log('⚠️ [BillingService] PostgreSQL advisory xact lock could not be acquired (concurrent run active). Skipping.');
          return { generatedCount: 0, skippedCount: 0, invoices: [], skipped: [] };
        }

        console.log(`🔍 [BillingService] Running billing scan for target date: ${targetDate}`);

        // 3. Find active subscriptions due for billing
        const dueSubscriptions = await tx
          .select()
          .from(schema.subscriptions)
          .where(
            and(
              eq(schema.subscriptions.status, 'ACTIVE'),
              lte(schema.subscriptions.nextBillingDate, targetDate)
            )
          );

        const generatedInvoices: Array<typeof schema.invoices.$inferSelect> = [];
        const skippedDuplicates: Array<{ subscriptionId: string; invoiceNumber: string; reason: string }> = [];

        for (const sub of dueSubscriptions) {
          const billingPeriodStart = sub.nextBillingDate;

          // Fetch plan to determine interval
          const [plan] = await tx
            .select()
            .from(schema.plans)
            .where(eq(schema.plans.id, sub.planId));

          const interval = (plan ? plan.billingInterval : 'MONTHLY') as BillingInterval;
          const intervalCount = plan ? plan.intervalCount : 1;
          const billingPeriodEnd = calculateNextBillingDate(billingPeriodStart, interval, intervalCount);

          // 4. Idempotency Check: prevent duplicate invoice for (subscription_id, billing_period_start)
          const [existingInvoice] = await tx
            .select()
            .from(schema.invoices)
            .where(
              and(
                eq(schema.invoices.subscriptionId, sub.id),
                eq(schema.invoices.billingPeriodStart, billingPeriodStart)
              )
            );

          if (existingInvoice) {
            skippedDuplicates.push({
              subscriptionId: sub.id,
              invoiceNumber: existingInvoice.invoiceNumber,
              reason: 'Invoice already generated for this billing period'
            });
            continue;
          }

          // Fetch subscription line items
          const subLines = await tx
            .select()
            .from(schema.subscriptionLines)
            .where(eq(schema.subscriptionLines.subscriptionId, sub.id));

          // Fetch customer record for immutable snapshot
          const [customer] = await tx
            .select()
            .from(schema.customers)
            .where(eq(schema.customers.id, sub.customerId));

          // Assemble line item snapshots
          const invoiceLineItems = [];
          let invoiceSubtotal = 0;

          for (const line of subLines) {
            const [product] = await tx
              .select()
              .from(schema.products)
              .where(eq(schema.products.id, line.productId));

            let variantName = null;
            if (line.variantId) {
              const [variant] = await tx
                .select()
                .from(schema.productVariants)
                .where(eq(schema.productVariants.id, line.variantId));
              if (variant) variantName = variant.name;
            }

            const lineTotal = calculateLineTotal(line.unitPrice, line.quantity);
            invoiceSubtotal += parseFloat(lineTotal);

            // Get tax rate if configured
            let taxRate = '0.2000'; // Default standard VAT 20%
            if (line.taxId) {
              const [tax] = await tx.select().from(schema.taxes).where(eq(schema.taxes.id, line.taxId));
              if (tax) taxRate = tax.rate;
            }

            invoiceLineItems.push({
              productId: line.productId,
              productNameSnapshot: product ? product.name : 'Subscription Service',
              variantNameSnapshot: variantName,
              quantity: line.quantity,
              unitPriceSnapshot: line.unitPrice,
              taxRateSnapshot: taxRate,
              lineTotal
            });
          }

          // 5. Evaluate active discounts
          let appliedDiscountAmount = '0.0000';
          const [activeDiscount] = await tx
            .select()
            .from(schema.discounts)
            .where(eq(schema.discounts.isActive, true))
            .limit(1);

          if (activeDiscount) {
            appliedDiscountAmount = evaluateDiscount(
              invoiceSubtotal.toFixed(4),
              subLines.reduce((acc, l) => acc + l.quantity, 0),
              {
                discountType: activeDiscount.discountType as any,
                value: activeDiscount.value,
                targetType: activeDiscount.targetType as any,
                minPurchaseAmount: activeDiscount.minPurchaseAmount,
                minQuantity: activeDiscount.minQuantity,
                timesUsed: activeDiscount.timesUsed,
                maxUses: activeDiscount.maxUses,
                isActive: true
              },
              targetDate
            );
          }

          // 6. Calculate invoice financial totals
          const totals = calculateInvoiceTotals(
            invoiceLineItems.map((l) => ({ lineTotal: l.lineTotal, taxRate: l.taxRateSnapshot })),
            appliedDiscountAmount
          );

          const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 30);
          const dueDateStr = dueDate.toISOString().split('T')[0];

          // 7. Insert Invoice
          const [newInvoice] = await tx
            .insert(schema.invoices)
            .values({
              invoiceNumber,
              subscriptionId: sub.id,
              customerId: sub.customerId,
              status: 'CONFIRMED', // Immediately confirmed and payable
              issueDate: targetDate,
              dueDate: dueDateStr,
              billingPeriodStart,
              billingPeriodEnd,
              subtotal: totals.subtotal,
              taxAmount: totals.taxAmount,
              discountAmount: totals.discountAmount,
              totalAmount: totals.totalAmount,
              amountPaid: '0.0000',
              customerSnapshot: customer
                ? {
                    companyName: customer.companyName,
                    contactName: customer.contactName,
                    email: customer.email,
                    address: customer.billingAddress
                  }
                : null
            })
            .returning();

          // Insert Invoice Lines
          for (const line of invoiceLineItems) {
            await tx.insert(schema.invoiceLines).values({
              invoiceId: newInvoice.id,
              productId: line.productId,
              productNameSnapshot: line.productNameSnapshot,
              variantNameSnapshot: line.variantNameSnapshot,
              quantity: line.quantity,
              unitPriceSnapshot: line.unitPriceSnapshot,
              taxRateSnapshot: line.taxRateSnapshot,
              lineTotal: line.lineTotal
            });
          }

          // Check if subscription should auto-close
          const shouldAutoClose = plan?.autoClose && sub.endDate && billingPeriodEnd >= sub.endDate;

          // Advance subscription's next_billing_date
          await tx
            .update(schema.subscriptions)
            .set({
              nextBillingDate: billingPeriodEnd,
              status: shouldAutoClose ? 'CLOSED' : sub.status,
              updatedAt: new Date()
            })
            .where(eq(schema.subscriptions.id, sub.id));

          // Increment discount usage counter if discount was applied
          if (activeDiscount && parseFloat(appliedDiscountAmount) > 0) {
            await tx
              .update(schema.discounts)
              .set({ timesUsed: activeDiscount.timesUsed + 1 })
              .where(eq(schema.discounts.id, activeDiscount.id));
          }

          generatedInvoices.push(newInvoice);
        }

        console.log(
          `✅ [BillingService] Scan complete. Generated: ${generatedInvoices.length}, Skipped: ${skippedDuplicates.length}`
        );

        return {
          generatedCount: generatedInvoices.length,
          skippedCount: skippedDuplicates.length,
          invoices: generatedInvoices,
          skipped: skippedDuplicates
        };
      });
    } finally {
      this.isLocallyLocked = false;
    }
  }
}
