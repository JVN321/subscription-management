# Jobs & Background Processing: BullMQ & Redis

> **Status: Confirmed Architecture**
>
> Asynchronous job queues, scheduled recurring billing runs, worker process lifecycle, and Redis configuration safeguards.

---

## 1. Role & Technology Overview

**BullMQ** backed by **Redis 7** manages all asynchronous background tasks, batch billing calculations, PDFKit invoice generation, email dispatch, and overdue invoice reminders.

Key Operational Guarantees:
- **At-Least-Once Execution**: Jobs are designed to be idempotent; re-running a job must not duplicate invoices or financial records.
- **Queue vs Cache Separation**: Redis keys for BullMQ (prefixed with `bull:*`) are isolated from application cache keys (`cache:*`).
- **Noeviction Policy**: Redis is configured with `--maxmemory-policy noeviction` to ensure pending background jobs are never dropped under memory pressure.

---

## 2. Queue Topology

```mermaid
graph TD
    subgraph Producers ["Job Producers (apps/api & Schedulers)"]
        PROD_API["apps/api Route Handlers"]
        PROD_CRON["BullMQ Repeatable Scheduler"]
    end

    subgraph RedisBroker ["Redis 7 (Broker & State)"]
        Q_BILLING["Queue: billing"]
        Q_INVOICES["Queue: invoices"]
        Q_PDF["Queue: pdf"]
        Q_EMAIL["Queue: email"]
        Q_REPORTS["Queue: reports"]
    end

    subgraph Consumers ["Job Workers (apps/worker)"]
        W_BILLING["Billing Processor"]
        W_INVOICE["Invoice Processor"]
        W_PDF["PDFKit Render Worker"]
        W_EMAIL["Resend Email Worker"]
        W_REPORTS["Report Aggregator"]
    end

    PROD_CRON -->|Daily Midnight UTC| Q_BILLING
    PROD_API -->|Manual Trigger / Enqueue| Q_BILLING
    PROD_API -->|Password Reset / Quote| Q_EMAIL

    Q_BILLING --> W_BILLING
    W_BILLING -->|Spawns Sub-Jobs| Q_INVOICES

    Q_INVOICES --> W_INVOICE
    W_INVOICE -->|Enqueues PDF| Q_PDF
    W_INVOICE -->|Enqueues Email| Q_EMAIL

    Q_PDF --> W_PDF
    Q_EMAIL --> W_EMAIL
    Q_REPORTS --> W_REPORTS
```

---

## 3. Worker Implementation Pattern

Workers in `apps/worker` follow strict error-handling and backoff patterns:

```typescript
import { Worker, Job } from 'bullmq';
import { redisConnection } from '@repo/config';
import { BillingService } from '@repo/domain';

export const billingWorker = new Worker(
  'billing',
  async (job: Job) => {
    switch (job.name) {
      case 'scan_due_subscriptions':
        return await BillingService.scanAndEnqueueDueSubscriptions(job.data.billingDate);
      case 'generate_subscription_invoice':
        return await BillingService.processSubscriptionBilling(job.data.subscriptionId, job.data.billingPeriod);
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
    limiter: { max: 50, duration: 1000 }
  }
);
```

---

## 4. Job Options & Retry Strategy

All background jobs define bounded retries with exponential backoff:

```typescript
export const defaultJobOptions = {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 2000 // 2s, 4s, 8s, 16s, 32s
  },
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 5000 }
};
```
