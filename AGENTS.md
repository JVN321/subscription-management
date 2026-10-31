# Agent Guidelines & Operational Directives

> **Workspace Directives for AI Agents Working on the Subscription Management System**
>
> This document governs all automated and assisted coding, refactoring, documentation, and operational work within this repository. All agents (including Antigravity, Claude Code, Cursor, and subagents) MUST adhere to these directives without exception.

---

## 1. Core Engineering Philosophy: The Ponytail Rule (YAGNI & Simplicity)

1. **Do Not Reinvent the Wheel**:
   - **Never** write custom code or bespoke abstractions from scratch when a battle-tested, high-quality library exists in the ecosystem.
   - Core libraries chosen for this stack:
     - Authentication & Sessions: `Better Auth`
     - Database ORM & Migrations: `Drizzle ORM` (`drizzle-kit`)
     - Background Queues & Schedulers: `BullMQ`
     - Boundary Validation: `Zod`
     - API Routing & Contracts: `Hono` + `@hono/zod-openapi`
     - Transactional Email: `Resend`
     - PDF Document Generation: `PDFKit`
     - Observability & Tracing: `OpenTelemetry`
   - If an unlisted capability is needed, research existing open-source libraries before proposing custom implementations.
2. **Standard Library & Native Platform First**:
   - Prefer ECMAScript/Node standard library and SQL constraints over custom helper functions.
   - Prefer HTML/browser native capabilities over heavyweight UI widgets (e.g. native date pickers, CSS flex/grid over JS layout engines).
3. **Shortest Working Diff Wins**:
   - No speculative abstractions (no interfaces with only one implementation, no factories for a single class, no unused generic helpers).
   - Flag deliberate trade-offs or simplifications using comments formatted as: `// ponytail: <description>`.

---

## 2. Mandatory Database Code Review Protocol

Financial, subscription, and billing data require absolute data integrity. On **every** change that touches database schemas, queries, or transactions:

1. **Precision & Money Handling**:
   - **Zero Floating-Point Calculations**: Never use JavaScript `Number` for money or tax arithmetic.
   - Use PostgreSQL `NUMERIC(14, 4)` or integer minor units, and decimal-safe libraries in application logic.
2. **Transaction Boundaries**:
   - Any multi-record state mutation (e.g., accepting a quotation, generating bulk invoices, recording payments, pausing a subscription) MUST be wrapped in a database transaction (`db.transaction(...)`).
3. **Constraints as the Final Safety Net**:
   - Foreign keys, unique constraints (e.g., `(subscription_id, billing_period_start)`), and check constraints must enforce business invariants at the database layer. Application-level checks alone are insufficient.
4. **Idempotency & Concurrency**:
   - Prevent race conditions using database unique constraints or row-level locking (`SELECT ... FOR UPDATE`) where appropriate.
   - Batch billing scans must never generate duplicate invoices even if re-triggered simultaneously.
5. **Drizzle Migration Discipline**:
   - All schema changes must be accompanied by version-controlled migration files generated via `drizzle-kit generate`. Never manually alter database tables without a migration.

---

## 3. CodeGraph Intelligence Protocol

This repository is indexed by **CodeGraph**. The index is located in `.codegraph/`.

1. **Reach for CodeGraph First**:
   - Before using `grep`, `find`, or sequentially reading files to understand symbol usage or call hierarchies, query CodeGraph:
     - **MCP Tool**: Call `codegraph_explore` with `projectPath: "/devdrive/github/projects/subscription-management"` and the symbol or query.
     - **Shell CLI**: Run `codegraph explore "<symbol or question>"` or `codegraph node "<symbol>"`.
2. **Keep the Index Synchronized**:
   - After adding, modifying, or renaming files or modules, run:
     ```bash
     codegraph sync .
     ```
   - Verify index status using `codegraph status .`.

---

## 4. Skill Autonomy & Customization

1. **Permission to Install Skills**:
   - Agents are explicitly authorized to install and configure skills in `.agents/skills/` or per-user configurations when complex or repetitive workflows require specialized tooling.
2. **Using Ponytail Skills**:
   - When reviewing code for over-engineering, use `ponytail-review` or `ponytail-audit`.
   - When logging deferred improvements, use `ponytail-debt`.

---

## 5. Docker & Drive Connectivity Protocol

All local development and deployment instances run within Docker containers.

1. **Host Drive Mappings**:
   - **Source Code**: Host `./apps` and `./packages` bind-mount into container `/app` for active hot-reloading.
   - **PostgreSQL Data**: Host `./data/postgres` binds to container `/var/lib/postgresql/data` for persistent data storage.
   - **Redis Queue & Cache Data**: Host `./data/redis` binds to container `/data` for BullMQ job persistence.
   - **Generated Media & Invoices**: Host `./data/media` binds to container `/app/media`.
2. **Container Isolation & Policy**:
   - Redis must run with `--appendonly yes --maxmemory-policy noeviction` so BullMQ jobs are never dropped during cache pressure.
   - PostgreSQL runs on port `5432`, API runs on `3001`, Web runs on `3000`, Mailpit runs on `8025` (web UI) and `1025` (SMTP).

---

## 6. Every-Edit Checklist

Before completing any task, verify:
- [ ] **Ponytail Check**: Did I reinvent something standard library or a known npm package already solves?
- [ ] **Database Integrity**: Did I review transactional boundaries, decimal precision, and constraints?
- [ ] **CodeGraph Sync**: Did I run `codegraph sync .` after modifying source files?
- [ ] **Documentation Parity**: If an API route, background job, or schema was added/modified, did I update `docs/`?
- [ ] **Lint & Type Safety**: Does TypeScript compile cleanly without unsafe `any` casts?
- [ ] **Comment & Docstring Integrity**: Preserved existing comments and added clear JSDoc where public contracts changed.
