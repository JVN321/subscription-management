# Automated Billing Engine & Scheduler

> **Domain Specification: Recurring Billing Scan, Advisory Locks, and Idempotency**  
> **Platform:** Brightloop Subscription Management System  
> **Updated:** 2026-10-31

---

## 1. Billing Engine Architecture

The billing engine (`packages/domain/src/billing.service.ts`) executes automatic recurring invoice generation based on active subscription dates:

```
Every 60 Seconds (or Manual Scan via POST /api/v1/billing/trigger)
                           │
                           ▼
          Acquire Transaction Advisory Lock:
         pg_try_advisory_xact_lock(89214)
                           │
             ┌─────────────┴─────────────┐
        Lock Acquired               Lock Busy (Concurrent Scan)
             │                           │
             ▼                           ▼
    Query Subscriptions:             Skip Execution Safely
    status = 'ACTIVE'                (Returns generated: 0)
    AND next_billing_date <= today
             │
             ▼
    For Each Eligible Subscription:
      1. Calculate billing period (start to end date).
      2. Evaluate active discount rules (VOLUME10, etc.).
      3. Compute tax amounts with NUMERIC(14, 4) precision.
      4. Insert Invoice & Invoice Lines (Enforcing UNIQUE constraint).
      5. Advance Subscription next_billing_date by plan interval.
      6. Commit transaction (Releasing advisory lock automatically).
```

---

## 2. Invariant Protections

### 2.1 Double-Billing Prevention
- Unique constraint: `UNIQUE(subscription_id, billing_period_start)`.
- If an invoice already exists for that period, PostgreSQL raises error code `23505` (`unique_violation`), which the billing service catches and records as a safe skipped record.

### 2.2 Concurrency Safety
- `pg_try_advisory_xact_lock(89214)` prevents multiple workers from processing the same subscription scan simultaneously.
- Because it is a transaction-level lock (`xact_lock`), it automatically releases when the transaction commits or aborts.
