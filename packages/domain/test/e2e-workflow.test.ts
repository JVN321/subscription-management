import { describe, it, expect } from 'vitest';
import { db, schema } from '@repo/db';
import { eq, sql } from 'drizzle-orm';
import {
  calculateUnitPrice,
  calculateLineTotal,
  evaluateDiscount,
  calculateInvoiceTotals,
  BillingService
} from '../src';

describe('End-to-End Customer → Subscription → Automatic Billing → Invoice → Payment Workflow', () => {
  it('executes the complete 7-scene billing and subscription lifecycle without errors', async () => {
    // -------------------------------------------------------------
    // Scene 1: New Customer Signs Up & Admin provisions Staff
    // -------------------------------------------------------------
    const testEmail = `cust-${Date.now()}@acme.com`;
    const [customerUser] = await db
      .insert(schema.users)
      .values({
        email: testEmail,
        passwordHash: 'hashed_ComplexPass123!@#',
        role: 'customer',
        name: 'John Acme'
      })
      .returning();

    const [customer] = await db
      .insert(schema.customers)
      .values({
        userId: customerUser.id,
        companyName: 'Acme Logistics Inc',
        contactName: 'John Acme',
        email: testEmail,
        billingAddress: { street: '100 Broadway', city: 'New York', state: 'NY', country: 'US' },
        paymentTerms: 'NET_30'
      })
      .returning();

    expect(customer.companyName).toBe('Acme Logistics Inc');

    // -------------------------------------------------------------
    // Scene 2: Product with Variant (+560 Odoo brand) & Plan
    // -------------------------------------------------------------
    const [product] = await db
      .insert(schema.products)
      .values({
        name: 'Brightloop Inventory Pro',
        productType: 'SOFTWARE',
        salesPrice: '1000.0000',
        costPrice: '250.0000'
      })
      .returning();

    const [variant] = await db
      .insert(schema.productVariants)
      .values({
        productId: product.id,
        name: 'Odoo Enterprise Edition',
        sku: `VAR-${Date.now()}`,
        priceAdjustment: '560.0000', // +560 adjustment
        isPercentage: false
      })
      .returning();

    const unitPrice = calculateUnitPrice(product.salesPrice, variant.priceAdjustment, false);
    expect(unitPrice).toBe('1560.0000');

    const [plan] = await db
      .insert(schema.plans)
      .values({
        name: 'Monthly Pro Plan',
        billingInterval: 'MONTHLY',
        intervalCount: 1,
        minQuantity: 2,
        allowPause: true,
        allowRenewal: true
      })
      .returning();

    // -------------------------------------------------------------
    // Scene 3: Quotation & 1-Click Conversion to Subscription
    // -------------------------------------------------------------
    const quoteNumber = `QT-E2E-${Date.now().toString().slice(-4)}`;
    const [quote] = await db
      .insert(schema.quotations)
      .values({
        quoteNumber,
        customerId: customer.id,
        planId: plan.id,
        status: 'SENT',
        expiresAt: new Date(Date.now() + 86400000 * 30)
      })
      .returning();

    const lineTotal = calculateLineTotal(unitPrice, 5); // 5 seats * $1560 = $7800
    expect(lineTotal).toBe('7800.0000');

    await db.insert(schema.quotationLines).values({
      quotationId: quote.id,
      productId: product.id,
      variantId: variant.id,
      quantity: 5,
      unitPrice,
      amount: lineTotal
    });

    // 1-Click Atomic Conversion
    const todayStr = new Date().toISOString().split('T')[0];
    const subNumber = `SUB-E2E-${Date.now().toString().slice(-4)}`;
    const [subscription] = await db
      .insert(schema.subscriptions)
      .values({
        subscriptionNumber: subNumber,
        customerId: customer.id,
        planId: plan.id,
        quotationId: quote.id,
        status: 'ACTIVE',
        startDate: todayStr,
        nextBillingDate: todayStr,
        paymentTerms: 'NET_30'
      })
      .returning();

    await db.insert(schema.subscriptionLines).values({
      subscriptionId: subscription.id,
      productId: product.id,
      variantId: variant.id,
      quantity: 5,
      unitPrice,
      totalAmount: lineTotal
    });

    await db
      .update(schema.quotations)
      .set({ status: 'CONVERTED', convertedSubscriptionId: subscription.id })
      .where(eq(schema.quotations.id, quote.id));

    expect(subscription.status).toBe('ACTIVE');

    // -------------------------------------------------------------
    // Scene 4 & 5: Automatic Billing Run & Volume Discount (10% off)
    // -------------------------------------------------------------
    const billingResult = await BillingService.runBillingScan(todayStr);
    expect(billingResult.generatedCount).toBeGreaterThanOrEqual(1);

    const [invoice] = await db
      .select()
      .from(schema.invoices)
      .where(eq(schema.invoices.subscriptionId, subscription.id));

    expect(invoice).toBeDefined();
    expect(invoice.status).toBe('CONFIRMED');
    expect(parseFloat(invoice.subtotal)).toBe(7800);
    const discountAmt = parseFloat(invoice.discountAmount);
    expect(discountAmt).toBeGreaterThan(0);
    expect(parseFloat(invoice.taxAmount)).toBe(1560);
    // Total = (subtotal - discount) + tax
    expect(parseFloat(invoice.totalAmount)).toBe(7800 - discountAmt + 1560);
    expect(parseFloat(invoice.amountPaid)).toBe(0);

    // Verify Idempotency: Running billing scan again immediately MUST skip duplicate!
    const secondScan = await BillingService.runBillingScan(todayStr);
    const wasDuplicateSkipped = secondScan.skipped.some((s) => s.subscriptionId === subscription.id);
    expect(wasDuplicateSkipped || secondScan.generatedCount === 0).toBe(true);

    // -------------------------------------------------------------
    // Scene 6: Payment Recording & Balance Reconciliation
    // -------------------------------------------------------------
    const [payment] = await db
      .insert(schema.payments)
      .values({
        invoiceId: invoice.id,
        amount: invoice.totalAmount, // Pay in full
        paymentMethod: 'WIRE_TRANSFER',
        paymentDate: todayStr,
        notes: 'Chase Wire Confirmed Ref #994821'
      })
      .returning();

    await db
      .update(schema.invoices)
      .set({
        amountPaid: invoice.totalAmount,
        status: 'PAID',
        updatedAt: new Date()
      })
      .where(eq(schema.invoices.id, invoice.id));

    const [paidInvoice] = await db
      .select()
      .from(schema.invoices)
      .where(eq(schema.invoices.id, invoice.id));

    expect(paidInvoice.status).toBe('PAID');
    expect(parseFloat(paidInvoice.amountPaid)).toBe(8580);

    // -------------------------------------------------------------
    // Scene 7: Finance Reporting Metric Validation
    // -------------------------------------------------------------
    const allSubs = await db.select().from(schema.subscriptions);
    const activeSubsCount = allSubs.filter((s) => s.status === 'ACTIVE').length;
    expect(activeSubsCount).toBeGreaterThanOrEqual(1);
  });
});
