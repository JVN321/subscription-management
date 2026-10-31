# Users, Roles & Authorization

> **Status: Confirmed Domain Specification**
>
> Role-based access control (RBAC), credential policies, user creation privileges, and self-service portal rules.

---

## 1. User Roles & Permission Matrix

The system enforces three distinct user roles:

| Capability / Resource | Admin | Staff / Sales | Customer |
|---|:---:|:---:|:---:|
| **Manage System Settings & Taxes** | ✅ Full Access | ❌ Denied | ❌ Denied |
| **Create & Manage Staff Accounts** | ✅ Full Access | ❌ Denied | ❌ Denied |
| **Configure Products, Variants & Plans** | ✅ Full Access | 👁️ Read-Only | ❌ Denied |
| **Configure Discount Rules** | ✅ Full Access | 👁️ Read-Only | ❌ Denied |
| **Create & Convert Quotations** | ✅ Full Access | ✅ Full Access | ❌ Denied |
| **Manage Subscriptions (Pause, Close, Renew)** | ✅ Full Access | ✅ Full Access | 👁️ Read Own Only |
| **Trigger Billing Runs & Confirm Invoices** | ✅ Full Access | ✅ Full Access | ❌ Denied |
| **Record Customer Payments** | ✅ Full Access | ✅ Full Access | ❌ Denied |
| **View Financial Dashboard & Revenue Metrics** | ✅ Full Access | 👁️ Operational Only | ❌ Denied |
| **Customer Portal (View Plans, Download PDFs)** | ✅ Full Access | ✅ Full Access | 👁️ Own Records Only |

---

## 2. Credential & Password Security Rules

In accordance with the project problem statement (Scene 1):
- **Email Uniqueness**: Each user account is strictly identified by a globally unique email address.
- **Password Complexity Rules**:
  - Minimum length: **more than 8 characters** (minimum 9 characters).
  - Must contain at least one **uppercase letter** (`[A-Z]`).
  - Must contain at least one **lowercase letter** (`[a-z]`).
  - Must contain at least one **special character** (`[!@#$%^&*(),.?":{}|<>]`).
- **Password Reset**:
  - Triggered via `POST /api/v1/auth/forget-password`.
  - Sends a cryptographically signed, single-use token valid for 60 minutes via Resend email.
  - Rate limited to 3 requests per IP/account per hour.

---

## 3. Account Provisioning Rules

1. **Staff Provisioning**:
   - Only users with the `admin` role can create new staff accounts via `POST /api/v1/staff`.
   - Admin-created staff accounts receive an activation email with a secure link to set their initial password.
2. **Customer Registration**:
   - Customers can self-register via the online signup portal (`POST /api/v1/auth/sign-up/email`) or be provisioned by a staff member during quote preparation.
   - Every customer account is bound to a single `customer_id` in the database, restricting all portal queries to records owned by that customer.
