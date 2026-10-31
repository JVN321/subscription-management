# ADR 0004: Use Drizzle ORM and Migration Ownership

- **Status**: **Confirmed**
- **Date**: 2026-10-31
- **Deciders**: Architecture Team, Brightloop Engineering
- **Component**: `packages/db`

---

## 1. Context and Problem Statement
We require a type-safe database access layer and migration tool that integrates seamlessly with TypeScript without adding heavy runtime bloat or opaque query generation.

## 2. Decision Drivers
- Lightweight execution: Zero heavy Rust binary engines or background query engines.
- SQL-first mental model: Transparent query generation with full control over joins, locking (`FOR UPDATE`), and indexing.
- Version-controlled migrations: Explicit committed SQL migration files via `drizzle-kit`.
- Native Zod schema generation via `drizzle-zod`.

## 3. Considered Options
1. **Drizzle ORM**: SQL-like TypeScript query builder and migration toolkit.
2. **Prisma**: Heavy query engine binary, slow cold starts, limited support for complex SQL locks and partial indexes.
3. **TypeORM / MikroORM**: Complex decorator-heavy models and active record patterns that obfuscate SQL execution.

## 4. Decision Outcome
Chosen option: **Drizzle ORM**. It matches SQL semantics 1:1, provides instant compilation, and generates committed SQL migration files that can be reviewed during code reviews.
