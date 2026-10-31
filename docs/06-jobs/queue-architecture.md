# Queue Architecture & Worker Lifecycles

> **Status: Confirmed Background Architecture**
>
> BullMQ queue topology, worker processes, Redis connection safeguards, and thread concurrency.

---

## 1. Queue Topology Overview

`apps/worker` consumes jobs from five primary BullMQ queues backed by Redis 7:

```mermaid
graph TD
    subgraph BullMQQueues ["Redis BullMQ Queues"]
        Q_BILLING["bull:billing:id"]
        Q_INVOICES["bull:invoices:id"]
        Q_PDF["bull:pdf:id"]
        Q_EMAIL["bull:email:id"]
        Q_REPORTS["bull:reports:id"]
    end

    subgraph DedicatedWorkers ["apps/worker Process"]
        W1["Billing Worker (Concurrency: 5)"]
        W2["Invoice Generator (Concurrency: 10)"]
        W3["PDFKit Renderer (Concurrency: 5)"]
        W4["Email Dispatcher (Concurrency: 10)"]
        W5["Report Aggregator (Concurrency: 2)"]
    end

    Q_BILLING --> W1
    Q_INVOICES --> W2
    Q_PDF --> W3
    Q_EMAIL --> W4
    Q_REPORTS --> W5
```

---

## 2. Worker Lifecycle & Graceful Shutdown

Workers in `apps/worker` listen for system termination signals (`SIGTERM`, `SIGINT`):
1. Upon receiving `SIGTERM`, worker calls `worker.close()` to stop fetching new jobs from Redis.
2. In-flight jobs are granted a 30-second grace period to commit their current database transaction.
3. Unfinished jobs exceeding the grace period are returned to the queue via Redis atomic locks so another worker instance can pick them up upon restart.
