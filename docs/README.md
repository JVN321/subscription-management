# Brightloop Documentation Vault

> **Authoritative Technical Documentation & Operations Library**  
> **Platform:** Brightloop Subscription Management System  
> **Updated:** 2026-10-31

---

## 1. Quick Navigation Sitemap

### 📘 Operational Runbooks & Manuals
- [**Local Development Runbook**](guides/local-runbook.md): Step-by-step setup with Docker, migrations, seed, and running dev servers.
- [**Production Hosting & Deployment Runbook**](guides/hosting-and-deployment.md): Docker Compose production stack, Caddy/Nginx TLS, and automated backups.
- [**Database Schema & Seed Data Guide**](guides/database-and-seeding.md): Comprehensive inventory of demo accounts, products, variants, plans, and seed execution.
- [**Automated Testing Guide**](guides/testing-guide.md): 32 automated tests across Vitest (unit/component) and Playwright (browser E2E).

### 🏛️ System Architecture & Technology
- [**System Architecture & Topology**](architecture/system-overview.md): Component diagrams, network communication map, and runtime models.
- [**Technology Stack Reference**](architecture/technology-stack.md): Framework matrices, versions, Better Auth, Drizzle ORM, and Ponytail deferrals.
- [**Architectural Decisions (ADRs)**](architecture/decisions.md): Core architectural choices, Postgres authoritative storage, and decimal precision.

### 💼 Domain Logic & Financial Rules
- [**Automated Billing Engine & Scheduler**](domain/billing-and-scheduler.md): Recurring scan logic, PostgreSQL advisory locks (`pg_try_advisory_xact_lock`), and idempotency guarantees.
- [**Pricing Engine & Financial Invariants**](domain/pricing-and-invariants.md): Zero floating-point arithmetic rules, Odoo brand variant adjustments (+$560), and discounts.
- [**Data Models & Lifecycle States**](domain/data-models.md): 16 PostgreSQL Drizzle tables, foreign keys, and quote/subscription/invoice lifecycle states.

### 🎨 Design Language & User Experience
- [**UI Deslopification Standard**](design/deslopification-standard.md): 17-section law prohibiting decorative slop, flashing dots, and fake statuses.
- [**Industrial Precision Design System**](design/industrial-precision.md): Geometric tokens, Lufga font typography, and Orange/White/Black color palette.

### 📁 Reference Specifications
- [**Original Specification PDF**](resources/Subscription_Management_System.pdf): The original business requirements document.
- [**Visual Reference Image**](resources/reference.png): Design inspiration reference.
