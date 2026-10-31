# Background Job Catalog

> **Status: Confirmed Job Specifications**
>
> Complete index of all background tasks, queue assignments, payloads, and concurrency settings for `apps/worker`.

---

## 1. Complete Job Catalog

| Job Name | Queue | Trigger Source | Payload Schema | Concurrency | Retries & Backoff |
|---|---|---|---|:---:|---|
| `billing.scan_due` | `billing` | BullMQ Cron (`0 0 * * *`) or API manual trigger | `{ targetDate?: string }` | 1 | 3 attempts, 5s delay |
| `billing.generate_invoice` | `invoices` | Dispatched by `billing.scan_due` | `{ subscriptionId: string, billingDate: string }` | 10 | 5 attempts, exponential |
| `pdf.generate_invoice` | `pdf` | Dispatched after invoice confirmation | `{ invoiceId: string }` | 5 | 3 attempts, 2s delay |
| `pdf.generate_quotation` | `pdf` | Dispatched upon quote finalization | `{ quotationId: string }` | 5 | 3 attempts, 2s delay |
| `email.send_invoice` | `email` | Dispatched after PDF generation | `{ invoiceId: string, recipientEmail: string }` | 10 | 5 attempts, exponential |
| `email.send_password_reset`| `email` | Triggered by auth controller | `{ email: string, resetUrl: string }` | 10 | 3 attempts, exponential |
| `reminder.check_overdue` | `billing` | Daily Cron (`0 6 * * *`) | `{ checkDate: string }` | 1 | 3 attempts, 5s delay |
| `reports.refresh_cache` | `reports` | Triggered on payment or cron | None | 2 | 2 attempts, immediate |

---

## 2. Job Payload Guidelines

- **Keep Payloads Small**: Only pass UUID identifiers (`subscriptionId`, `invoiceId`) and date strings in BullMQ job data.
- **Never Store Secrets in Payloads**: Avoid including customer credit card details, full passwords, or sensitive PII in Redis queue data.
- **Always Read Authoritative State in Worker**: When the worker activates, it loads the current state from PostgreSQL 16 to avoid operating on stale or invalidated state.
