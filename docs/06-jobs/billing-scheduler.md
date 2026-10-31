# Billing Scheduler & Recurring Triggers

> **Status: Confirmed Architecture**
>
> Automated schedule definitions, timezone boundary management, and safe recurring execution.

---

## 1. Scheduler Definition

BullMQ's repeatable job scheduler manages periodic cron tasks:

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

## 2. Timezone Policy & Cutoff Rules

- **Universal UTC Execution**: All recurring job schedules, subscription date comparisons, and billing due dates are computed and stored in **UTC**.
- **Customer Local Timezone Invariant**: Where customer contracts specify billing on their local midnight, `subscriptions.billing_timezone` is stored (e.g. `America/New_York`, `Asia/Kolkata`), and the billing scan evaluates whether the subscription's next billing date has arrived relative to that timezone.
- **Leap Year and Month-End Handling**: For monthly plans starting on the 29th, 30th, or 31st, billing on shorter months (such as February) automatically aligns to the final calendar day of that month.
