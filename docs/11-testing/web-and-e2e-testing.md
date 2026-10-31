# Web UI & End-to-End Testing (Vitest & Playwright)

> **Document Status: Active Specification & Execution Guide**  
> **Repository:** `subscription-management`  
> **Package:** `@repo/web`  
> **Last Updated:** 2026-10-31  
> **Author:** JVN321 <johnvnettady@gmail.com>

---

## 1. Overview & Strategy

The web application test strategy operates across two complementary tiers:
1. **Vitest + React Testing Library (Component Level)**:
   - In-memory `jsdom` testing of UI component rendering, state transitions, theme switches, navigation, and API response integration.
   - Ultra-fast feedback loop (< 1 second).
2. **Playwright (Browser End-to-End Level)**:
   - Full-browser automated execution against the live application using Chromium.
   - Validates real DOM rendering, CSS layout, modal dialog transitions, network requests, and user personas.

---

## 2. Vitest Web Component Suite

- **File**: `apps/web/test/app.test.tsx`
- **Config**: `apps/web/vitest.config.ts`
- **Setup**: `apps/web/test/setup.ts`
- **Command**: `pnpm --filter @repo/web test`

### Covered Test Cases
1. **Brand & Header Integrity**:
   - Asserts BRIGHTLOOP brand logo and search input render accurately in the top bar.
2. **Theme Switcher**:
   - Verifies toggle between Crisp Light and Pitch Dark themes, ensuring `data-theme` attribute and `localStorage` update cleanly.
3. **Segmented Tab Navigation**:
   - Verifies switching between Dashboard, Quotations, Subscriptions, Invoices & Payments, Software Catalog, and Customer Portal without page reloads.
4. **Adaptive Persona Switching**:
   - Verifies that selecting the Customer role in the top header auto-navigates to the Customer Self-Service view.
5. **Dashboard Metric Strip Rendering**:
   - Verifies formatted currency rendering of Monthly Recurring Revenue ($1,720.00) and Settled Revenue ($3,200.00) from backend API responses.

---

## 3. Playwright End-to-End Test Suite

- **File**: `apps/web/e2e/dashboard-and-billing.spec.ts`
- **Config**: `apps/web/playwright.config.ts`
- **Command**: `pnpm --filter @repo/web test:e2e`

### Covered Test Scenarios
1. **Industrial Precision Layout & Telemetry**:
   - Loads `/` in Chromium, validates page title (`Brightloop — Subscription & Billing Platform`), and verifies primary metric strip (MRR, Active Subscriptions, Settled Revenue, Outstanding Balance).
2. **Smooth Theme Transitions**:
   - Clicks theme button, verifies DOM mutation of `html[data-theme]`, and verifies contrast preservation.
3. **Multi-Section Workflow Navigation**:
   - Sequentially navigates through Quotations, Subscriptions, Invoices, Software Catalog (with Brand Variants), and Customer Portal.
4. **Modal Dialog Interactions**:
   - Opens the "New Quotation" dialog, verifies form fields (Customer, Plan, Product), and cleanly closes the backdrop modal.
5. **Operator Billing Scan**:
   - Triggers the "Run Billing Scan" button and verifies the receipt of the real-time completion toast notification.
6. **Customer Self-Service Operation**:
   - Selects the Customer role in the persona selector, inspects the dedicated account portal, and verifies subscription agreements and invoice statement lists.

---

## 4. Execution Commands

```bash
# Run Vitest web unit/component tests
pnpm --filter @repo/web test

# Run Playwright E2E browser tests
pnpm --filter @repo/web test:e2e

# Run all unit tests across monorepo (domain, db, api, web)
pnpm test

# Run all tests (unit + e2e)
pnpm test:all
```
