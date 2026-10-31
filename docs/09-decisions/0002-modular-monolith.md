# ADR 0002: Adopt Modular Monolith with Separate Worker

- **Status**: **Confirmed**
- **Date**: 2026-10-31
- **Deciders**: Architecture Team, Brightloop Engineering
- **Component**: Entire System Topology

---

## 1. Context and Problem Statement
We need an architectural style that allows high developer velocity, strict consistency across financial mutations, and independent scaling of heavy background batch jobs without the distributed complexity of microservices.

## 2. Decision Drivers
- Ponytail rule: Avoid premature distributed systems.
- Transactional consistency: Multi-table financial operations require local ACID transactions.
- Operational simplicity: Single git repository, unified type sharing, straightforward Docker deployment.

## 3. Considered Options
1. **Modular Monolith with Separate Worker Processes**: Shared domain code and database schema; independently runnable API and Worker container processes.
2. **Microservices**: Independent services for Auth, Catalog, Billing, Payments, and Notifications.
3. **Single Monolithic Process**: API and background workers running in the same Node.js event loop.

## 4. Decision Outcome
Chosen option: **Modular Monolith with Separate Worker Processes**. The HTTP API (`apps/api`), Background Worker (`apps/worker`), and Web Frontend (`apps/web`) run in separate containers, sharing domain logic (`packages/domain`) and schema (`packages/db`).

### Positive Consequences
- Heavy billing runs or PDF renders in `worker` cannot starve user-facing `api` traffic.
- Code reuse and shared TypeScript types eliminate schema drift.
- Atomic ACID transactions remain straightforward without two-phase commit or saga coordination.
