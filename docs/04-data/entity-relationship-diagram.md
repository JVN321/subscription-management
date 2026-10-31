# Entity Relationship Diagram (ERD)

> **Status: Confirmed Database Schema Blueprint**
>
> Complete visual representation of all tables, fields, constraints, and relationships in `packages/db`.

---

## 1. Complete System ERD

```mermaid
erDiagram
    users {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar role
        varchar name
        timestamptz created_at
        timestamptz updated_at
    }

    customers {
        uuid id PK
        uuid user_id FK
        varchar company_name
        varchar contact_name
        varchar email UK
        varchar phone
        varchar tax_identifier
        jsonb billing_address
        varchar currency
        varchar payment_terms
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    products {
        uuid id PK
        varchar name
        varchar product_type
        numeric sales_price
        numeric cost_price
        text notes
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    product_variants {
        uuid id PK
        uuid product_id FK
        varchar name
        varchar sku UK
        numeric price_adjustment
        boolean is_percentage
        boolean is_active
        timestamptz created_at
    }

    plans {
        uuid id PK
        varchar name
        varchar billing_interval
        integer interval_count
        integer min_quantity
        date available_from
        date available_to
        boolean auto_close
        boolean allow_early_close
        boolean allow_pause
        boolean allow_renewal
        boolean is_active
        timestamptz created_at
    }

    taxes {
        uuid id PK
        varchar name
        numeric rate
        boolean is_inclusive
        varchar country_code
        varchar state
        boolean is_active
        timestamptz created_at
    }

    discounts {
        uuid id PK
        varchar code UK
        varchar discount_type
        numeric value
        varchar target_type
        uuid product_id FK
        numeric min_purchase_amount
        integer min_quantity
        date start_date
        date end_date
        integer max_uses
        integer times_used
        boolean is_active
        timestamptz created_at
    }

    quotations {
        uuid id PK
        varchar quote_number UK
        uuid customer_id FK
        uuid plan_id FK
        varchar status
        timestamptz expires_at
        uuid converted_subscription_id FK
        text notes
        timestamptz created_at
    }

    quotation_lines {
        uuid id PK
        uuid quotation_id FK
        uuid product_id FK
        uuid variant_id FK
        integer quantity
        numeric unit_price
        numeric amount
    }

    subscriptions {
        uuid id PK
        varchar subscription_number UK
        uuid customer_id FK
        uuid plan_id FK
        uuid quotation_id FK
        varchar status
        date start_date
        date end_date
        date next_billing_date
        varchar payment_terms
        timestamptz created_at
        timestamptz updated_at
    }

    subscription_lines {
        uuid id PK
        uuid subscription_id FK
        uuid product_id FK
        uuid variant_id FK
        integer quantity
        numeric unit_price
        uuid tax_id FK
        uuid discount_id FK
        numeric total_amount
    }

    invoices {
        uuid id PK
        varchar invoice_number UK
        uuid subscription_id FK
        uuid customer_id FK
        varchar status
        date issue_date
        date due_date
        date billing_period_start
        date billing_period_end
        numeric subtotal
        numeric tax_amount
        numeric discount_amount
        numeric total_amount
        numeric amount_paid
        varchar pdf_url
        jsonb customer_snapshot
        timestamptz created_at
        timestamptz updated_at
    }

    invoice_lines {
        uuid id PK
        uuid invoice_id FK
        uuid product_id FK
        varchar product_name_snapshot
        varchar variant_name_snapshot
        integer quantity
        numeric unit_price_snapshot
        numeric tax_rate_snapshot
        numeric discount_amount_snapshot
        numeric line_total
    }

    payments {
        uuid id PK
        uuid invoice_id FK
        numeric amount
        varchar payment_method
        date payment_date
        text notes
        uuid recorded_by FK
        timestamptz created_at
    }

    customers ||--o{ quotations : receives
    customers ||--o{ subscriptions : owns
    customers ||--o{ invoices : billed_to
    products ||--o{ product_variants : offers
    products ||--o{ quotation_lines : referenced_in
    products ||--o{ subscription_lines : included_in
    plans ||--o{ quotations : defines
    plans ||--o{ subscriptions : specifies
    quotations ||--|{ quotation_lines : contains
    subscriptions ||--|{ subscription_lines : contains
    subscriptions ||--o{ invoices : generates
    invoices ||--|{ invoice_lines : contains
    invoices ||--o{ payments : collected_by
    users ||--o{ payments : recorded_by
```
