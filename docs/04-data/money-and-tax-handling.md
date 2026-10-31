# Money & Tax Handling

> **Status: Confirmed Financial Architecture**
>
> Zero floating-point rule, PostgreSQL NUMERIC precision, decimal rounding rules, and historical line item snapshots.

---

## 1. The Zero Floating-Point Rule

IEEE 754 standard JavaScript floating-point numbers (`0.1 + 0.2 === 0.30000000000000004`) introduce rounding drift that corrupts financial records.

Rules:
1. **Never use JavaScript `number` for monetary values**: In application code, use string-backed arbitrary precision libraries (e.g. `decimal.js` or `big.js`).
2. **PostgreSQL Column Type**: Store all monetary values and tax rates as `NUMERIC(14, 4)` (14 total digits, 4 decimal places). This accommodates fractional unit prices, percentage tax calculations, and currency conversions without precision loss.
3. **Display Formatting**: Format to 2 decimal places (or local currency minor units) only at the presentation layer when displaying to users or rendering PDFs.

---

## 2. Rounding Strategy: Half-Even (Banker's Rounding)

To eliminate cumulative statistical bias:
- Rounding occurs at the **invoice line total** and **invoice total** levels using `ROUND_HALF_EVEN` (Banker's rounding).
- Line subtotal = $\text{round}(\text{unit price} \times \text{quantity}, 4)$.
- Invoice tax total = $\text{round}(\sum \text{taxable line amounts} \times \text{tax rate}, 2)$.

---

## 3. Historical Reproducibility Snapshots

Tax laws and financial audits mandate that historical invoices remain reproducible even if catalog product prices change or tax rates are modified next year:
- `invoice_lines` stores immutable snapshots of `product_name_snapshot`, `variant_name_snapshot`, `unit_price_snapshot`, and `tax_rate_snapshot`.
- Future updates to `products` or `taxes` tables never mutate existing invoice rows.
