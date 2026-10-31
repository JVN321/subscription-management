# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

1. **Finance & Billing Administrators**: Managing billing cycles, reviewing automatic invoice generation, monitoring Accounts Receivable and MRR, and auditing transaction integrity.
2. **Sales & Operations Staff**: Generating multi-tier quotes, applying brand variant adjustments (+560 Odoo brand), and executing 1-click conversion of accepted quotes into active subscriptions.
3. **Enterprise Customers (Self-Service)**: Viewing active subscription plans, reviewing upcoming billing dates, and downloading official vector PDF invoices.

## Product Purpose

Brightloop is an industrial-grade subscription management and automated recurring billing system designed for absolute data integrity, zero duplicate invoice generation, and deterministic financial operations.

## Positioning

Unlike bloated, opaque SaaS billing tools or over-engineered distributed microservice frameworks, Brightloop provides an ultra-reliable, transactionally sound modular architecture. It leverages PostgreSQL transaction advisory locks, zero floating-point money handling (`NUMERIC(14, 4)`), and an industrial instrument-panel interface tailored for speed, scanability, and operational certainty.

## Operating Context

- Desktop-first high-density financial operations console with responsive adaptation for tablets.
- Runs in Docker containers (PostgreSQL 16 on port 5433, Hono API on port 3001, Web on port 3000).
- Pure, decoupled billing engine (`BillingService`) operable both via lightweight in-process scheduler and future BullMQ background workers.

## Capabilities and Constraints

- **Catalog & Pricing**: Software products, custom brand variant pricing (e.g., Odoo Enterprise +560 adjustment), billing interval plans (daily, weekly, monthly, yearly), minimum quantities, pause rules, auto-close expiration.
- **Quotation Lifecycle**: Multi-line quotes with configurable validity periods and zero-duplication atomic conversion into subscriptions.
- **Automatic Scheduled Billing**: Recurring scan evaluating due dates, applying taxes (VAT 20%) and volume discounts (Scene 5), advancing billing dates, and inserting immutable invoice snapshots inside PostgreSQL transactions.
- **Concurrency & Idempotency**: PostgreSQL advisory locks (`pg_try_advisory_xact_lock(89214)`) and composite unique constraints (`(subscription_id, billing_period_start)`) guaranteeing no double billing.
- **Accounts Receivable & Reconciliation**: Recording payments (Wire, Credit Card, Bank Check), partial payments, balance due calculations, and PDF generation with PDFKit.

## Brand Commitments

- **Aesthetic**: Industrial Precision Design Language.
- **Palette**: Precision Safety Orange (`#FF6B00`), Pure White (`#FFFFFF`), Deep Pitch Black (`#000000`), Neutral Technical Grays (`#E5E5E5`, `#E1E1E0`, `#9D9D9D`).
- **Typography**: Lufga modern geometric grotesque paired with JetBrains Mono for financial amounts, invoice numbers, and timestamps.
- **Anti-Slop Guarantees**: Zero emojis, zero gradients, zero glassmorphism blur traps, flat thin outlines (`1px`), compact circular controls, and physical instrument-panel density.

## Evidence on Hand

- Problem statement and test dataset specification in `docs/resources/Subscription_Management_System.pdf`.
- Reference visual language in `reference.png` (Lufga font geometry, orange/white/black swatches, flat outline cards).
- 21 automated tests passing across domain, database, and API layers.

## Product Principles

1. **Precision Over Decoration**: Every pixel, border, and badge serves an informational purpose; omit all gratuitous visual noise.
2. **Information Density with Zero Clutter**: Surface critical financial metrics and line items in compact, high-contrast tabular views without awkward card nesting.
3. **Deterministic Financial Guarantees**: Never use JavaScript floating-point numbers for money; enforce business rules in database transactions.
4. **Physical Instrument Feel**: Clean mechanical structure, crisp segment dividers, compact circular action controls, and responsive micro-feedback.
