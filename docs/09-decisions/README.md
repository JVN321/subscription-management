# Architecture Decision Records (ADR) Log

> **Status: Active Decision Repository**
>
> Immutable log of foundational architecture decisions, confirmed engineering patterns, and pending trade-offs.

---

## 1. Decision Log

| ADR Number | Title | Status | Date | Primary Component |
|---|---|:---:|---|---|
| [**0001**](0001-hono-api-framework.md) | Use Hono as the HTTP API Framework | **Confirmed** | 2026-10-31 | `apps/api` |
| [**0002**](0002-modular-monolith.md) | Adopt Modular Monolith with Separate Worker | **Confirmed** | 2026-10-31 | Entire System |
| [**0003**](0003-postgresql-authoritative-store.md) | PostgreSQL as Authoritative Durable Storage | **Confirmed** | 2026-10-31 | `packages/db` |
| [**0004**](0004-drizzle-orm.md) | Use Drizzle ORM and Migration Ownership | **Confirmed** | 2026-10-31 | `packages/db` |
| [**0005**](0005-better-auth.md) | Better Auth for Authentication and Identity | **Confirmed** | 2026-10-31 | `apps/api`, `apps/web` |
| [**0006**](0006-bullmq-redis.md) | BullMQ with Redis for Background Queues | **Confirmed** | 2026-10-31 | `apps/worker` |
| [**0007**](0007-redis-isolation.md) | Redis Queue and Cache Namespace Isolation | **Confirmed** | 2026-10-31 | Infrastructure |
| [**0008**](0008-tenancy-single-vs-multi.md) | Single-Business vs Multi-Tenant SaaS | **Proposed / Pending** | 2026-10-31 | Schema, Authorization |
| [**0009**](0009-money-representation.md) | Monetary Precision and Rounding Strategy | **Proposed / Pending** | 2026-10-31 | Financial Engine |

---

## 2. ADR Lifecycle & Template

- Proposed decisions are drafted using [adr-template.md](adr-template.md).
- Status changes progress from `Proposed` $\rightarrow$ `Confirmed` (or `Rejected` / `Superseded`).
