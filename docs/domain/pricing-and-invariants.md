# Pricing Engine, Financial Precision & Invariants

> **Domain Specification: Decimal Arithmetic, Variant Adjustments, and Discounts**  
> **Platform:** Brightloop Subscription Management System  
> **Updated:** 2026-10-31

---

## 1. Zero Floating-Point Arithmetic Mandate

In Brightloop, financial calculations must **never** use standard JavaScript `Number` floating-point arithmetic (`0.1 + 0.2 !== 0.3`). All pricing calculations use `Decimal.js` (`packages/domain/src/pricing.ts`) and are persisted as PostgreSQL `NUMERIC(14, 4)`.

---

## 2. Pricing Pipeline

### 2.1 Variant Price Adjustment (Scene 2)
When a line item specifies a variant, the unit price is adjusted:
- **Fixed Adjustment**: `unitPrice = basePrice + adjustment`
  - *Example*: Brightloop ERP Core ($1,000.00) + Odoo Brand Edition (+$560.00) = **$1,560.0000**
- **Percentage Adjustment**: `unitPrice = basePrice * (1 + rate)`

### 2.2 Line Total Calculation
```text
lineTotal = round(unitPrice * quantity, 4)
```

### 2.3 Volume Discount Application (Scene 5)
Discounts are evaluated based on minimum spend and seat quantity thresholds:
- `VOLUME10`: 10% discount on entire subscription when total exceeds $1,000.00 or quantity >= 5.
- `EARLYBIRD100`: $100.00 fixed discount when total exceeds $500.00.

### 2.4 Interval Advancements
- `DAILY`: Advances by +1 day.
- `WEEKLY`: Advances by +7 days.
- `MONTHLY`: Advances by +1 calendar month (e.g. 2026-10-31 -> 2026-11-30).
- `YEARLY`: Advances by +1 calendar year.
