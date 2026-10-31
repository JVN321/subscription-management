# Requirements Traceability Matrix

> **Status: Complete Baseline Mapping**
>
> Maps all product requirements from `Subscription_Management_System.pdf` and architectural handoff constraints to documentation artifacts, domain models, and API specifications.

---

## 1. Traceability Matrix

| Req ID | Requirement Description | Source Scene / Section | Primary Domain Doc | Data Model / Schema | API Endpoint / Route | Job / Worker |
|---|---|---|---|---|---|---|
| **REQ-AUTH-01** | Unique email per account, password validation (>8 chars, uppercase, lowercase, special char) | Scene 1 (Signup) | [users-and-roles.md](../03-domain/users-and-roles.md) | `users` table | `POST /api/v1/auth/sign-up/email` | — |
| **REQ-AUTH-02** | Password reset via email link | Scene 1 (Signup) | [users-and-roles.md](../03-domain/users-and-roles.md) | `sessions`, `verifications` | `POST /api/v1/auth/forget-password` | `email.send_password_reset` |
| **REQ-AUTH-03** | 3 Distinct roles: Admin (all), Staff (operations), Customer (own portal) | Scene 1 (Signup) | [users-and-roles.md](../03-domain/users-and-roles.md) | `users.role` | Auth middleware guards | — |
| **REQ-AUTH-04** | Only Admin can create staff accounts | Scene 1 (Signup) | [users-and-roles.md](../03-domain/users-and-roles.md) | `users` | `POST /api/v1/staff` (Admin guard) | — |
| **REQ-CAT-01** | Products with name, type, sales price, cost price, and notes | Scene 2 (Catalog) | [products-and-variants.md](../03-domain/products-and-variants.md) | `products` | `POST /api/v1/products` | — |
| **REQ-CAT-02** | Product variants with price adjustments (e.g., Odoo brand adds +560) | Scene 2 (Catalog) | [products-and-variants.md](../03-domain/products-and-variants.md) | `product_variants` | `POST /api/v1/products/:id/variants` | — |
| **REQ-CAT-03** | Plans with daily, weekly, monthly, yearly billing intervals | Scene 2 (Plans) | [plans.md](../03-domain/plans.md) | `plans` | `POST /api/v1/plans` | — |
| **REQ-CAT-04** | Plan rules: min quantity, available date windows | Scene 2 (Plans) | [plans.md](../03-domain/plans.md) | `plans` | `POST /api/v1/plans` | — |
| **REQ-CAT-05** | Plan lifecycle: auto-close, early close, pause/resume, and renewal | Scene 2 (Plans) | [plans.md](../03-domain/plans.md) | `plans`, `subscriptions` | `PATCH /api/v1/subscriptions/:id/status` | `subscription.process_expiry` |
| **REQ-QTE-01** | Quotation templates with preset plans and product line items | Scene 3 (Quotes) | [quotations.md](../03-domain/quotations.md) | `quotation_templates` | `GET/POST /api/v1/quotation-templates` | — |
| **REQ-QTE-02** | Quotation validity periods (expiration dates) | Scene 3 (Quotes) | [quotations.md](../03-domain/quotations.md) | `quotations.expires_at` | `GET /api/v1/quotations/:id` | `quotation.check_expired` |
| **REQ-QTE-03** | Zero-duplication conversion of accepted quote into subscription | Scene 3 (Quotes) | [quotations.md](../03-domain/quotations.md) | `quotations`, `subscriptions` | `POST /api/v1/quotations/:id/convert` | — |
| **REQ-SUB-01** | Subscription structure: unique number, customer, plan, dates, payment terms, line items | Scene 3 (Quotes) | [subscriptions.md](../03-domain/subscriptions.md) | `subscriptions`, `subscription_lines` | `GET/POST /api/v1/subscriptions` | — |
| **REQ-SUB-02** | Subscription lifecycle: `Draft -> Quotation -> Confirmed -> Active -> Closed` | Scene 3 (Quotes) | [subscriptions.md](../03-domain/subscriptions.md) | `subscriptions.status` | `PATCH /api/v1/subscriptions/:id/status` | `billing.scan_due` |
| **REQ-BIL-01** | Automated bulk billing scan for due subscriptions | Scene 4 (Billing) | [billing-and-invoices.md](../03-domain/billing-and-invoices.md) | `billing_runs`, `invoices` | `POST /api/v1/billing/trigger` | `billing.scan_due_cron` |
| **REQ-BIL-02** | Automatic tax calculation based on admin tax rules | Scene 4 (Billing) | [taxes-and-discounts.md](../03-domain/taxes-and-discounts.md) | `taxes`, `invoice_lines` | Internal billing service | — |
| **REQ-BIL-03** | Duplicate-proof billing guarantee (idempotency by subscription + period) | Scene 4 (Billing) | [billing-and-invoices.md](../03-domain/billing-and-invoices.md) | Unique index on `(subscription_id, billing_period_start)` | Worker execution | `billing.generate_invoice` |
| **REQ-INV-01** | Invoice lifecycle: `Draft -> Confirmed -> Paid` | Scene 4 (Billing) | [billing-and-invoices.md](../03-domain/billing-and-invoices.md) | `invoices.status` | `PATCH /api/v1/invoices/:id/status` | — |
| **REQ-INV-02** | Invoice operations: confirm, cancel, send email, print/download PDF | Scene 4 (Billing) | [billing-and-invoices.md](../03-domain/billing-and-invoices.md) | `invoices` | `GET /api/v1/invoices/:id/pdf` | `pdf.generate_invoice`, `email.send_invoice` |
| **REQ-DSC-01** | Admin-created discount rules: fixed amount or percentage | Scene 5 (Discounts) | [taxes-and-discounts.md](../03-domain/taxes-and-discounts.md) | `discounts` | `POST /api/v1/discounts` | — |
| **REQ-DSC-02** | Discount criteria: min purchase, min quantity, date windows, max usage limits | Scene 5 (Discounts) | [taxes-and-discounts.md](../03-domain/taxes-and-discounts.md) | `discounts` | `POST /api/v1/discounts` | — |
| **REQ-DSC-03** | Product-specific or whole-subscription discount scope | Scene 5 (Discounts) | [taxes-and-discounts.md](../03-domain/taxes-and-discounts.md) | `discount_applications` | Billing calculation service | — |
| **REQ-DSC-04** | Auto-application on next invoice and automatic stop on expiry/limit | Scene 5 (Discounts) | [taxes-and-discounts.md](../03-domain/taxes-and-discounts.md) | `discounts.times_used` | Billing calculation service | `billing.generate_invoice` |
| **REQ-PAY-01** | Record payments against invoices: method, amount, date, and note | Scene 6 (Payments) | [payments.md](../03-domain/payments.md) | `payments` | `POST /api/v1/invoices/:id/payments` | — |
| **REQ-PAY-02** | Display total paid, outstanding balance, and overdue flags | Scene 6 (Payments) | [payments.md](../03-domain/payments.md) | `invoices.amount_paid`, `outstanding_amount` | `GET /api/v1/invoices` | `reminder.check_overdue` |
| **REQ-REP-01** | Finance dashboard: active subscriptions, revenue, amount owed, overdue list | Scene 7 (Reporting) | [reporting.md](../03-domain/reporting.md) | Materialized/Aggregated SQL views | `GET /api/v1/reports/summary` | `reports.refresh_aggregates` |
| **REQ-REP-02** | Sub-2-second response time across thousands of subscriptions | Scene 7 (Reporting) | [scalability-and-performance.md](../01-architecture/scalability-and-performance.md) | Optimized composite B-Tree indexes | All collection endpoints | Redis cache fallback |

---

## 2. Cross-Document Reference Links

- Full domain models: [domain-model.md](../03-domain/domain-model.md)
- Complete database schemas: [database-design.md](../04-data/database-design.md)
- API endpoint definitions: [endpoint-catalog.md](../05-api/endpoint-catalog.md)
- Job definitions: [job-catalog.md](../06-jobs/job-catalog.md)
