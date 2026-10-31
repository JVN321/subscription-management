# Deployment Procedures & Operational Runbooks

> **Status: Confirmed Operations Guide**
>
> Step-by-step procedures for deployments, zero-downtime database migrations, incident response, and billing failure recovery.

---

## Runbook 1: Standard Production Deployment

### Objective: Deploy a new release of `web`, `api`, and `worker` with zero downtime.

```bash
# 1. Pull latest verified git release
git pull origin main

# 2. Build production Docker images
docker compose build web api worker

# 3. Run pending database migrations
docker compose run --rm api pnpm --filter @repo/db db:migrate

# 4. Gracefully restart workers (workers finish active jobs before swapping)
docker compose stop worker
docker compose up -d worker

# 5. Restart API and Web services
docker compose up -d --no-deps web api

# 6. Verify health probes
curl -f http://localhost:3001/api/v1/ready || echo "Deployment Healthcheck Failed!"
```

---

## Runbook 2: Safe Database Migration Execution

### Objective: Apply schema alterations without locking tables or degrading traffic.

1. **Rule**: Schema migrations must be backwards-compatible (expand-and-contract pattern). Never rename or drop columns in a single release.
2. **Procedure**:
   ```bash
   # Test migration on staging copy first:
   pnpm --filter @repo/db db:migrate

   # In production:
   docker compose exec api pnpm --filter @repo/db db:migrate
   ```
3. **Rollback**: If a migration fails, inspect `packages/db/migrations/` and apply the corresponding reverse SQL migration.

---

## Runbook 3: Handling Stuck or Dead-Letter BullMQ Jobs

### Objective: Inspect, diagnose, and replay failed background jobs.

1. **Check Queue Health via CLI**:
   ```bash
   # Connect to Redis CLI inside container:
   docker compose exec redis redis-cli

   # Check failed job count on invoices queue:
   LLEN bull:invoices:failed
   ```
2. **Inspect Job Failure Reasons**:
   ```bash
   # Retrieve details of latest failed job:
   HGETALL bull:invoices:1234
   ```
3. **Replay Failed Jobs via API / Worker**:
   Execute the worker replay script:
   ```bash
   docker compose exec worker node dist/scripts/retry-failed-jobs.js --queue invoices
   ```

---

## Runbook 4: Emergency Pause of Automated Billing

### Objective: Halt all automated invoice generation if a tax calculation or discount bug is detected.

1. **Option A: Halt Worker Service**:
   ```bash
   docker compose stop worker
   ```
   *(API and customer portal remain fully accessible; only background queues pause).*
2. **Option B: Pause Specific Queue via Redis CLI**:
   ```bash
   docker compose exec redis redis-cli LPUSH bull:billing:meta "paused"
   ```
3. **Resume Billing**:
   ```bash
   docker compose start worker
   ```

---

## Runbook 5: Regenerating Missing or Corrupted Invoice PDFs

### Objective: Re-render and re-stream an invoice PDF if the file on the host drive was removed.

1. Trigger manual generation for invoice `INV-2026-0812`:
   ```bash
   docker compose exec worker node dist/scripts/regenerate-pdf.js --invoiceId INV-2026-0812
   ```
2. Verify the output file exists on the host mount:
   ```bash
   ls -la data/media/invoices/INV-2026-0812.pdf
   ```

---

## Runbook 6: Correcting Misallocated Customer Payments

### Objective: Reverse a recorded payment applied to the wrong invoice.

1. Locate payment UUID from `payments` table.
2. In Drizzle / psql:
   ```sql
   BEGIN;
   -- 1. Void payment record
   UPDATE payments SET notes = notes || ' [REVERSED]', amount = 0 WHERE id = 'PAYMENT_UUID';
   -- 2. Recalculate invoice amount_paid and revert status to CONFIRMED
   UPDATE invoices 
   SET amount_paid = (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = 'INVOICE_UUID'),
       status = 'CONFIRMED'
   WHERE id = 'INVOICE_UUID';
   COMMIT;
   ```
3. Invalidate Redis dashboard cache:
   ```bash
   docker compose exec redis redis-cli DEL cache:dashboard:summary
   ```
