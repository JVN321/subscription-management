# Plans & Billing Intervals

> **Status: Confirmed Domain Specification**
>
> Commercial plan rules, recurring intervals, minimum quantities, availability windows, and lifecycle policies.

---

## 1. Plan Overview

A **Plan** specifies how and when products are billed. A plan is linked to subscriptions and dictates the recurring billing schedule and lifecycle constraints.

### Core Plan Attributes
- `id`: Unique UUID.
- `name`: Commercial plan title (e.g. "Monthly Starter", "Annual Enterprise", "Daily Trial").
- `billing_interval`: Recurrence frequency:
  - `DAILY`: Invoiced every 24 hours.
  - `WEEKLY`: Invoiced every 7 days.
  - `MONTHLY`: Invoiced once per calendar month on the agreed billing day.
  - `YEARLY`: Invoiced once every 12 calendar months.
- `interval_count`: Multiplier for the interval (default: `1`, allowing bi-monthly when set to 2).
- `min_quantity`: Minimum unit or seat count required when subscribing (e.g., minimum 5 seats).
- `available_from`: Starting date when the plan becomes available for quotation.
- `available_to`: Ending date after which new quotes cannot select this plan (null = indefinitely available).

---

## 2. Plan Lifecycle Policies

Admins configure operational policies on a plan-by-plan basis:

| Policy Field | Type | Description |
|---|---|---|
| `auto_close` | Boolean | If `true`, the subscription automatically terminates when the term ends instead of renewing. |
| `allow_early_close` | Boolean | If `true`, staff or customers can terminate the subscription prior to its contracted end date. |
| `allow_pause` | Boolean | If `true`, the subscription can be temporarily paused, freezing billing runs until resumed. |
| `allow_renewal` | Boolean | If `true`, the subscription generates a renewal term or extends automatically at the end date. |

---

## 3. Date & Timezone Alignment

- Recurring billing intervals calculate target due dates using UTC timestamps.
- For monthly intervals, if the subscription start date is on the 31st, subsequent months without a 31st day bill on the final day of the month (e.g. Feb 28/29, April 30).
