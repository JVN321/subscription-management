# Database Design Principles & Conventions

> **Status: Confirmed Relational Standard**
>
> PostgreSQL schema architecture, naming standards, constraints, and audit conventions for `packages/db`.

---

## 1. Relational Principles

1. **PostgreSQL as Authoritative Source of Truth**: All persistent entities, states, balances, and history reside strictly in PostgreSQL 16.
2. **Explicit Foreign Key Constraints**: All relationships must declare foreign key constraints with explicit `ON DELETE` behavior (`ON DELETE RESTRICT` or `ON DELETE CASCADE` where aggregate ownership applies).
3. **Auditability**: Every table includes `created_at` and `updated_at` timestamps defaulting to `NOW()` in UTC.
4. **Soft Deactivation over Hard Deletion**: Financial and contractual records (products, plans, customers, subscriptions, invoices, payments) use `is_active` flags or lifecycle statuses; hard deletions are forbidden on operational records.

---

## 2. Naming Conventions

- **Tables**: Plural snake_case (e.g. `users`, `products`, `product_variants`, `invoices`, `invoice_lines`).
- **Columns**: Singular snake_case (e.g. `sales_price`, `due_date`, `customer_id`).
- **Primary Keys**: Always `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
- **Foreign Keys**: `{singular_table_name}_id` (e.g. `customer_id`, `plan_id`).
- **Indexes**: `idx_{table}_{column(s)}` (e.g. `idx_subscriptions_status_billing`).
- **Unique Constraints**: `uq_{table}_{column(s)}` (e.g. `uq_invoices_sub_period`).

---

## 3. Data Types Standard

- **UUIDs**: Native `UUID` generated via `gen_random_uuid()`.
- **Monetary Amounts**: PostgreSQL `NUMERIC(14, 4)` for exact arithmetic without floating-point inaccuracies.
- **Dates & Timestamps**: `TIMESTAMPTZ` (stored in UTC) for events; `DATE` for calendar dates without times (e.g. `due_date`, `billing_period_start`).
- **Booleans**: Native `BOOLEAN NOT NULL DEFAULT false`.
- **Enums**: PostgreSQL native `ENUM` or check-constrained text fields for strict typing.
- **Snapshots**: `JSONB` for immutable historical document states.
