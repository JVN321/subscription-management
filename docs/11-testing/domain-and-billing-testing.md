# Domain & Billing Engine Testing

> **Pure domain calculations, interval date projection, advisory locks, and idempotency**

---

## 1. Scope & Execution

The domain test suites (`packages/domain/test/pricing.test.ts` and `test/e2e-workflow.test.ts`) verify business logic independent of transport frameworks.

Run command:
```bash
pnpm --filter @repo/domain test
```

## 2. Invariants Tested

1. **Brand Variant Adjustments**:
   - Fixed dollar additions (e.g. Odoo Enterprise adding `$560.0000` to list price `$1,000.0000` yielding `$1,560.0000`).
   - Percentage adjustments (e.g. `+15%`).
2. **Volume & Promotional Discounts**:
   - Verifies minimum purchase amount thresholds, minimum seat quantity checks, and valid date intervals.
3. **Recurring Date Horizon Calculations**:
   - Accurate calendar alignment for `DAILY`, `WEEKLY`, `MONTHLY`, and `YEARLY` billing intervals.
4. **PostgreSQL Distributed Advisory Locking**:
   - `BillingService.runBillingScan` utilizes `pg_try_advisory_xact_lock(89214)` to prevent concurrent scans across multiple workers or API instances.
   - Tests verify that subsequent scan attempts within the same interval skip duplicates gracefully without crashing.
