# Data Integrity & Transactional Boundaries

> **Status: Confirmed Architecture**
>
> ACID transaction guarantees, row-level concurrency locking, idempotency safeguards, and race condition prevention.

---

## 1. Transaction Boundaries

All mutations spanning multiple database tables or affecting financial balances MUST be executed within an explicit database transaction (`db.transaction`):

```typescript
await db.transaction(async (tx) => {
  // 1. Lock invoice row to prevent concurrent payment double-counting
  const [invoice] = await tx
    .select()
    .from(invoices)
    .where(eq(invoices.id, invoiceId))
    .for('update');

  // 2. Compute new balance
  const updatedAmountPaid = new Decimal(invoice.amountPaid).plus(paymentAmount);
  const newStatus = updatedAmountPaid.gte(invoice.totalAmount) ? 'PAID' : 'CONFIRMED';

  // 3. Record payment
  await tx.insert(payments).values({ invoiceId, amount: paymentAmount, ... });

  // 4. Update invoice balance and status
  await tx.update(invoices).set({ amountPaid: updatedAmountPaid.toFixed(4), status: newStatus });
});
```

---

## 2. Concurrency Controls & Row Locking

- **Pessimistic Row Locking (`SELECT ... FOR UPDATE`)**:
  - Used during:
    1. Converting quotations to subscriptions (`FOR UPDATE` on `quotations.id`).
    2. Applying payments to invoices (`FOR UPDATE` on `invoices.id`).
    3. Generating recurring invoices for a subscription.
- **Unique Database Constraints as the Final Defense**:
  - `UNIQUE (subscription_id, billing_period_start)` prevents duplicate billing even if two worker processes trigger concurrently.
  - `UNIQUE (quote_number)` and `UNIQUE (subscription_number)`.
  - `UNIQUE (email)` on users and customers.
