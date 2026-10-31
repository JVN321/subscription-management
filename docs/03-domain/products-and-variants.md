# Products & Product Variants

> **Status: Confirmed Domain Specification**
>
> Product definitions, categorization, cost/sales margins, and variant-specific pricing adjustments.

---

## 1. Product Model

A **Product** represents a software item, add-on, or service sold by Brightloop Software (Scene 2).

### Product Attributes
- `id`: Unique UUID.
- `name`: Human-readable name (e.g. "Brightloop ERP Core", "Analytics Add-on").
- `product_type`: Categorization (`SOFTWARE`, `SERVICE`, `ADD_ON`, `HARDWARE`).
- `sales_price`: Base selling price (e.g. `1200.0000`).
- `cost_price`: Internal unit cost for gross margin tracking (e.g. `450.0000`).
- `notes`: Internal operational remarks or licensing restrictions.
- `is_active`: Boolean flag controlling availability for new quotations.

---

## 2. Product Variants & Price Adjustments

Products can offer variants that modify the base pricing or specifications (e.g., brand, deployment tier, support level).

### Variant Model & Odoo Brand Example
As specified in Scene 2 of the problem statement:
> *"The admin adds it with its name, type, sales price, cost price and notes, and offers it in variants, for example by brand, where choosing the Odoo brand adds 560 to the price."*

### Attributes:
- `id`: Unique UUID.
- `product_id`: Reference to parent Product.
- `variant_name`: Descriptive name (e.g., "Odoo Brand Edition", "Enterprise Tier").
- `sku`: Unique inventory or SKU identifier.
- `price_adjustment`: Numerical adjustment amount added to the product base sales price (e.g., `+560.0000`).
- `is_percentage`: Boolean flag indicating whether the adjustment is a fixed dollar amount or a percentage of the base price (default: `false` = fixed amount).

### Effective Unit Price Calculation:
$$\text{Effective Unit Price} = \text{Product Base Sales Price} + \text{Variant Price Adjustment}$$

Example:
- Base ERP Software Sales Price: $\$1,000.00$
- Selected Variant (Odoo Brand): $+\$560.00$
- **Total Effective Unit Price**: $\$1,560.00$
