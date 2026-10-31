# System Data Flow & Sequence Diagrams

> **Status: Confirmed Flow Specifications**
>
> Step-by-step sequence diagrams and operational paths for core business flows within the Brightloop Subscription Management System.

---

## 1. Flow 1: Quotation Creation and Conversion to Subscription

When a sales representative creates a quotation from a template and converts it into an active subscription:

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Sales / Staff
    participant Web as apps/web
    participant API as apps/api (Hono)
    participant Domain as packages/domain
    participant DB as PostgreSQL (Drizzle)

    Staff->>Web: Selects Quotation Template & Customer
    Web->>API: POST /api/v1/quotations { customerId, templateId, lines, terms }
    API->>Domain: QuotationService.create(data)
    Domain->>DB: INSERT into quotations & quotation_lines (Status: DRAFT)
    DB-->>Domain: Created quotation (ID: Q-2026-0042)
    Domain-->>API: Quotation DTO
    API-->>Web: 201 Created

    Staff->>Web: Marks Quotation Sent -> Accepted
    Staff->>Web: Clicks "Convert to Subscription"
    Web->>API: POST /api/v1/quotations/Q-2026-0042/convert
    API->>Domain: SubscriptionService.convertFromQuotation(quotationId)

    Note over Domain,DB: Atomic Database Transaction
    critical Convert Quotation
        Domain->>DB: SELECT * FROM quotations WHERE id = 'Q-2026-0042' FOR UPDATE
        Domain->>DB: Check if converted_subscription_id IS NULL (Idempotency Guard)
        Domain->>DB: INSERT into subscriptions (Status: CONFIRMED, quotation_id: Q-2026-0042)
        Domain->>DB: INSERT into subscription_lines (copied snapshot)
        Domain->>DB: UPDATE quotations SET status = 'CONVERTED', converted_subscription_id = subId
    end

    Domain-->>API: Subscription DTO (ID: SUB-2026-0105)
    API-->>Web: 200 OK (Subscription created)
```

---

## 2. Flow 2: Automated Bulk Billing Run

How the system detects due subscriptions, computes taxes/discounts, and generates invoices without duplicates:

```mermaid
sequenceDiagram
    autonumber
    participant Cron as BullMQ Repeatable Scheduler
    participant Worker as apps/worker
    participant Queue as Redis (BullMQ Queue)
    participant Domain as Billing Service
    participant DB as PostgreSQL 16
    participant Email as Resend Email Service

    Cron->>Queue: Enqueue 'billing.scan_due' (Daily Midnight UTC)
    Queue->>Worker: Dispatch 'billing.scan_due'
    Worker->>DB: Query subscriptions WHERE status = 'ACTIVE' AND next_billing_date <= NOW()
    DB-->>Worker: List of Due Subscriptions [SUB-1, SUB-2, ...]

    loop For each due subscription
        Worker->>Queue: Enqueue 'billing.generate_invoice' { subscriptionId: SUB-1, billingDate }
    end

    Queue->>Worker: Dispatch 'billing.generate_invoice' { SUB-1 }
    Worker->>Domain: BillingService.generateInvoice(SUB-1, billingDate)

    critical Create Invoice Idempotently
        Domain->>DB: SELECT * FROM invoices WHERE subscription_id = 'SUB-1' AND billing_period_start = '2026-11-01'
        alt Invoice Already Exists
            Domain-->>Worker: Return existing invoice (Duplicate Prevented)
        else Invoice Does Not Exist
            Domain->>Domain: Calculate variant adjustments, tax rates & active discounts
            Domain->>DB: INSERT into invoices (Status: DRAFT/CONFIRMED)
            Domain->>DB: INSERT into invoice_lines (with immutable price/tax snapshots)
            Domain->>DB: UPDATE subscriptions SET next_billing_date = next_period_date
        end
    end

    Worker->>Queue: Enqueue 'pdf.generate' { invoiceId }
    Worker->>Queue: Enqueue 'email.send_invoice' { invoiceId }
    Worker-->>Queue: Job Completed Successfully
```

---

## 3. Flow 3: Recording Payment Against Invoice

Recording external or gateway payments and updating invoice balances:

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Staff / Finance
    participant Web as apps/web
    participant API as apps/api
    participant Domain as Payment Service
    participant DB as PostgreSQL 16

    Staff->>Web: Inputs Payment: $1,200.00 via WIRE_TRANSFER, Ref: WT-9981
    Web->>API: POST /api/v1/invoices/INV-2026-0812/payments
    API->>Domain: PaymentService.recordPayment(invoiceId, payload)

    critical Record Payment Transaction
        Domain->>DB: SELECT total_amount, amount_paid, status FROM invoices WHERE id = 'INV-2026-0812' FOR UPDATE
        Domain->>Domain: Calculate new_amount_paid = amount_paid + 1200.00
        Domain->>Domain: Calculate outstanding = total_amount - new_amount_paid
        Domain->>Domain: Determine new status (PAID if outstanding <= 0 else CONFIRMED)
        Domain->>DB: INSERT into payments (invoice_id, amount, method, notes, recorded_by)
        Domain->>DB: UPDATE invoices SET amount_paid = new_amount_paid, status = new_status
    end

    Domain-->>API: Updated Invoice & Payment Record
    API-->>Web: 201 Created (Balance updated, Status: PAID)
```

---

## 4. Flow 4: PDF Generation and Caching Flow

```mermaid
sequenceDiagram
    autonumber
    participant Worker as apps/worker
    participant PDFEngine as PDFKit Service
    participant Disk as Local Host Drive (/data/media)
    participant DB as PostgreSQL 16

    Worker->>DB: Fetch invoice details, customer billing address, and line items
    DB-->>Worker: Invoice Snapshot Data
    Worker->>PDFEngine: RenderInvoicePDF(invoiceSnapshot)
    PDFEngine->>Disk: Stream PDF to /data/media/invoices/INV-2026-0812.pdf
    Disk-->>Worker: File write verified (SHA-256 computed)
    Worker->>DB: UPDATE invoices SET pdf_url = '/media/invoices/INV-2026-0812.pdf'
```
