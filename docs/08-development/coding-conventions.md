# Coding Conventions & Engineering Guidelines

> **Status: Confirmed Coding Standard**
>
> Engineering rules, Ponytail simplicity principles, TypeScript standards, and code review criteria.

---

## 1. The Ponytail Coding Philosophy

Every pull request, commit, and edit in this codebase is governed by the **Ponytail Principle**:

1. **The Ladder of Simplicity**:
   - Rung 1: Does this need to exist at all? If speculative, delete/skip it (YAGNI).
   - Rung 2: Already in this codebase? Reuse existing helpers, schemas, and types.
   - Rung 3: Does ECMAScript / Node.js stdlib do it? Use it.
   - Rung 4: Does a native platform or database feature cover it? (e.g. SQL unique constraints over app-level checks).
   - Rung 5: Does an existing installed dependency solve it? Use it. Never install an unneeded dependency.
   - Rung 6: Can it be one line? Keep it to one line.
   - Rung 7: Only then write custom code.
2. **Intentional Shortcuts (`// ponytail:`)**:
   - When choosing a simple implementation with a known ceiling (e.g. in-memory map instead of Redis distributed lock for an initial single-instance worker), document the intent:
     ```typescript
     // ponytail: single-process concurrency, migrate to Redlock if running multi-instance workers
     ```
3. **No Unrequested Boilerplate**:
   - No interfaces with only one implementation.
   - No abstract factories for a single class.
   - No speculative configuration for constants that never change.

---

## 2. TypeScript & Linting Standards

- **Strict Mode Enabled**: `strict: true`, `noImplicitAny: true`, `exactOptionalPropertyTypes: true`.
- **No Unsafe Type Assertions**: Avoid `as any` or `as unknown as Type`. Always parse external boundaries through Zod.
- **Explicit Return Types**: Public API handlers and domain service methods must declare explicit return types.
- **Pure Domain Calculations**: Functions performing money, tax, and discount arithmetic must be pure, deterministic functions without side effects.
