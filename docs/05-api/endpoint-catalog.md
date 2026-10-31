# Comprehensive API Endpoint Catalog & Routing

> **Status: Confirmed API Specification**
>
> Complete index of all HTTP routes, request payloads, response schemas, and access control policies for `apps/api`.

---

## 1. Authentication & Identity (`/api/v1/auth/*`)

| Method | Endpoint Path | Role Allowed | Description | Request Body | Response (Success) |
|---|---|---|---|---|---|
| `POST` | `/api/v1/auth/sign-in/email` | Public | Authenticate with email & password | `{ email, password }` | `{ user, session }` (200) |
| `POST` | `/api/v1/auth/sign-up/email` | Public | Self-service customer signup | `{ email, password, name, companyName }` | `{ user, session }` (201) |
| `POST` | `/api/v1/auth/sign-out` | Authenticated | Terminate session & clear cookies | None | `{ success: true }` (200) |
| `POST` | `/api/v1/auth/forget-password` | Public | Request password reset email | `{ email }` | `{ status: true }` (200) |
| `POST` | `/api/v1/auth/reset-password` | Public | Execute password reset with token | `{ token, newPassword }` | `{ status: true }` (200) |
| `GET` | `/api/v1/auth/session` | Authenticated | Retrieve active session details | None | `{ user, session }` (200) |

---

## 2. Staff Management (`/api/v1/staff/*`)

| Method | Endpoint Path | Role Allowed | Description | Request Body | Response (Success) |
|---|---|---|---|---|---|
| `GET` | `/api/v1/staff` | Admin | List all staff members | Query: `?cursor=&limit=` | `{ data: Staff[], pagination }` |
| `POST` | `/api/v1/staff` | Admin | Provision new staff user (Scene 1) | `{ email, name, role: 'staff' }` | `{ data: Staff }` (201) |
| `PATCH` | `/api/v1/staff/:id` | Admin | Update staff status or details | `{ name?, isActive? }` | `{ data: Staff }` (200) |

---

## 3. Customers (`/api/v1/customers/*`)

| Method | Endpoint Path | Role Allowed | Description | Request Body | Response (Success) |
|---|---|---|---|---|---|
| `GET` | `/api/v1/customers` | Admin, Staff | List customers with search/filters | Query: `?search=&cursor=&limit=` | `{ data: Customer[], pagination }` |
| `POST` | `/api/v1/customers` | Admin, Staff | Create customer record | `{ companyName, email, phone, billingAddress }` | `{ data: Customer }` (201) |
| `GET` | `/api/v1/customers/:id` | Admin, Staff, Customer (Own) | Retrieve customer details | None | `{ data: Customer }` (200) |
| `PATCH` | `/api/v1/customers/:id` | Admin, Staff, Customer (Own) | Update customer profile/billing address | `{ companyName?, phone?, billingAddress? }` | `{ data: Customer }` (200) |

---

## 4. Products & Variants (`/api/v1/products/*`)

| Method | Endpoint Path | Role Allowed | Description | Request Body | Response (Success) |
|---|---|---|---|---|---|
| `GET` | `/api/v1/products` | Admin, Staff, Customer | List products with variant trees | Query: `?type=&cursor=&limit=` | `{ data: Product[], pagination }` |
| `POST` | `/api/v1/products` | Admin | Create product with initial variants | `{ name, productType, salesPrice, costPrice, notes, variants }` | `{ data: Product }` (201) |
| `GET` | `/api/v1/products/:id` | Admin, Staff, Customer | Get product details | None | `{ data: Product }` (200) |
| `PATCH` | `/api/v1/products/:id` | Admin | Update product information | `{ name?, salesPrice?, costPrice?, notes? }` | `{ data: Product }` (200) |
| `POST` | `/api/v1/products/:id/variants` | Admin | Add variant (e.g. Odoo brand +560) | `{ name, sku, priceAdjustment, isPercentage }` | `{ data: Variant }` (201) |
| `PATCH` | `/api/v1/products/:id/variants/:variantId` | Admin | Update variant adjustment | `{ name?, priceAdjustment?, isActive? }` | `{ data: Variant }` (200) |

---

## 5. Plans (`/api/v1/plans/*`)

| Method | Endpoint Path | Role Allowed | Description | Request Body | Response (Success) |
|---|---|---|---|---|---|
| `GET` | `/api/v1/plans` | Admin, Staff, Customer | List available recurring plans | Query: `?interval=&cursor=` | `{ data: Plan[], pagination }` |
| `POST` | `/api/v1/plans` | Admin | Create plan with policies | `{ name, billingInterval, minQuantity, autoClose, allowPause... }` | `{ data: Plan }` (201) |
| `PATCH` | `/api/v1/plans/:id` | Admin | Update plan rules | `{ minQuantity?, allowPause?, allowRenewal? }` | `{ data: Plan }` (200) |

---

## 6. Taxes & Discounts (`/api/v1/taxes/*`, `/api/v1/discounts/*`)

| Method | Endpoint Path | Role Allowed | Description | Request Body | Response (Success) |
|---|---|---|---|---|---|
| `GET` | `/api/v1/taxes` | Admin, Staff | List configured tax rules | None | `{ data: Tax[] }` (200) |
| `POST` | `/api/v1/taxes` | Admin | Create new tax rule | `{ name, rate, isInclusive, countryCode }` | `{ data: Tax }` (201) |
| `GET` | `/api/v1/discounts` | Admin, Staff | List discount rules & usage stats | Query: `?status=active` | `{ data: Discount[] }` (200) |
| `POST` | `/api/v1/discounts` | Admin | Create discount rule (Scene 5) | `{ code, discountType, value, minQuantity, maxUses... }` | `{ data: Discount }` (201) |

