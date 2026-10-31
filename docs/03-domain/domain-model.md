# Domain Model & Aggregate Boundaries

> **Status: Confirmed Domain Architecture**
>
> High-level domain structure, aggregate boundaries, entity definitions, and business invariants for Brightloop Subscription Management.

---

## 1. Domain Entities & Aggregate Map

The domain is organized into distinct aggregates where transactions preserve business invariants:

```mermaid
classDiagram
    class Customer {
        +UUID id
        +String name
        +String email
        +String taxIdentifier
        +Address billingAddress
        +DateTime createdAt
    }

    class Product {
        +UUID id
        +String name
        +ProductType type
        +Decimal salesPrice
        +Decimal costPrice
        +String notes
    }

    class ProductVariant {
        +UUID id
        +UUID productId
        +String name
        +String sku
        +Decimal priceAdjustment
        +Boolean isPercentage
    }

    class Plan {
        +UUID id
        +String name
        +BillingInterval interval
        +Integer minQuantity
        +Date availableFrom
        +Date availableTo
        +Boolean autoClose
        +Boolean allowEarlyClose
        +Boolean allowPause
        +Boolean allowRenewal
    }

    class Quotation {
        +UUID id
        +String quoteNumber
        +UUID customerId
        +UUID planId
        +DateTime expiresAt
        +QuotationStatus status
        +UUID convertedSubscriptionId
    }

    class Subscription {
        +UUID id
        +String subscriptionNumber
        +UUID customerId
        +UUID planId
        +SubscriptionStatus status
        +Date startDate
        +Date endDate
        +Date nextBillingDate
        +PaymentTerms terms
    }

    class Invoice {
        +UUID id
        +String invoiceNumber
        +UUID subscriptionId
        +UUID customerId
        +InvoiceStatus status
        +Date issueDate
        +Date dueDate
        +Decimal subtotal
        +Decimal taxAmount
        +Decimal discountAmount
        +Decimal totalAmount
        +Decimal amountPaid
    }

    class Payment {
        +UUID id
        +UUID invoiceId
        +Decimal amount
        +PaymentMethod method
        +DateTime paidAt
        +String note
    }

    Customer "1" --> "*" Subscription : holds
    Customer "1" --> "*" Quotation : receives
    Product "1" --> "*" ProductVariant : has
    Plan "1" --> "*" Subscription : defines terms for
    Quotation "0..1" --> "1" Subscription : converts to
    Subscription "1" --> "*" Invoice : bills through
    Invoice "1" --> "*" Payment : reconciled by
```

---

## 2. Core Domain Invariants

1. **Email Uniqueness**: Every user and customer primary contact must have a distinct, validated email address.
2. **Immutable Financial History**: Confirmed invoices and executed payments can never be updated or deleted directly; reversals require credit notes or cancellation status.
3. **Deterministic Rounding**: All tax, discount, and line calculations must be computed using fixed decimal arithmetic and rounded to 2 decimal places at the invoice total level.
4. **Idempotent Billing**: A subscription cannot have two invoices for overlapping billing intervals.
5. **Quotation Conversion Guarantee**: An accepted quotation can only be converted into a subscription once. Subsequent conversion attempts must return the existing subscription.
