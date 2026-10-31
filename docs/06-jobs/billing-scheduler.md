# Billing Scheduler & Recurring Triggers

> **Status: Active Prototype (In-Process) + Production Blueprint (BullMQ)**
>
> Automated schedule definitions, timezone boundary management, and safe recurring execution.

---

## 1. Prototype In-Process Scheduler (`apps/api/src/scheduler.ts`)

For the prototype, an in-process recurring scheduler triggers automated billing scans every 30 seconds without requiring external worker daemons:

```typescript
// apps/api/src/scheduler.ts
import { BillingService } from '@repo/domain';

export function startBillingScheduler(intervalSeconds: number = 30) {
  schedulerTimer = setInterval(async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    await BillingService.runBillingScan(todayStr);
  }, intervalSeconds * 1000);
}
```

Key Safety Guarantees:
- **Transaction-Level Advisory Lock**: Acquires `SELECT pg_try_advisory_xact_lock(89214)` inside `db.transaction`, guaranteeing that overlapping runs across API instances or background workers are skipped safely.
- **Idempotent Invoicing**: Checks existing records and relies on the PostgreSQL unique constraint `UNIQUE(subscription_id, billing_period_start)` to eliminate duplicate invoice generation.
- **Pure Domain Decoupling**: `BillingService` resides in `@repo/domain`, completely independent of the scheduler.

---

## 2. Production BullMQ Repeatable Job Definition (Deferred Scale-Out)

For distributed production clusters, BullMQ repeatable jobs invoke the exact same pure `BillingService`:

```typescript
// Recurring daily midnight billing scan (UTC):
await billingQueue.add(
  'scan_due_subscriptions',
  { triggerType: 'SCHEDULED' },
  {
    repeat: {
      pattern: '0 0 * * *', // Every midnight UTC
      tz: 'UTC'
    },
    jobId: 'daily-billing-scan'
  }
);

// Daily overdue payment check at 06:00 UTC:
await billingQueue.add(
  'check_overdue_invoices',
  { triggerType: 'SCHEDULED' },
  {
    repeat: {
      pattern: '0 6 * * *',
      tz: 'UTC'
    },
    jobId: 'daily-overdue-check'
  }
);
```

---

## 3. Timezone Policy & Cutoff Rules

- **Universal UTC Execution**: All recurring job schedules, subscription date comparisons, and billing due dates are computed and stored in **UTC**.
- **Customer Local Timezone Invariant**: Where customer contracts specify billing on their local midnight, `subscriptions.billing_timezone` is stored (e.g. `America/New_York`, `Asia/Kolkata`), and the billing scan evaluates whether the subscription's next billing date has arrived relative to that timezone.
- **Leap Year and Month-End Handling**: For monthly plans starting on the 29th, 30th, or 31st, billing on shorter months (such as February) automatically aligns to the final calendar day of that month.
