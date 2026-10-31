# Technology Stack Reference Matrix

> **Authoritative Specification of Languages, Frameworks, and Libraries**  
> **Platform:** Brightloop Subscription Management System  
> **Updated:** 2026-10-31

---

## 1. Monorepo Core Stack

| Component | Technology | Version | Purpose & Rationale | Status |
|---|---|---|---|:---:|
| **Language Runtime** | Node.js / TypeScript | `Node 22+` / `TS 5.8+` | Strict static typing across monorepo | `ACTIVE` |
| **Package Manager** | pnpm | `11.13.0` | Fast, space-efficient workspace link management | `ACTIVE` |
| **Database** | PostgreSQL | `16-Alpine` | Relational source of truth, ACID transactions, numeric precision | `ACTIVE` |
| **Database ORM** | Drizzle ORM | `^0.39.3` | Type-safe SQL schema definitions & versioned migrations | `ACTIVE` |
| **Backend API** | Hono | `^4.7.2` | Ultra-fast, lightweight HTTP routing & middleware | `ACTIVE` |
| **Authentication** | Better Auth | `^1.7.14` | Role-based authentication, sessions, and security constraints | `ACTIVE` |
| **Financial Math** | Decimal.js | `^10.5.0` | Zero floating-point rounding errors for currency arithmetic | `ACTIVE` |
| **Validation** | Zod | `^3.25.76` | Runtime input boundaries and schema contract validation | `ACTIVE` |
| **PDF Engine** | PDFKit | `^0.16.0` | Vector PDF generation for invoices and quotations | `ACTIVE` |
| **Web Frontend** | React / Vite | `React 19` / `Vite 6` | Component rendering, fast dev server, and clean bundling | `ACTIVE` |
| **Icons** | Lucide React | `^1.16.0` | Monochromatic precision vector iconography | `ACTIVE` |
| **Typography** | Lufga (All 18 Weights) | WOFF / CSS | Modern geometric sans-serif typeface | `ACTIVE` |
| **Unit Testing** | Vitest | `^3.2.7` | Fast test execution for domain, db, api, and web | `ACTIVE` |
| **E2E Testing** | Playwright | `^1.52.0` | Live Chromium browser testing | `ACTIVE` |
| **Code Intelligence**| CodeGraph | `v0.1` | Local symbol index and dynamic dispatch mapping | `ACTIVE` |

---

## 2. Deferred Production Infrastructure (The Ponytail Rule)

In strict adherence to the Ponytail Rule (YAGNI & Simplicity), production background queue brokers and third-party vendors are fully documented but deferred during prototype evaluation:

| Component | Production Blueprint | Prototype Implementation | Rationale |
|---|---|---|---|
| **Background Queues** | BullMQ + Redis 7 | In-Process Periodic Scheduler (`BillingService.runBillingScan`) | Lightweight prototype requires zero worker process overhead |
| **Transactional Email** | Resend SMTP/API | Structured console event logging | Mailpit / logging satisfies verification without external API keys |
| **Distributed Tracing** | OpenTelemetry + Jaeger | Structured JSON logger | Zero collector daemon dependencies during rapid prototype verification |
