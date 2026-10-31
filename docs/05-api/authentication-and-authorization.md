# API Authentication & Authorization

> **Status: Confirmed Security Standard**
>
> Session cookie management, bearer token support, role guards, and customer record isolation.

---

## 1. Authentication Mechanisms

`apps/api` accepts authentication credentials via:
1. **HTTP-Only Secure Cookies**: Handled automatically by Better Auth for browser clients (`apps/web`). Prevents XSS token exfiltration.
2. **Authorization Header**: `Bearer <session_token>` for programmatic API consumers or external scripts.

---

## 2. Authorization & RBAC Pipeline

Endpoints enforce access through modular middleware wrappers:

```typescript
// Example endpoint definition with role guard:
app.openapi(
  createProductRoute,
  requireRole('admin'), // Rejects non-admin users with 403 Forbidden
  async (c) => {
    // Handler logic
  }
);
```

---

## 3. Customer Tenant & Resource Isolation

Customers must only access records belonging to their account:
- In every endpoint accessible by customers (e.g. `GET /api/v1/subscriptions`, `GET /api/v1/invoices/:id/pdf`), the handler enforces:
```typescript
if (user.role === 'customer') {
  const customerId = user.customerId;
  if (!customerId || targetResource.customerId !== customerId) {
    return c.json({ error: { code: 'FORBIDDEN', message: 'Access denied to this record' } }, 403);
  }
}
```
This guarantees that customer users cannot enumerate or inspect records belonging to other customers.
