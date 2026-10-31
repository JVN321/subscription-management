# Seed Accounts & Multi-Persona Evaluation Guide

> **Repository:** `subscription-management`  
> **Target Audience:** Hackathon Evaluators, Quality Assurance, and Product Demonstrators  
> **Last Updated:** 2026-10-31  

---

## 1. Unified Demo Password

All pre-seeded accounts in the database use the exact same password for rapid demonstration and evaluation:

```
Brightloop@2026
```

This password strictly satisfies all platform password complexity requirements (>8 characters, uppercase letter, lowercase letter, number, and special character).

---

## 2. Seeded Account Inventory

The system is pre-populated with realistic business accounts covering all three role tiers (`admin`, `staff`, `customer`) and diverse subscription and invoice states:

| Role | Account Name | Email Address | Password | Persona & Scope |
|---|---|---|---|---|
| **Admin** | Alice Cooper | `admin@brightloop.com` | `Brightloop@2026` | Full platform control, software catalog setup, brand variant pricing, tax and discount rules, staff provisioning |
| **Staff** | Bob Miller | `staff@brightloop.com` | `Brightloop@2026` | Sales and billing operations, quotation authoring, 1-click subscription conversions, manual billing scan triggers |
| **Customer** | Sarah Connor | `sarah@shopflow.com` | `Brightloop@2026` | Primary client: ShopFlow Retail Solutions (Active Monthly Growth plan, settled statements) |
| **Customer** | David Vance | `techcorp@client.com` | `Brightloop@2026` | Enterprise client: TechCorp Solutions (Cloud ERP Enterprise plan, Active) |
| **Customer** | Marcus Reed | `retailhub@client.com` | `Brightloop@2026` | Mid-market client: RetailHub Stores (POS System Pro plan, Overdue Invoice requiring payment) |

---

## 3. Account Roles & Operational Capabilities

### 3.1 Admin Persona (`admin@brightloop.com`)
- **Software Catalog**: Configure base products (e.g. Brightloop ERP Core, Analytics Add-on) and brand variants (e.g. Odoo Brand variant adding +$560.00).
- **Subscription Plans**: Define billing intervals (Daily sandbox trial, Monthly growth plan, Annual enterprise plan), minimum quantities, and auto-close policies.
- **Discount & Tax Rules**: Create percentage or fixed-amount volume discounts (e.g. `VOLUME10` giving 10% off for 5+ seats) and VAT/sales tax rules.
- **Staff Provisioning**: Provision internal sales and operations team members (`POST /api/v1/staff`). Guarded by strict RBAC (`403 Forbidden` for non-admin callers).
- **Executive Telemetry**: Monitor real-time MRR, Active Subscriptions count, Settled Revenue, and Accounts Receivable via sub-10ms queries.

### 3.2 Staff Persona (`staff@brightloop.com`)
- **Quotation Workflow**: Draft quotations using pre-configured quotation templates with line items and validity windows.
- **1-Click Conversion**: Convert accepted quotations into active subscriptions without duplicate data entry.
- **Recurring Billing Execution**: Trigger periodic billing scans manually or inspect scheduler status.
- **Invoice Management**: Confirm draft invoices, download vector PDF invoices (`PDFKit`), and dispatch invoice notices via Resend.
- **Payment Recording**: Record incoming payments against invoices (wire transfer, credit card, cash) with ACID transaction balance reconciliation.

### 3.3 Customer Personas (`sarah@shopflow.com`, `techcorp@client.com`, `retailhub@client.com`)
- **Self-Service Agreement Controls**: Inspect active subscriptions and directly Pause or Resume recurring cycles (`PATCH /api/v1/subscriptions/:id/status`).
- **Invoice Statements & Ledgers**: Review invoice history, due dates, outstanding balances, and overdue notices.
- **Direct Modal Settlement**: Pay outstanding invoices directly from the portal with immediate balance deduction.
- **Vector PDF Downloads**: One-click download of itemized invoice documents.

---

## 4. Signing Up with Temporary Email Addresses

The platform supports authentication with **any temporary email address** (e.g. from `10minutemail.com`, `temp-mail.org`, or `mailinator.com`):

1. Navigate to the **Landing & Login** page or click **Sign In** in the top navigation bar.
2. Select the **Sign Up (Temp Mail)** tab.
3. Enter:
   - **Contact Name**: Your name (e.g. `Test Evaluator`)
   - **Company Name**: Your organization (e.g. `Evaluator Corp`)
   - **Email Address**: Any temporary inbox email address
   - **Password**: `Brightloop@2026`
4. Click **Create Account & Enter Portal**.
5. The system automatically creates your user and customer record, dispatches a welcome email via Resend, and logs you directly into your personalized Customer Self-Service Portal.

---

## 5. Resend Email Delivery

When `RESEND_API_KEY` is configured in the root `.env` file:
- **Welcome Email**: Dispatched automatically upon temporary email sign-up.
- **Password Reset**: Dispatched when clicking "Forgot password?" in the login form.
- **Invoice Notice**: Dispatched when clicking the Mail icon next to any invoice in the Invoices tab (`POST /api/v1/invoices/:id/send`).

When no API key is configured, emails are cleanly simulated and logged to the backend API console in real time without errors.
