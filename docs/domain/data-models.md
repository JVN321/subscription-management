# Data Models & Entity Relationships

> **Consolidated Schema Specification: 16 Drizzle PostgreSQL Tables & Lifecycle Enums**  
> **Platform:** Brightloop Subscription Management System  
> **Updated:** 2026-10-31

---

## 1. Core Entity Lifecycle States

```text
Quotation:      DRAFT ──> SENT ──> ACCEPTED ──> CONVERTED (Atomic 1-Click to Subscription)
Subscription:   DRAFT ──> CONFIRMED ──> ACTIVE <──> PAUSED ──> CLOSED
Invoice:        DRAFT ──> CONFIRMED ──> PAID (or CANCELLED)
Payment:        PENDING ──> SETTLED ──> CONFIRMED
```

---

## 2. Table Summary

| Table Name | Primary Key | Key Foreign Keys | Critical Invariants / Constraints |
|---|---|---|---|
| `users` | `uuid` | — | Unique `email`, `role` (`admin`, `staff`, `customer`) |
| `customers` | `uuid` | `user_id` -> `users.id` | Unique `email`, payment terms |
| `products` | `uuid` | — | `sales_price NUMERIC(14, 4)`, `cost_price NUMERIC(14, 4)` |
| `product_variants` | `uuid` | `product_id` -> `products.id` | Unique `sku`, `price_adjustment NUMERIC(14, 4)` |
| `plans` | `uuid` | — | `billing_interval` (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`) |
| `taxes` | `uuid` | — | `rate NUMERIC(14, 4)` |
| `discounts` | `uuid` | — | Unique `code`, `discount_type`, threshold criteria |
| `quotation_templates` | `uuid` | `default_plan_id` -> `plans.id` | Reusable quotation presets |
| `quotations` | `uuid` | `customer_id`, `plan_id` | Expiration date `expires_at`, 1-click conversion link |
| `quotation_lines` | `uuid` | `quotation_id`, `product_id` | Snapshotted unit price and calculated line total |
| `subscriptions` | `uuid` | `customer_id`, `plan_id` | `subscription_number`, `next_billing_date`, status |
| `subscription_lines`| `uuid` | `subscription_id`, `product_id` | Unit price, quantity, seat counts |
| `invoices` | `uuid` | `customer_id`, `subscription_id`| **`UNIQUE(subscription_id, billing_period_start)`** |
| `invoice_lines` | `uuid` | `invoice_id`, `product_id` | Itemized line totals and tax allocations |
| `payments` | `uuid` | `invoice_id` -> `invoices.id` | `amount NUMERIC(14, 4)`, payment method |
| `billing_runs` | `uuid` | — | Execution timestamps, generated and skipped counts |
