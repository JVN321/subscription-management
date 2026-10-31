# Automated Testing Guide (Vitest & Playwright)

> **Complete Operator Guide for Running and Writing Tests Across Monorepo Packages**  
> **Platform:** Brightloop Subscription Management System  
> **Updated:** 2026-10-31

---

## 1. Test Architecture & Coverage Layers

Brightloop enforces 100% automated test verification across five distinct testing tiers:

```
┌──────────────────────────────────────────────────────────┐
│              Full Monorepo Automated Tests               │
│               32 / 32 Passed (100% Green)                │
└────────────────────────────┬─────────────────────────────┘
                             │
     ┌───────────────────────┼───────────────────────┐
     ▼                       ▼                       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐
│ @repo/domain │     │  @repo/db    │     │      @repo/api       │
│   7 Tests    │     │   3 Tests    │     │       11 Tests       │
│ Zero-Float   │     │ Constraints  │     │ Contracts & Vector   │
│ Pricing Math │     │ ACID & Uniq  │     │ PDFKit Generation    │
└──────────────┘     └──────────────┘     └──────────┬───────────┘
                                                     │
                                   ┌─────────────────┴─────────────────┐
                                   ▼                                   ▼
                        ┌─────────────────────┐             ┌─────────────────────┐
                        │  apps/web (Vitest)  │             │ apps/web Playwright │
                        │  5 Component Tests  │             │ 6 Browser E2E Tests │
                        │  Tabs & Theme Sync  │             │ Chromium Headless   │
                        └─────────────────────┘             └─────────────────────┘
```

---

## 2. Quick Execution Commands

```bash
# 1. Run all unit & component tests across monorepo (26 tests)
pnpm test

# 2. Run Playwright full browser end-to-end tests (6 tests)
pnpm test:e2e

# 3. Run all tests in a single command (32 tests total)
pnpm test:all

# 4. Run individual package test suites:
pnpm --filter @repo/domain test
pnpm --filter @repo/db test
pnpm --filter @repo/api test
pnpm --filter @repo/web test
```

---

## 3. Detailed Test Suite Inventory

| Package | Framework | Test File | Tests | Coverage Focus |
|---|---|---|:---:|---|
| `@repo/domain` | Vitest | `packages/domain/test/pricing.test.ts` | 6 | Fixed and percentage variant adjustments (+560.00 Odoo), line totals, volume discounts, interval advances |
| `@repo/domain` | Vitest | `packages/domain/test/e2e-workflow.test.ts` | 1 | Full 7-scene customer-to-payment lifecycle, idempotency duplicate skip |
| `@repo/db` | Vitest | `packages/db/test/schema.test.ts` | 3 | `NUMERIC(14, 4)` precision, PostgreSQL unique constraint `(subscription_id, billing_period_start)`, ACID rollback |
| `@repo/api` | Vitest | `apps/api/test/api.test.ts` | 11 | Health check, password complexity, staff RBAC guard (403), quotes, 1-click conversion, billing scan, vector PDF invoice generation, payment settlement, summary reporting |
| `@repo/web` | Vitest | `apps/web/test/app.test.tsx` | 5 | Brand logo, search input, theme toggle (`data-theme`), tab navigation, persona routing, financial metric rendering |
| `@repo/web` | Playwright | `apps/web/e2e/dashboard-and-billing.spec.ts` | 6 | Live browser interactions in Chromium: metric strip, dark mode, segmented navigation, quote modal, billing scan toast, customer self-service portal |
| **Total** | | | **32** | **100% Full-Stack Green** |
