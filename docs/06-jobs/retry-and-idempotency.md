# Retry Policies & Job Idempotency

> **Status: Confirmed Architecture**
>
> Dead letter handling, exponential backoff, jitter, and duplicate prevention strategies for BullMQ jobs.

---

## 1. Idempotency Keys in BullMQ

To guarantee that duplicate network dispatches or rapid retries do not spawn duplicate operations, BullMQ jobs use deterministic custom job IDs:

```typescript
// Job ID format:
const jobId = `invoice:${subscriptionId}:${billingPeriodStart}`;

await invoicesQueue.add(
  'generate_invoice',
  { subscriptionId, billingPeriodStart },
  { jobId } // BullMQ silently ignores addition if a job with this ID already exists
);
```

---

## 2. Exponential Backoff & Transient Failure Strategy

1. **Transient Errors**: Network timeouts to Resend or transient database connection resets trigger exponential backoff:
   $$\text{Delay} = \text{Initial Delay} \times 2^{\text{Attempt}} + \text{Random Jitter}$$
2. **Permanent Business Errors**: If an entity is missing or a validation rule fails (e.g. invalid customer address), the worker throws an `UnrecoverableError`, signaling BullMQ to move the job directly to the failed queue without wasting retry attempts.
3. **Dead Letter Queue (DLQ)**:
   - Failed jobs are retained in Redis for 7 days (`removeOnFail: { count: 5000, age: 7 * 86400 }`).
   - Staff can inspect failed jobs via an operational dashboard or CLI runbook and trigger a replay after fixing root causes.
