# Security Baseline & Hardening

> **Status: Confirmed Security Standard**
>
> Security controls, OWASP alignment, encryption standards, authentication hardening, and audit logging.

---

## 1. Security Architecture & Threat Model

The Brightloop Subscription Management System processes financial records, subscription agreements, and customer PII. It enforces defensive security controls at every layer:

1. **Defense in Depth**:
   - Boundary validation using Zod ensures no malformed payloads reach application services.
   - Database parameterization via Drizzle ORM prevents SQL injection.
   - Output encoding in TanStack Start prevents Cross-Site Scripting (XSS).
2. **Authentication & Session Hardening**:
   - Passwords hashed with **Argon2id** (or scrypt) via Better Auth.
   - Session cookies configured with `HttpOnly`, `Secure` (in production), `SameSite=Lax`, and path restricted to `/`.
   - Rate limiting on sensitive endpoints (`/api/v1/auth/sign-in`, `/api/v1/auth/forget-password`) to thwart credential stuffing and brute-force attacks.
3. **Authorization & Tenant Isolation**:
   - Server-side RBAC middleware validates user role on every protected request.
   - All customer queries scope by `customer_id` derived directly from the authenticated session, never from client-supplied request bodies.

---

## 2. Audit Logging

Every critical financial or lifecycle action produces an immutable audit log entry in the `audit_logs` table:
- Subscription status changes (`ACTIVE -> PAUSED`, `ACTIVE -> CLOSED`).
- Invoice confirmation, cancellation, or manual edits.
- Payment recording or reversal.
- Creation of staff accounts or modification of discount rules.

Each audit entry captures:
- `id`: UUID.
- `user_id`: Acting user.
- `action`: E.g. `INVOICE_CONFIRMED`, `PAYMENT_RECORDED`.
- `entity_type` & `entity_id`: E.g. `invoices`, `INV-2026-0042`.
- `payload_diff`: JSON representation of before and after states.
- `ip_address` & `user_agent`.
- `created_at`: UTC timestamp.
