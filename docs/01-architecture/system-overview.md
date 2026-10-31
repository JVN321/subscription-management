# System Overview & Architecture

> **Status: Confirmed Modular Monolith Architecture**
>
> High-level system structure, container models, boundary definitions, and separation of concerns for the Brightloop Subscription Management System.

---

## 1. Architectural Philosophy: The Modular Monolith

Rather than adopting a distributed microservice topology with its associated network latency, distributed transactions, and operational complexity, Brightloop is architected as a **TypeScript-based Modular Monolith**.

Key Characteristics:
- **Shared Domain Core**: Domain logic, financial calculation rules, validation contracts, and database models reside in strongly-typed internal packages (`packages/domain`, `packages/contracts`, `packages/db`).
- **Separately Runnable Processes**: The system is partitioned into independently executable containerized processes:
  1. `apps/web`: Server-rendered frontend experience powered by **TanStack Start**.
  2. `apps/api`: Lightweight HTTP API built with **Hono**.
  3. `apps/worker`: High-throughput asynchronous background job runner built on **BullMQ**.
- **PostgreSQL as the Durable Source of Truth**: All persistent financial, customer, and subscription states are maintained exclusively in PostgreSQL 16.
- **Redis for Coordination & Caching**: Redis 7 is utilized strictly for BullMQ queue coordination and transient, rebuildable application caching.

---

## 2. C4 Context Diagram (System in Environment)

```mermaid
C4Context
    title System Context Diagram - Brightloop Subscription Management

    Person(admin, "Admin", "Configures products, plans, taxes, discounts, and staff accounts.")
    Person(staff, "Staff / Sales", "Creates quotes, manages subscriptions, triggers billing, and records payments.")
    Person(customer, "Customer", "Accesses self-service portal, views subscriptions, and downloads invoices.")

    System(sys, "Brightloop Subscription System", "Modular monolith managing recurring billing, quotes, subscriptions, and financial metrics.")

    System_Ext(resend, "Resend Email Service", "Delivers transactional notifications, invoice emails, and password resets.")
    System_Ext(pdfengine, "PDFKit Generation Engine", "Renders pixel-perfect PDF quotations and invoice documents.")
    System_Ext(otel, "OpenTelemetry Collector", "Aggregates APM metrics, distributed traces, and log spans.")

    Rel(admin, sys, "Manages system and staff", "HTTPS / Session")
    Rel(staff, sys, "Performs daily operations", "HTTPS / Session")
    Rel(customer, sys, "Views portal & invoices", "HTTPS / Session")

    Rel(sys, resend, "Dispatches emails", "REST / HTTPS")
    Rel(sys, pdfengine, "Renders documents", "In-Process Node Stream")
    Rel(sys, otel, "Exports telemetry", "OTLP / gRPC")
```

---

## 3. C4 Container Diagram (Runtime Processes & Storage)

```mermaid
C4Container
    title Container Diagram - Brightloop Subscription Management

    Container(web, "Web Application", "TanStack Start, SSR", "Delivers responsive web interface for Admin, Staff, and Customer personas.")
    Container(api, "HTTP API", "Hono, TypeScript", "Validates requests, enforces RBAC, and coordinates domain service operations.")
    Container(worker, "Background Worker", "Node.js, BullMQ", "Processes scheduled billing scans, invoice rendering, and email dispatch.")

    ContainerDb(postgres, "PostgreSQL 16", "Relational Database", "Authoritative storage for customers, plans, subscriptions, invoices, and payments.")
    ContainerDb(redis, "Redis 7", "In-Memory Data Store", "BullMQ queue management, job retries, and read cache.")

    Rel(web, api, "Queries & mutations", "JSON / HTTPS / OpenAPI")
    Rel(api, postgres, "Reads & writes transactions", "Drizzle ORM / TCP 5432")
    Rel(api, redis, "Enqueues background jobs & reads cache", "ioredis / TCP 6379")

    Rel(worker, redis, "Polls and updates job states", "BullMQ / TCP 6379")
    Rel(worker, postgres, "Fetches authoritative records & commits invoices", "Drizzle ORM / TCP 5432")
```

---

## 4. Architectural Tenets & Rules

1. **Thin HTTP Route Handlers**:
   - Handlers in `apps/api` must only validate inputs using Zod, verify authentication via Better Auth, call the appropriate application service in `packages/domain`, and format the HTTP response.
   - Financial logic, tax rules, and subscription state changes must NEVER live inside route files.
2. **Decoupled Asynchronous Execution**:
   - Heavy, slow, or retry-prone operations (e.g. bulk billing generation, PDFKit document compilation, Resend email dispatch) must always be dispatched to BullMQ queues.
   - User-facing API requests must return immediately upon enqueueing asynchronous work.
3. **Cache Invalidation Safety**:
   - Redis cache keys are ephemeral and rebuildable. If Redis is cleared, the system continues to operate correctly from PostgreSQL.
   - Cache keys for multi-record aggregates must be invalidated inside the same application service that commits the mutation.

---

## 5. Related Architecture Documents

- [component-architecture.md](component-architecture.md): Deep dive into repository applications and shared packages.
- [data-flow.md](data-flow.md): Sequence diagrams for core operational flows.
- [deployment-architecture.md](deployment-architecture.md): Docker topology and container networking.
- [scalability-and-performance.md](scalability-and-performance.md): Sub-2s latency strategy and database indexing.
