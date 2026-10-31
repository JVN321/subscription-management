# Goals and Non-Goals

> **Status: Confirmed Scope & Architectural Boundaries**
>
> Explicit demarcation of core objectives, engineering guarantees, and intentional exclusions to preserve simplicity and prevent scope creep.

---

## 1. Primary Goals

### 1.1 Business & Functional Goals
- **Single Source of Truth**: Centralize all customer, catalog, quotation, subscription, invoice, and payment data in a durable relational database.
- **Accurate Recurring Billing**: Eliminate manual billing errors by automatically generating invoices for subscriptions due for billing on any given day.
- **Duplicate-Proof Operations**: Guarantee that no subscription is billed twice for the same billing period and no billing cycle is accidentally skipped.
- **Flexible Catalog Management**: Enable admins to configure products, brand/variant adjustments, flexible billing intervals (daily, weekly, monthly, yearly), minimum quantities, pause rules, and renewal options.
- **Quotation Workflow**: Provide sales reps with template-based quote generation with configurable validity periods and zero-duplication conversion into subscriptions.
- **Accounts Receivable Tracking**: Provide real-time tracking of invoice payment status (`Draft -> Confirmed -> Paid`), partial payments, and overdue flags.
- **Self-Service Customer Portal**: Allow customers to inspect their subscriptions, view upcoming billing dates, and download invoice PDFs without contacting staff.

### 1.2 Engineering & Operational Goals
- **Sub-2-Second Response Target**: Optimize database schemas, query indexes, and caching strategies to ensure all dashboard and list views load in under 2 seconds across thousands of active subscriptions.
- **Modular Monolith Architecture**: Package the entire system in a clean, maintainable monorepo with explicit package boundaries (`apps/web`, `apps/api`, `apps/worker`, `packages/db`, `packages/contracts`, `packages/domain`).
- **Separation of Runtime Processes**: Run the HTTP API and BullMQ worker processes independently so heavy batch billing or PDF rendering never starves user-facing API requests.
- **Strict Data Correctness**: Enforce database-level foreign keys, unique constraints, and check constraints; zero floating-point arithmetic for money and taxes.

---

## 2. Non-Goals (What We Will NOT Build)

To maintain focus and avoid over-engineering (adhering to the Ponytail principle), the following are explicitly excluded from the initial system:

| Non-Goal | Rationale | Ponytail Guideline |
|---|---|---|
| **Microservices Architecture** | A distributed architecture introduces distributed transactions, network latency, complex observability, and deployment overhead with no demonstrated need. | Maintain a **modular monolith**; scale via independent process instances of API and Worker. |
| **Kafka, RabbitMQ, or NATS** | BullMQ backed by Redis is more than capable of processing tens of thousands of jobs per minute with minimal operational footprint. | Use **BullMQ + Redis**; avoid high-maintenance event streaming clusters. |
| **Kubernetes (K8s)** | Local development and initial deployment run on simple Docker Compose or managed container runners. | Use **Docker Compose** with straightforward volume mappings. |
| **ClickHouse or OLAP Warehouse** | Standard PostgreSQL with proper indexing, composite keys, and optional materialized views easily delivers sub-2s responses for thousands of subscriptions. | Rely on **PostgreSQL 16** query optimization; do not introduce secondary database engines. |
| **Runtime LLM / AI Agents in Production** | Agentic workflows are used to build and maintain the codebase, but the end-user product is a deterministic financial system. | Deterministic financial logic must never depend on non-deterministic generative models. |
| **Redis as Authoritative Storage** | Redis is strictly a transient queue coordinator and disposable cache. | If Redis is flushed, no financial, customer, or subscription data is lost. |
| **Direct Payment Gateway Integration in Phase 1** | The problem statement requires recording payments against invoices (method, amount, date, notes). Payment gateway webhooks (e.g. Stripe, Adyen) are not required for phase 1. | Implement manual and external payment recording first; integrate gateways only when requested. |
| **Multi-Tenancy Over-Engineering** | Brightloop Software is the single business described in the challenge. While code will maintain clean tenant awareness to allow future expansion, speculative multi-tenant SaaS features will not block release. | Build for Brightloop first; document multi-tenant pathways in ADR `0008`. |

---

## 3. Next Steps

- Review the [requirements-traceability.md](requirements-traceability.md) matrix.
- Explore the high-level architecture in [../01-architecture/system-overview.md](../01-architecture/system-overview.md).
