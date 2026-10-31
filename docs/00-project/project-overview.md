# Project Overview: Brightloop Subscription Management

> **Status: Confirmed Foundation**
>
> Centralized subscription lifecycle, automated recurring billing, financial tracking, and operational visibility for Brightloop Software.

---

## 1. Executive Summary

Brightloop Software provides subscription-based software and digital services billed on daily, weekly, monthly, and yearly intervals. Previously, subscription management suffered from significant operational friction:
- Customer records and subscriptions were manually tracked in spreadsheets.
- Invoicing was typed by hand every month, leading to missed billing cycles and calculation errors.
- Payments were matched against invoices manually from bank statements.
- Revenue metrics and overdue accounts required days of spreadsheet reconciliation.

The **Brightloop Subscription Management Platform** replaces this fragile manual workflow with an automated, modular TypeScript system that guarantees billing accuracy, eliminates missed revenue, and provides sub-2-second operational dashboards.

---

## 2. Core Stakeholders and Personas

| Role | Responsibility | System Needs |
|---|---|---|
| **Admin** | System configuration and security lead | Manages products, variants, pricing, tax rules, discount criteria, and staff accounts. Oversees financial integrity. |
| **Staff / Sales** | Operations and sales representatives | Generates quotes from templates, manages subscription lifecycles, runs or reviews billing cycles, and records payments. |
| **Customer** | End-user / subscriber | Self-service portal to view active plans, line items, invoice histories, download PDFs, and update profile details. |
| **Finance Lead** | Financial analyst & controller | Unified real-time reporting on active subscriptions, recurring revenue (MRR/ARR), outstanding balances, and aging overdue invoices. |

---

## 3. High-Level Capabilities

1. **Catalog & Pricing Engine**:
   - Multi-tier product configurations with product variants (e.g., brand-level price adjustments such as Odoo +560).
   - Configurable billing intervals (daily, weekly, monthly, yearly), minimum order quantities, and availability windows.
   - Dynamic plan policies (auto-closing, early termination, pausing, and renewal).
2. **Sales & Quotation Conversion**:
   - Template-driven quotation generation with preset line items and expiration dates.
   - One-click, idempotent conversion of accepted quotations into active subscriptions.
3. **Automated Recurring Billing Engine**:
   - Batch billing scans detecting subscriptions due for invoicing on any given day.
   - Automated tax calculation and discount application.
   - Guaranteed at-least-once, duplicate-proof invoice generation (`Draft -> Confirmed -> Paid`).
   - Transactional PDF generation using PDFKit.
4. **Payment Matching & Accounts Receivable**:
   - Multi-method payment entry (wire, card, cash, check) with notes and transaction references.
   - Real-time balance calculations, tracking partial payments and outstanding amounts.
   - Automated aging and overdue detection.
5. **Real-Time Operational Reporting**:
   - High-performance dashboards computing active subscription counts, monthly revenue, total outstanding debt, and overdue accounts in under two seconds.

---

## 4. Architectural Boundaries

- **Modular Monolith**: Clean domain boundaries (`auth`, `customers`, `products`, `plans`, `quotations`, `subscriptions`, `billing`, `invoices`, `payments`, `reports`) packaged within a unified codebase.
- **Separate Runtime Processes**: The HTTP API (`apps/api`), Background Worker (`apps/worker`), and Web Frontend (`apps/web`) run independently while sharing database schemas and domain contracts.
- **Authoritative Data Layer**: PostgreSQL 16 is the strict, single source of truth. Redis is leveraged exclusively for BullMQ job queue coordination and disposable cache.

---

## 5. Next Steps & Cross-References

- Explore specific project goals and non-goals in [goals-and-non-goals.md](goals-and-non-goals.md).
- Review how requirements map across documentation in [requirements-traceability.md](requirements-traceability.md).
- Check the full domain terminology in [glossary.md](glossary.md).
