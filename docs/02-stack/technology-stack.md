# Technology Stack Matrix & Integration Principles

> **Status: Confirmed Technology Baseline**
>
> Authoritative reference for core framework choices, tooling, responsibility boundaries, and integration principles.

---

## 1. Core Technology Matrix

| Layer | Selected Technology | Primary Responsibility | Alternative Considered & Rejected |
|---|---|---|---|
| **Web Frontend** | **TanStack Start** | SSR, client routing, server actions, optimistic UI | Next.js (heavier vendor lock-in, unnecessary complexity for modular monolith) |
| **Backend API** | **Hono** | Lightweight, typed HTTP API routing, middleware, OpenAPI integration | Express (dated, untyped), NestJS (heavyweight OOP boilerplate, violates Ponytail) |
| **Primary Database** | **PostgreSQL 16** | Authoritative relational data store, ACID transactions, financial integrity | MySQL (weaker JSON/check constraints), MongoDB (unsuitable for financial transactions) |
| **Database Toolkit / ORM** | **Drizzle ORM** | Type-safe SQL schema definitions, lightweight queries, migrations | Prisma (heavy binary engine, runtime overhead), TypeORM (fragile decorators) |
| **Authentication & Identity** | **Better Auth** | Authentication, session cookies, password reset, role attributes | NextAuth/Auth.js (tight coupling to Next.js), Passport (dated callback patterns) |
| **Background Processing** | **BullMQ** | Scheduled billing scans, PDF rendering, email dispatch | Celery/RabbitMQ (requires Python/extra daemon), temporal (excessive overhead) |
| **Queue / Cache Store** | **Redis 7** | BullMQ queue state storage and disposable read caching | Memcached (no persistence or data structures), Kafka (over-engineered) |
| **Boundary Validation** | **Zod** | Runtime schema validation for HTTP requests, env vars, and domain DTOs | Joi (untyped), Yup (weaker TypeScript inference) |
| **API Contract & Docs** | **OpenAPI 3.1** via `@hono/zod-openapi` | Machine-readable API contracts and interactive Swagger/Scalar documentation | Manual Swagger YAML (prone to drift and synchronization errors) |
| **Transactional Email** | **Resend** | Reliable delivery of invoice PDFs, quotes, and password reset links | Nodemailer (manual SMTP infrastructure maintenance) |
| **PDF Generation Engine** | **PDFKit** | Server-side invoice and quotation PDF rendering | Puppeteer/Chromium (massive memory footprint, 1GB+ container bloat) |
| **Observability** | **OpenTelemetry** | Distributed tracing, APM metrics, span instrumentation | Custom ad-hoc logging wrappers |

---

## 2. Integration Principles

1. **Separation of Concerns**:
   - `apps/web` communicates with `apps/api` strictly through validated HTTP endpoints and OpenAPI contracts. The frontend never imports database credentials or raw SQL query builders.
2. **PostgreSQL Remains Authoritative**:
   - Redis data can be cleared or expired at any moment without causing data corruption or loss of financial history.
3. **Zod at Every External Boundary**:
   - All inbound HTTP request parameters, environment variables, and background job payloads must be parsed and verified through Zod before reaching domain code.
4. **Provider Isolation**:
   - External services like Resend (email) and PDFKit (PDF generation) are wrapped behind internal domain interfaces. Changing an email provider or PDF renderer will not affect domain or billing logic.
