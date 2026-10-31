# Domain Glossary

> **Status: Confirmed Terminology**
>
> Authoritative definitions of domain entities, financial states, lifecycle stages, and operational concepts used throughout Brightloop Subscription Management.

---

## 1. Catalog & Pricing Terms

- **Product**: A sellable business software or service item offering base sales price, cost price, and descriptive notes.
- **Product Variant**: A variation of a product (e.g., brand, tier, platform) that modifies the base product price by a defined fixed adjustment (e.g., Odoo brand adds +560).
- **Plan**: Defines the recurring commercial terms under which products are billed, including interval frequency, minimum order quantities, and availability windows.
- **Billing Interval**: The recurring frequency of a plan. Permitted values:
  - `DAILY`: Billed every 24 hours.
  - `WEEKLY`: Billed every 7 days.
  - `MONTHLY`: Billed once per calendar month on the agreed billing day.
  - `YEARLY`: Billed once every 12 calendar months.
- **Minimum Quantity**: The lowest acceptable number of units/seats required to subscribe to a plan.
- **Tax Rule**: A jurisdiction or category-specific percentage applied to invoice lines.
- **Discount Rule**: A promotional or volume reduction (fixed numeric deduction or percentage rate) evaluated against minimum purchases or seat counts.

---

## 2. Sales & Subscription Lifecycle Terms

- **Quotation**: A preliminary commercial offer to a prospective customer detailing proposed plans, line items, prices, discounts, and payment terms.
- **Quotation Template**: A reusable preset of plans and product lines that standardizes quote creation for sales representatives.
- **Validity Period**: The time window (typically expressed in days or an expiration timestamp) during which a quotation remains open for customer acceptance.
- **Subscription**: A formal recurring agreement between Brightloop and a customer to deliver products/services under a specific plan.
- **Subscription Number**: A human-readable, sequentially generated unique identifier (e.g., `SUB-2026-0001`).
- **Subscription Lifecycle States**:
  - `Draft`: Initial composition stage. Lines and terms can be modified freely.
  - `Quotation`: Sent to the customer as an active quote awaiting sign-off.
  - `Confirmed`: Accepted by the customer, waiting for the start date.
  - `Active`: Operational and eligible for scheduled billing runs.
  - `Closed`: Terminated either automatically upon reaching plan expiration or manually via early closure.
- **Pause / Resume**: The temporary suspension of billing and active service without terminating the subscription agreement.

---

## 3. Invoicing & Billing Terms

- **Billing Run**: An automated batch process (triggered by scheduler or staff) that evaluates all active subscriptions and generates due invoices.
- **Billing Period**: The specific start and end dates covered by an invoice (e.g., `2026-11-01` to `2026-11-30`).
- **Invoice**: A binding financial record of amounts owed for services rendered during a billing period.
- **Invoice Lifecycle States**:
  - `Draft`: Automatically assembled by the billing worker; lines and taxes computed.
  - `Confirmed`: Approved and posted for payment collection; balance is active.
  - `Paid`: Outstanding balance is zero.
  - `Cancelled`: Voided invoice; no further payment expected.
- **Invoice Snapshot**: An immutable JSON or row capture of customer address, product names, variant adjustments, and tax rates at the exact instant an invoice is confirmed, ensuring historical reproducibility.

---

## 4. Accounts Receivable & Financial Terms

- **Payment**: A recorded receipt of funds against a specific confirmed invoice, containing amount, date, payment method, and reference notes.
- **Payment Method**: The mechanism used to deliver funds: `WIRE_TRANSFER`, `CREDIT_CARD`, `BANK_DEBIT`, `CHECK`, `CASH`, or `OTHER`.
- **Amount Paid**: The cumulative total of all valid recorded payments allocated to an invoice.
- **Outstanding Balance**: The difference between the total invoice amount and the total amount paid (`total_amount - amount_paid`).
- **Overdue Invoice**: An invoice whose status is `Confirmed`, whose outstanding balance is greater than zero, and whose payment due date has elapsed.
- **MRR (Monthly Recurring Revenue)**: The normalized monthly recurring subscription value active across all customers.
- **ARR (Annual Recurring Revenue)**: The annualized value of all active recurring subscriptions (`MRR * 12`).
