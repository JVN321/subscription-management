# Database Schema & Seed Data Reference Guide

> **Authoritative Specification: How to Seed, What Seed Data is Populated, and Invariants**  
> **Platform:** Brightloop Subscription Management System  
> **Updated:** 2026-10-31

---

## 1. How to Seed the Database

The database seeding pipeline is located in `packages/db/src/seed.ts` and executed using the root monorepo script:

```bash
# Seed the active PostgreSQL database with initial business data
pnpm db:seed
```

Or target the database package directly:
```bash
pnpm --filter @repo/db db:seed
```

*To reset the database and re-seed from scratch:*
```bash
# Re-apply migrations and re-seed
pnpm db:migrate && pnpm db:seed
```

---

## 2. Seed Data Inventory (Complete Audit)

The seed script creates a complete, interconnected financial ecosystem conforming to the test requirements specified in `Subscription_Management_System.pdf`:

### 2.1 Users & Role Credentials
Passwords meet all validation constraints (`>8` chars, uppercase, lowercase, numbers, special characters):

| Role | User Name | Email Address | Default Password | Permissions / Capabilities |
|---|---|---|---|---|
| **Admin** | Alice Cooper | `admin@brightloop.com` | `Admin123!@#` | Full system access, staff provisioning, tax & discount rules |
| **Staff** | Bob Miller | `staff@brightloop.com` | `Staff123!@#` | Operational sales, quote creation, billing scan triggers |
| **Customer** | Sarah Connor | `sarah@shopflow.com` | `Customer123!@#` | Customer portal access, self-service subscription & invoices |

### 2.2 Customer Accounts
- **Company Name**: `ShopFlow Retail Solutions`
- **Contact Name**: Sarah Connor
- **Email**: `sarah@shopflow.com`
- **Phone**: `+1 555-0199`
- **Tax Identifier**: `US-TAX-89214`
- **Billing Address**: `450 Lexington Ave, Suite 1200, New York, NY 10017, US`
- **Default Payment Terms**: `NET_30`

### 2.3 Software Products & Brand Variants
Products store base sales and cost prices with `NUMERIC(14, 4)` precision:

| Product Name | Type | Base Sales Price | Cost Price | Notes |
|---|---|:---:|:---:|---|
| **Brightloop ERP Core** | `SOFTWARE` | `$1,000.0000` | `$300.0000` | Flagship enterprise resource planning software license |
| **Analytics & Reporting Add-on** | `ADD_ON` | `$250.0000` | `$50.0000` | Advanced BI reporting and cohort retention dashboards |

#### Attached Product Variants (Scene 2 Specification)
| Product | Variant Name | SKU | Price Adjustment | Effective Unit Price |
|---|---|---|:---:|:---:|
| Brightloop ERP Core | **Odoo Brand Edition** | `ERP-CORE-ODOO` | `+$560.0000` | **`$1,560.0000`** |
| Brightloop ERP Core | **Standard Edition** | `ERP-CORE-STD` | `+$0.0000` | **`$1,000.0000`** |

### 2.4 Billing Interval Plans (Scene 2 Specification)
| Plan Name | Billing Interval | Count | Min Seats | Auto-Close | Pause Allowed | Renewal Allowed |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **Monthly Growth Plan** | `MONTHLY` | 1 | 2 units | No | Yes | Yes |
| **Annual Enterprise Plan** | `YEARLY` | 1 | 5 units | No | Yes | Yes |
| **Daily Sandbox Trial** | `DAILY` | 1 | 1 unit | Yes | No | No |

### 2.5 Tax Configurations
| Tax Name | Tax Rate | Calculation Mode | Jurisdiction |
|---|:---:|---|---|
| **Standard VAT (20%)** | `20.00%` (`0.2000`) | Exclusive | Great Britain (`GB`) |
| **NY State Sales Tax (8.875%)** | `8.88%` (`0.0888`) | Exclusive | United States, New York (`US-NY`) |

### 2.6 Discount Criteria Rules (Scene 5 Specification)
| Discount Code | Type | Value | Scope | Criteria & Thresholds | Usage Limits |
|---|---|:---:|---|---|:---:|
| **`VOLUME10`** | `PERCENTAGE` | `10.00%` (`0.1000`) | Subscription | Min Purchase: `$1,000.00` OR Min Quantity: `5` units | Max 100 uses |
| **`EARLYBIRD100`** | `FIXED_AMOUNT` | `$100.00` | Subscription | Min Purchase: `$500.00` OR Min Quantity: `1` unit | Max 50 uses |

### 2.7 Quotation Templates (Scene 3 Specification)
- **Template Name**: `Enterprise Onboarding Package`
- **Default Pre-linked Plan**: `Monthly Growth Plan`
- **Validity Window**: `30 days`

---

## 3. How to Verify Seeded Records

### Via Web Application
Navigate to [http://localhost:3000](http://localhost:3000):
1. **Catalog Tab**: Inspect ERP Core base price ($1,000.00) and Odoo Brand Edition variant (+$560.00).
2. **Quotations Tab**: Create a quote using the seeded customer (ShopFlow Retail Solutions).
3. **Customer Portal Tab**: Inspect ShopFlow's account dashboard.

### Via API Direct Endpoints
```bash
# Verify Products and Variants
curl -s http://localhost:3001/api/v1/products | jq .

# Verify Billing Plans
curl -s http://localhost:3001/api/v1/plans | jq .

# Verify Seeded Customers
curl -s http://localhost:3001/api/v1/customers | jq .
```
