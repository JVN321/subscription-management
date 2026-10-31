# Implementation Scope & Architectural Decisions (Confirmed)

> **Status: Confirmed & Active**
>
> Explicit baseline of implemented prototype technologies, runtime boundaries, and deferred infrastructure.

---

## 1. Confirmed Active Scope

The system is built on these authoritative choices:

1. **Frontend**:
   - Built with **TanStack Start / React**.
   - Running as an independent web client on `http://localhost:3000`.
   - Replaces all bespoke UI with **shadcn design language primitives**, flat outline styling, an **Orange/White/Black** color palette, a **Light/Dark theme switcher**, and **zero emojis** with **Lucide vector icons**.
2. **Backend API**:
   - Built with **Hono** running as a dedicated HTTP service on port `3001`.
   - **Do not replace Hono with TanStack Start server functions**.
   - Boundary validation enforced via **Zod**.
3. **Database & ORM**:
   - **PostgreSQL 16** with **Drizzle ORM**.
   - Strict transactional integrity, explicit decimal precision (`NUMERIC(14, 4)` / minor units), and zero floating-point arithmetic.
4. **Authentication & Identity**:
   - **Better Auth** mounted directly on Hono (`/api/auth/*` and `/api/v1/auth/*`).
   - Do not remove Better Auth.
5. **Automatic Recurring Billing Engine**:
   - Implemented via `BillingService.runBillingScan(targetDate)` in `@repo/domain`.
   - Periodically triggered in the Hono backend via a lightweight in-process scheduler (`apps/api/src/scheduler.ts`).
   - Safe against overlapping runs via PostgreSQL advisory locks.
   - Enforces duplicate prevention via database constraints (`UNIQUE(subscription_id, billing_period_start)`).
   - Advances subscriptions, computes taxes and discounts, and generates immutable invoice snapshots.
   - Fully decoupled from the scheduler so it can later be driven by BullMQ workers without rewriting business logic.

---

## 2. Deferred Infrastructure

The following infrastructure components remain documented in production architecture blueprints, but their operational complexity is deferred for the prototype:

| Component | Production Blueprint | Prototype Implementation |
|---|---|---|
| **BullMQ & Redis Workers** | Independent distributed worker process | Lightweight in-process scheduler (`scheduler.ts`) calling pure `BillingService` |
| **Redis Cache** | Disposable query caching | Direct PostgreSQL queries with indexed composite keys |
| **Resend (Email)** | Automated transactional PDF email delivery | In-app notification and direct browser PDF download via PDFKit |
| **OpenTelemetry** | Distributed tracing collector | Structured logging and query timing headers |
| **PDFKit** | Server-side vector PDF generation | **Working and retained** (`apps/api/src/pdf.ts`) |

---

## 3. End-to-End Workflow Prioritization

Engineering priority is strictly focused on verifying the end-to-end financial lifecycle:
```text
Customer Provisioning ➔ Subscription Creation ➔ Automatic Billing Scan ➔ Invoice Generation ➔ Payment Reconciliation
```
All intermediate states are backed by automated tests across unit, integration, and HTTP boundaries.
