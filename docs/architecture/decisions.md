# Architectural Decision Records (ADR Summary)

> **Consolidated Architectural Decisions**  
> **Platform:** Brightloop Subscription Management System  
> **Updated:** 2026-10-31

---

## ADR 01: Hono as Standalone Backend API
- **Decision**: Keep Hono as a separate, dedicated backend HTTP API service on port 3001 rather than collapsing logic into full-stack server functions.
- **Rationale**: Clean separation of concerns, independent scaling, OpenAPI specification support, and direct suitability for micro-service decomposition.

## ADR 02: PostgreSQL as the Single Authoritative Data Store
- **Decision**: All financial, customer, subscription, and billing data resides in PostgreSQL 16.
- **Rationale**: Full ACID guarantees, row-level locking (`SELECT ... FOR UPDATE`), transaction-level advisory locks (`pg_try_advisory_xact_lock`), and strict composite unique constraints.

## ADR 03: Drizzle ORM for Schema and Migrations
- **Decision**: Use Drizzle ORM (`drizzle-kit`) for schema definitions and migrations.
- **Rationale**: Zero magic, near-zero runtime overhead, SQL-like syntax, and deterministic migration files version-controlled in git.

## ADR 04: Zero Floating-Point Arithmetic for Money
- **Decision**: Never use JavaScript `Number` for financial arithmetic. Use PostgreSQL `NUMERIC(14, 4)` columns and `Decimal.js` in domain code.
- **Rationale**: Financial calculations cannot tolerate IEEE 754 binary floating-point rounding errors.

## ADR 05: Better Auth for Authentication and Sessions
- **Decision**: Use Better Auth for session management, password complexity rules, and RBAC guards.
- **Rationale**: Modern, standards-compliant session handling, role enforcement, and native Drizzle adapter compatibility.

## ADR 06: Transaction-Level Advisory Locks for Billing
- **Decision**: Use `SELECT pg_try_advisory_xact_lock(89214)` inside `db.transaction()` rather than session-level locks.
- **Rationale**: Automatically releases locks on transaction commit/rollback, eliminating connection pool leaks across clustered workers.
