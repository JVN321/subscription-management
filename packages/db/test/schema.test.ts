import { describe, it, expect } from 'vitest';
import { db, schema } from '../src';
import { eq, and } from 'drizzle-orm';

describe('Database Schema & Financial Invariants Test', () => {
  it('enforces NUMERIC(14, 4) decimal precision without floating point drift', async () => {
    const testSku = `SKU-PRECISION-${Date.now()}`;
    const [prod] = await db
      .insert(schema.products)
      .values({
        name: 'Precision Test Product',
        productType: 'SOFTWARE',
        salesPrice: '1560.1234',
        costPrice: '450.9876'
      })
      .returning();

    expect(prod.salesPrice).toBe('1560.1234');
    expect(prod.costPrice).toBe('450.9876');

    // Clean up
    await db.delete(schema.products).where(eq(schema.products.id, prod.id));
  });

  it('enforces database-level UNIQUE constraint on (subscription_id, billing_period_start) preventing duplicate invoices', async () => {
    // 1. Create temporary customer and subscription
    const [custUser] = await db
      .insert(schema.users)
      .values({
        email: `db-test-${Date.now()}@test.com`,
        passwordHash: 'hashed_Pass123!@#',
        role: 'customer',
        name: 'DB Test Customer'
      })
      .returning();

    const [cust] = await db
      .insert(schema.customers)
      .values({
        userId: custUser.id,
        companyName: 'Duplicate Check Corp',
        contactName: 'Tester',
        email: custUser.email
      })
      .returning();

    const [plan] = await db
      .insert(schema.plans)
      .values({
        name: 'DB Invariant Plan',
        billingInterval: 'MONTHLY'
      })
      .returning();

    const [sub] = await db
      .insert(schema.subscriptions)
      .values({
        subscriptionNumber: `SUB-DUP-${Date.now().toString().slice(-4)}`,
        customerId: cust.id,
        planId: plan.id,
        status: 'ACTIVE',
        startDate: '2026-11-01',
        nextBillingDate: '2026-11-01'
      })
      .returning();

    // 2. Insert First Invoice
    await db.insert(schema.invoices).values({
      invoiceNumber: `INV-DUP-1-${Date.now()}`,
      subscriptionId: sub.id,
      customerId: cust.id,
      status: 'CONFIRMED',
      issueDate: '2026-11-01',
      dueDate: '2026-12-01',
      billingPeriodStart: '2026-11-01',
      billingPeriodEnd: '2026-12-01',
      subtotal: '100.0000',
      totalAmount: '120.0000'
    });

    // 3. Attempt to insert Second Invoice for identical (subscription_id, billing_period_start)
    // Must reject with a PostgreSQL unique constraint violation error!
    let duplicateRejected = false;
    try {
      await db.insert(schema.invoices).values({
        invoiceNumber: `INV-DUP-2-${Date.now()}`,
        subscriptionId: sub.id,
        customerId: cust.id,
        status: 'CONFIRMED',
        issueDate: '2026-11-01',
        dueDate: '2026-12-01',
        billingPeriodStart: '2026-11-01', // Identical period start!
        billingPeriodEnd: '2026-12-01',
        subtotal: '100.0000',
        totalAmount: '120.0000'
      });
    } catch (err: any) {
      duplicateRejected = true;
      // PostgreSQL error code 23505 is unique_violation
      expect(err.code || err.message).toBeDefined();
    }

    expect(duplicateRejected).toBe(true);

    // Clean up
    await db.delete(schema.invoices).where(eq(schema.invoices.subscriptionId, sub.id));
    await db.delete(schema.subscriptions).where(eq(schema.subscriptions.id, sub.id));
    await db.delete(schema.plans).where(eq(schema.plans.id, plan.id));
    await db.delete(schema.customers).where(eq(schema.customers.id, cust.id));
    await db.delete(schema.users).where(eq(schema.users.id, custUser.id));
  });

  it('guarantees ACID transaction rollback on failure leaving zero orphaned records', async () => {
    const testEmail = `rollback-${Date.now()}@test.com`;

    let failed = false;
    try {
      await db.transaction(async (tx) => {
        const [u] = await tx
          .insert(schema.users)
          .values({
            email: testEmail,
            passwordHash: 'hashed_Pass123!@#',
            role: 'customer',
            name: 'Rollback User'
          })
          .returning();

        // Intentionally trigger an error
        throw new Error('Simulated failure during checkout');
      });
    } catch (e) {
      failed = true;
    }

    expect(failed).toBe(true);

    // Verify user was NOT persisted
    const [persisted] = await db.select().from(schema.users).where(eq(schema.users.email, testEmail));
    expect(persisted).toBeUndefined();
  });
});
