# ADR 0003: PostgreSQL as Authoritative Durable Storage

- **Status**: **Confirmed**
- **Date**: 2026-10-31
- **Deciders**: Architecture Team, Brightloop Engineering
- **Component**: `packages/db`

---

## 1. Context and Problem Statement
Financial, customer, catalog, and subscription records require strong durability, transactional integrity, and complex relational constraints.

## 2. Decision Drivers
- ACID transactions: Invoicing, payment reconciliation, and quotation conversion cannot afford eventual consistency anomalies.
- Advanced constraint capabilities: Foreign keys, partial indexes, and check constraints enforce invariants at the storage layer.
- Query performance: Rich aggregation capabilities (`FILTER (WHERE ...)`, window functions) easily satisfy sub-2s reporting targets.

## 3. Considered Options
1. **PostgreSQL 16**: Battle-tested open-source relational database.
2. **MySQL / MariaDB**: Lacks native JSONB capabilities, partial indexes, and flexible transactional semantics.
3. **MongoDB / NoSQL**: Unsuitable for multi-record financial transactions and strict foreign key integrity.

## 4. Decision Outcome
Chosen option: **PostgreSQL 16**. It serves as the single persistent source of truth. Redis is strictly non-authoritative.
