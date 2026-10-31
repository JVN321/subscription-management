# Scalability & Performance Strategy

> **Status: Confirmed Performance Engineering Blueprint**
>
> Architectural patterns and database optimizations ensuring sub-2-second page response times across thousands of active subscriptions and high-volume billing runs.

---

## 1. Performance Target & Budget

- **Target**: Every dashboard view, collection query, and invoice lookup must complete and render in **under 2.0 seconds** with 10,000+ active subscriptions.
- **API Response Budget**: Under 250ms for 95th percentile (P95) API requests.
- **Frontend SSR Budget**: Under 500ms to first byte (TTFB) on SSR page loads.

---

## 2. PostgreSQL Relational Query Optimizations

### 2.1 Targeted Composite Indexing
Avoid creating indexes arbitrarily on single columns. Build composite indexes tailored to specific query patterns:

```sql
-- Fast lookup for daily recurring billing scan:
CREATE INDEX idx_subscriptions_active_billing 
ON subscriptions (status, next_billing_date) 
WHERE status = 'ACTIVE';

-- Overdue invoice detection query:
CREATE INDEX idx_invoices_overdue 
ON invoices (status, due_date, amount_paid, total_amount) 
WHERE status = 'CONFIRMED';

-- Customer portal listing:
CREATE INDEX idx_subscriptions_customer_status 
ON subscriptions (customer_id, status, created_at DESC);
```

### 2.2 Cursor-Based Pagination
For large collections (invoices, subscriptions, audit logs), avoid `OFFSET ... LIMIT` which degrades quadratically on large offsets ($O(N)$ scan).
Instead, use **keyset/cursor pagination** indexed on `(created_at, id)`:
```sql
SELECT * FROM invoices
WHERE (created_at, id) < ($cursor_created_at, $cursor_id)
ORDER BY created_at DESC, id DESC
LIMIT 50;
```

### 2.3 Database-Side Aggregations
Financial dashboards must never load thousands of subscription records into Node.js application memory to compute sums. Always aggregate in PostgreSQL:
```sql
SELECT 
    COUNT(*) FILTER (WHERE status = 'ACTIVE') AS active_subscriptions,
    COALESCE(SUM(total_amount) FILTER (WHERE status = 'PAID'), 0) AS total_revenue,
    COALESCE(SUM(total_amount - amount_paid) FILTER (WHERE status = 'CONFIRMED'), 0) AS amount_owed,
    COUNT(*) FILTER (WHERE status = 'CONFIRMED' AND due_date < NOW()) AS overdue_invoices
FROM invoices;
```

---

## 3. Redis Caching Architecture

### 3.1 Cache Strategy: Cache-Aside with Invalidation
Expensive dashboard summary aggregations are cached in Redis with a short TTL (e.g., 60 seconds) or explicitly invalidated upon state changes.

```text
Key Format:
cache:dashboard:summary
cache:products:list
cache:customer:{customerId}:summary
```

### 3.2 Invalidation on Mutation
When a payment is recorded or an invoice confirmed:
1. Complete the database transaction.
2. Invalidate `cache:dashboard:summary`.
3. If Redis fails or is flushed, the next request rebuilds from PostgreSQL transparently.

---

## 4. Connection Pooling

- **PostgreSQL Pool**: Maintain a bounded connection pool in `packages/db` using `pg.Pool` or `postgres.js`:
  - `apps/api`: Pool max 20 connections.
  - `apps/worker`: Pool max 10 connections.
  - Set idle timeout to 30s and query timeout to 10s to prevent stuck queries from locking connections.
- **Redis Connection**: Shared singleton pool with connection retry backoffs.

---

## 5. BullMQ Job Concurrency & Batch Processing

- Billing batch jobs are chunked into batches of 100 subscriptions per worker sub-job.
- Workers run with a concurrency limit of 5-10 parallel jobs per process to maintain predictable CPU and memory profiles without starving the database pool.
