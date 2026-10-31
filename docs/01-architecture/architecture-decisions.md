# Architecture Decisions Overview

> **Status: Active Record of Architectural Evolution**
>
> Index and rationale of all foundational design decisions governing the Brightloop Subscription Management System.

---

## 1. Architectural Strategy

All major technical decisions follow our core engineering tenets:
1. **Ponytail Rule (Simplicity & YAGNI)**: Avoid unrequested complexity; rely on battle-tested libraries and native platform capabilities before introducing custom code.
2. **PostgreSQL as Authoritative Source of Truth**: Relational consistency, database-level constraints, ACID transactions, and reproducible financial snapshots.
3. **Explicit Boundary Isolation**: Clear separation between user interface (`apps/web`), HTTP routing (`apps/api`), background worker (`apps/worker`), and domain/schema packages (`packages/*`).

---

## 2. ADR Log & Status Summary

| ADR ID | Decision Title | Status | Impact Area | Summary Link |
|---|---|---|---|---|
| **ADR-0001** | Use Hono as HTTP API Framework | **Confirmed** | `apps/api` | [0001-hono-api-framework.md](../09-decisions/0001-hono-api-framework.md) |
| **ADR-0002** | Adopt Modular Monolith with Separate Worker | **Confirmed** | Repository structure | [0002-modular-monolith.md](../09-decisions/0002-modular-monolith.md) |
| **ADR-0003** | PostgreSQL as Authoritative Storage | **Confirmed** | `packages/db` | [0003-postgresql-authoritative-store.md](../09-decisions/0003-postgresql-authoritative-store.md) |
| **ADR-0004** | Use Drizzle ORM and Migration Ownership | **Confirmed** | `packages/db` | [0004-drizzle-orm.md](../09-decisions/0004-drizzle-orm.md) |
| **ADR-0005** | Better Auth for Identity & Session Management | **Confirmed** | `apps/api`, `apps/web` | [0005-better-auth.md](../09-decisions/0005-better-auth.md) |
| **ADR-0006** | BullMQ with Redis for Asynchronous Jobs | **Confirmed** | `apps/worker` | [0006-bullmq-redis.md](../09-decisions/0006-bullmq-redis.md) |
| **ADR-0007** | Shared Redis with Queue Isolation & Noeviction | **Confirmed** | Infrastructure | [0007-redis-isolation.md](../09-decisions/0007-redis-isolation.md) |
| **ADR-0008** | Single-Business vs Multi-Tenant SaaS | **Proposed / Pending Decision** | Data model, Security | [0008-tenancy-single-vs-multi.md](../09-decisions/0008-tenancy-single-vs-multi.md) |
| **ADR-0009** | Monetary Precision & Rounding Strategy | **Proposed / Pending Decision** | Financial Engine | [0009-money-representation.md](../09-decisions/0009-money-representation.md) |

---

## 3. Decision Workflow

1. **Proposing a Change**: Create a new ADR draft in `docs/09-decisions/` using [adr-template.md](../09-decisions/adr-template.md).
2. **Review & Approval**: Review with project leads and team members. Check against Ponytail YAGNI principles.
3. **Implementation**: Once confirmed, update the relevant domain and architectural documents, link the ADR, and commit the changes.
