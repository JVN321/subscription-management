# Comprehensive Testing Framework & Verification Suite

> **Status: Active & 100% Passing (21 Automated Tests)**
>
> Authoritative guide to the automated test architecture, coverage layers, test execution commands, and verification benchmarks across the Brightloop monorepo.

---

## 1. Testing Philosophy

In a financial, subscription, and billing operations system, bugs mean lost revenue, double-billing lawsuits, or broken audit trails. The testing framework strictly enforces:

1. **Zero Floating-Point Financial Arithmetic**:
   - Every tax rate, line calculation, volume discount, and payment balance is verified to maintain exact 4-decimal precision (`NUMERIC(14, 4)`).
2. **Database-Level Constraint Verification**:
   - Invariants (such as composite unique constraints preventing duplicate invoices for the same subscription billing period) are tested at the PostgreSQL database layer, not just in application code.
3. **Transaction Boundary & Concurrency Safety**:
   - Automated tests verify that PostgreSQL transaction-level advisory locks (`pg_try_advisory_xact_lock(89214)`) prevent overlapping runs and release locks automatically without pool leaks.
4. **End-to-End Workflow Traceability**:
   - Tests execute the full lifecycle: `Customer Provisioning ➔ Catalog & Variant Pricing ➔ Quotation ➔ 1-Click Conversion ➔ Automatic Billing Scan ➔ Vector PDF Generation ➔ Payment Settlement ➔ Financial Reporting`.

---

## 2. Test Execution Commands

Run tests across all monorepo packages from the repository root:

```bash
# Run all test suites across the entire monorepo
pnpm test

# Run domain pricing & end-to-end billing tests
pnpm --filter @repo/domain test

# Run PostgreSQL schema & constraint tests
pnpm --filter @repo/db test

# Run Hono API HTTP endpoint & PDFKit tests
pnpm --filter @repo/api test

# Full TypeScript static type verification across all packages
pnpm typecheck
```

---

## 3. Directory Structure

```text
docs/11-testing/
├── README.md                          # Testing philosophy & command reference (this file)
├── api-testing.md                     # HTTP contracts, Zod schemas, role RBAC, PDF generation
├── database-testing.md                # PostgreSQL schema constraints, decimal precision, ACID rollbacks
├── domain-and-billing-testing.md      # Pricing engine, discount rules, advisory locks, idempotency
└── test-results-matrix.md             # Automated test execution scoreboard & verification audit
```
