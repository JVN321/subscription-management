# Database Schema & Constraint Testing

> **PostgreSQL schema invariants, duplicate prevention constraints, and ACID transactions**

---

## 1. Scope & Execution

The database test suite (`packages/db/test/schema.test.ts`) verifies relational constraints directly against the running PostgreSQL 16 container (`brightloop_postgres_dev`).

Run command:
```bash
pnpm --filter @repo/db test
```

## 2. Invariants Tested

1. **Decimal Precision (`NUMERIC(14, 4)`)**:
   - Ensures money fields (`sales_price`, `cost_price`, `subtotal`, `total_amount`, `amount_paid`) store exact fractional amounts (e.g. `1560.1234`) without IEEE-754 floating-point drift.
2. **Duplicate Invoice Prevention Constraint**:
   - Verifies the composite unique index on `invoices (subscription_id, billing_period_start)`.
   - Explicitly tests that an attempt to insert duplicate billing records for the same period triggers a PostgreSQL `23505` unique violation.
3. **Transactional Integrity & Rollback**:
   - Executes multi-step operations inside `db.transaction(async (tx) => { ... })`.
   - Injects simulated runtime failures and verifies that all mutated records roll back cleanly, leaving zero orphaned data.
