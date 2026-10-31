# Indexing & Query Strategy

> **Status: Confirmed Performance Standard**
>
> Indexing architectures, composite keys, partial indexes, and keyset pagination for sub-2-second response times.

---

## 1. Index Strategy Overview

Indexes are designed around actual query access patterns in `apps/api` and `apps/worker`.

### 1.1 Partial Indexes for Status Queues
PostgreSQL partial indexes are used for status-filtered queries, keeping the index size tiny and fast to scan:
```sql
-- Partial index for active recurring billing scans:
CREATE INDEX idx_sub_active_billing 
ON subscriptions (next_billing_date) 
WHERE status = 'ACTIVE';

-- Partial index for overdue unpaid invoices:
CREATE INDEX idx_inv_unpaid_overdue 
ON invoices (due_date, total_amount, amount_paid) 
WHERE status = 'CONFIRMED';
```

### 1.2 Composite Indexes for Customer Collections
```sql
-- Fast customer portal subscription list:
CREATE INDEX idx_sub_customer_created 
ON subscriptions (customer_id, created_at DESC);

-- Fast customer invoice list:
CREATE INDEX idx_inv_customer_created 
ON invoices (customer_id, created_at DESC);
```

---

## 2. Query Guidelines

1. **No `SELECT *` in Production APIs**: Specify explicit column selections in Drizzle queries to minimize network transfer and memory allocation.
2. **Avoid N+1 Queries**: Use relational joins (`with: { lines: true, customer: true }`) or batched loaders (`dataloader` pattern) rather than executing individual queries in loops.
3. **Analyze Query Plans**: Run `EXPLAIN ANALYZE` on any query that takes more than 50ms during development.
