# ADR 0009: Monetary Precision and Rounding Strategy

- **Status**: **Proposed / Pending Decision**
- **Date**: 2026-10-31
- **Deciders**: Finance Lead, Brightloop Engineering
- **Component**: Financial Engine, Database Schema

---

## 1. Context and Problem Statement
Financial, subscription, tax, and discount calculations require absolute decimal accuracy. JavaScript floating-point numbers (`Number`) are prohibited. We must decide between storing money as **PostgreSQL `NUMERIC(14, 4)`** versus **Integer minor units (cents)**.

---

## 2. Options Under Review

### Option 1: PostgreSQL `NUMERIC(14, 4)` with Decimal String Handling (Recommended)
- Columns defined as `numeric(14, 4)` in PostgreSQL.
- Application logic represents amounts as strings or `Decimal` instances (`decimal.js`).
- **Advantages**:
  - Handles fractional unit pricing (e.g. $0.0045 per API call / per seat-day).
  - Handles high-precision tax percentages (e.g. 8.875% tax rate) without intermediate truncation.
  - Aligns cleanly with enterprise accounting standards.

### Option 2: Integer Minor Units (e.g. Cents)
- All monetary columns stored as `BIGINT` representing cents (e.g. $10.00 is stored as `1000`).
- **Advantages**:
  - Pure integer math in code.
- **Disadvantages**:
  - Requires awkward fractional multipliers when unit prices or discounts involve sub-cent values.
  - Multi-currency scenarios with zero-decimal currencies (JPY) or 3-decimal currencies (KWD) require complex currency metadata tables.

---

## 3. Recommendation
We recommend **Option 1 (`NUMERIC(14, 4)`)** as it natively accommodates fractional variant adjustments and tax rates without rounding loss during intermediate calculations.