---

## 7. Quotation Templates & Quotations (`/api/v1/quotations/*`)

| Method | Endpoint Path | Role Allowed | Description | Request Body | Response (Success) |
|---|---|---|---|---|---|
| `GET` | `/api/v1/quotation-templates` | Admin, Staff | List reusable quotation templates | None | `{ data: QuotationTemplate[] }` (200) |
| `POST` | `/api/v1/quotation-templates` | Admin | Create quotation template | `{ name, defaultPlanId, validityDays, lines }` | `{ data: QuotationTemplate }` (201) |
| `GET` | `/api/v1/quotations` | Admin, Staff | List quotations | Query: `?status=&customerId=&cursor=` | `{ data: Quotation[], pagination }` |
| `POST` | `/api/v1/quotations` | Admin, Staff | Create quotation from template/custom | `{ customerId, planId, lines, terms, expiresAt }` | `{ data: Quotation }` (201) |
| `GET` | `/api/v1/quotations/:id` | Admin, Staff, Customer | Retrieve quotation | None | `{ data: Quotation }` (200) |
| `POST` | `/api/v1/quotations/:id/convert` | Admin, Staff | Idempotently convert quote to subscription | None | `{ data: Subscription }` (200) |

---

## 8. Subscriptions (`/api/v1/subscriptions/*`)

| Method | Endpoint Path | Role Allowed | Description | Request Body | Response (Success) |
|---|---|---|---|---|---|
| `GET` | `/api/v1/subscriptions` | Admin, Staff, Customer (Own) | List subscriptions with filters | Query: `?status=&customerId=&cursor=` | `{ data: Subscription[], pagination }` |
| `GET` | `/api/v1/subscriptions/:id` | Admin, Staff, Customer (Own) | Retrieve subscription & line details | None | `{ data: Subscription }` (200) |
| `POST` | `/api/v1/subscriptions` | Admin, Staff | Direct manual subscription creation | `{ customerId, planId, startDate, lines }` | `{ data: Subscription }` (201) |
| `PATCH` | `/api/v1/subscriptions/:id/pause` | Admin, Staff | Pause active subscription | `{ reason? }` | `{ data: Subscription }` (200) |
| `PATCH` | `/api/v1/subscriptions/:id/resume` | Admin, Staff | Resume paused subscription | None | `{ data: Subscription }` (200) |
| `PATCH` | `/api/v1/subscriptions/:id/close` | Admin, Staff | Early close/termination | `{ terminationDate, reason? }` | `{ data: Subscription }` (200) |

---

## 9. Billing & Invoices (`/api/v1/billing/*`, `/api/v1/invoices/*`)

| Method | Endpoint Path | Role Allowed | Description | Request Body | Response (Success) |
|---|---|---|---|---|---|
| `POST` | `/api/v1/billing/trigger` | Admin, Staff | Trigger manual bulk billing run | `{ targetDate? }` | `{ billingRunId, enqueuedJobs }` (202) |
| `GET` | `/api/v1/invoices` | Admin, Staff, Customer (Own) | List invoices with status & overdue flags | Query: `?status=&isOverdue=&cursor=` | `{ data: Invoice[], pagination }` |
| `GET` | `/api/v1/invoices/:id` | Admin, Staff, Customer (Own) | Get invoice breakdown | None | `{ data: Invoice }` (200) |
| `PATCH` | `/api/v1/invoices/:id/confirm` | Admin, Staff | Confirm draft invoice & post balance | None | `{ data: Invoice }` (200) |
| `PATCH` | `/api/v1/invoices/:id/cancel` | Admin, Staff | Void invoice | `{ reason }` | `{ data: Invoice }` (200) |
| `GET` | `/api/v1/invoices/:id/pdf` | Admin, Staff, Customer (Own) | Stream/download generated PDFKit file | None | Binary PDF Stream (`application/pdf`) |
| `POST` | `/api/v1/invoices/:id/send` | Admin, Staff | Trigger email delivery of invoice PDF | None | `{ success: true }` (200) |

---

## 10. Payments (`/api/v1/invoices/:id/payments`)

| Method | Endpoint Path | Role Allowed | Description | Request Body | Response (Success) |
|---|---|---|---|---|---|
| `GET` | `/api/v1/invoices/:id/payments` | Admin, Staff, Customer (Own) | List recorded payments for an invoice | None | `{ data: Payment[] }` (200) |
| `POST` | `/api/v1/invoices/:id/payments` | Admin, Staff | Record payment against invoice | `{ amount, paymentMethod, paymentDate, notes }` | `{ data: Payment, invoice: Invoice }` (201) |

---

## 11. Reports & Health (`/api/v1/reports/*`, `/api/v1/health`)

| Method | Endpoint Path | Role Allowed | Description | Request Body | Response (Success) |
|---|---|---|---|---|---|
| `GET` | `/api/v1/reports/summary` | Admin, Staff | Executive financial dashboard summary | None | `{ activeSubscriptions, revenue, amountOwed, overdueInvoices }` (200) |
| `GET` | `/api/v1/reports/overdue` | Admin, Staff | Detailed list of overdue accounts | Query: `?cursor=&limit=` | `{ data: OverdueReportItem[], pagination }` |
| `GET` | `/api/v1/health` | Public | Service liveness probe | None | `{ status: 'ok', timestamp }` (200) |
| `GET` | `/api/v1/ready` | Public | Database & Redis readiness check | None | `{ status: 'ready', db: 'ok', redis: 'ok' }` (200) |
