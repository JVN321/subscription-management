# Taxes & Discounts

> **Status: Confirmed Domain Specification**
>
> Tax rate rules, discount criteria, fixed-amount vs percentage deductions, usage limits, and automatic billing application.

---

## 1. Tax Rules

Admins configure tax rules based on jurisdiction or product category:
- `id`: Unique UUID.
- `name`: Tax description (e.g. "Standard VAT 20%", "State Sales Tax 7.5%").
- `rate`: Decimal tax percentage (e.g. `0.2000` or `0.0750`).
- `is_inclusive`: Boolean flag indicating whether the sales price already includes tax or if tax is added onto the subtotal.
- `country_code` / `state`: Optional regional targeting.

---

## 2. Discount Rules

As specified in Scene 5 of the problem statement:
> *"Only the admin can create discount rules: a fixed amount or a percentage, with a minimum purchase or quantity, start and end dates, and a limit on how many times it can be used. A discount can apply to specific products or to whole subscriptions. Once it applies, it should appear on the next invoice on its own, without anyone having to remember it, and stop when it expires or runs out."*

### Core Discount Attributes:
- `id`: Unique UUID.
- `code`: Promotional code or rule label (e.g., `SUMMER20`, `VOLUME_SEATS`).
- `discount_type`: `FIXED_AMOUNT` (e.g. -$50.00) or `PERCENTAGE` (e.g. 15%).
- `value`: Deduction amount or percentage rate.
- `target_type`: `PRODUCT` (applies to matching line items) or `SUBSCRIPTION` (applies to total subtotal).
- `product_id`: Target product reference if `target_type == 'PRODUCT'`.
- `min_purchase_amount`: Minimum subtotal required for eligibility.
- `min_quantity`: Minimum seat/unit count required for eligibility.
- `start_date` / `end_date`: Timeframe during which the discount is valid.
- `max_uses`: Maximum lifetime redemptions allowed across all invoices (null = unlimited).
- `times_used`: Counter incremented upon each confirmed invoice where the discount is applied.

---

## 3. Auto-Application & Expiry Invariants

1. **Auto-Application**: When generating an invoice, the billing engine scans for active discounts associated with the subscription or customer that meet `min_purchase_amount` and `min_quantity`.
2. **Limit Enforcement**: Before applying, the system verifies `times_used < max_uses` and `CURRENT_DATE <= end_date`.
3. **Usage Counter Update**: When the invoice is transitioned from `DRAFT` to `CONFIRMED`, `times_used` is atomically incremented by 1 inside the same database transaction.
4. **Order of Operations**:
   $$\text{Subtotal} \longrightarrow \text{Product Discounts} \longrightarrow \text{Subscription Discounts} \longrightarrow \text{Taxes} \longrightarrow \text{Total}$$
