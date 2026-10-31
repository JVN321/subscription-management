# Technology Stack Matrix & Integration Principles

> **Status: Active Prototype & Confirmed Production Blueprint**
>
> Authoritative reference for core framework choices, tooling, responsibility boundaries, and integration principles.

---

## 1. Core Technology Matrix

| Layer | Selected Technology | Prototype Status | Primary Responsibility | Alternative Considered & Rejected |
|---|---|:---:|---|---|
| **Web Frontend** | **TanStack Start / React** | **Active** | Fast client routing, Deslopified Industrial UI, reactive state | Next.js (heavier vendor lock-in, unnecessary complexity) |
| **Backend API** | **Hono** | **Active** | Lightweight typed HTTP API routing, middleware, OpenAPI integration | Express (dated, untyped), NestJS (heavyweight OOP boilerplate) |
| **Primary Database** | **PostgreSQL 16** | **Active** | Authoritative relational data store, ACID transactions, `NUMERIC(14, 4)` | MySQL (weaker check constraints), MongoDB (unsuitable for finances) |
| **Database Toolkit / ORM** | **Drizzle ORM** | **Active** | Type-safe SQL schema definitions, lightweight queries, migrations | Prisma (heavy binary engine), TypeORM (fragile decorators) |
| **Authentication & Identity** | **Better Auth** | **Active** | Authentication, session cookies, role attributes (`admin`, `staff`, `customer`) | NextAuth/Auth.js (tight coupling to Next.js) |
| **Recurring Billing Engine** | **In-Process Scheduler** | **Active** | Periodic automated billing runs with PostgreSQL advisory locks | Manual cron without concurrency safety |
| **Distributed Background Jobs** | **BullMQ** | **Deferred** | Scale-out worker daemons for high-throughput distributed queues | Celery/RabbitMQ (extra daemon footprint), Temporal (excessive) |
| **Queue / Cache Store** | **Redis 7** | **Deferred** | BullMQ queue state persistence and disposable read caching | Memcached (no persistence), Kafka (over-engineered) |
| **Boundary Validation** | **Zod** | **Active** | Runtime schema validation for HTTP requests, env vars, and domain DTOs | Joi (untyped), Yup (weaker TypeScript inference) |
| **PDF Generation Engine** | **PDFKit** | **Active** | Server-side invoice vector PDF rendering (`/api/v1/invoices/:id/pdf`) | Puppeteer/Chromium (1GB+ memory container bloat) |
| **Transactional Email** | **Resend** | **Deferred** | Automated transactional PDF email delivery | In-app download and Mailpit local testing |
| **Observability** | **OpenTelemetry** | **Deferred** | Distributed tracing and APM spans | Structured logging and query timing headers |

---

## 2. Integration Principles

1. **Separation of Concerns**:
   - `apps/web` communicates with `apps/api` strictly through validated HTTP endpoints. The frontend never imports database credentials or raw SQL query builders. Do not replace Hono with TanStack Start server functions.
2. **PostgreSQL Remains Authoritative**:
   - All financial, customer, quote, subscription, invoice, and payment data resides in PostgreSQL. Zero floating-point arithmetic.
3. **Zod at Every External Boundary**:
   - All inbound HTTP request parameters, environment variables, and domain DTOs are parsed and verified through Zod.
4. **Decoupled Billing Service**:
   - `BillingService` in `@repo/domain` is pure and decoupled from the scheduler, allowing seamless transition from in-process scheduler to BullMQ workers without rewriting business logic.
