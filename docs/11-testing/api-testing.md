# API Testing & HTTP Contracts

> **Automated HTTP boundary, authorization, validation, and PDF rendering verification**

---

## 1. Scope & Execution

The API test suite (`apps/api/test/api.test.ts`) tests the live HTTP interface powered by Hono and `@hono/node-server`.

Run command:
```bash
pnpm --filter @repo/api test
```

## 2. Invariants Tested

1. **Health & Liveness**:
   - `GET /api/v1/health` guarantees operational uptime and timestamp logging.
2. **Authentication & Password Complexity**:
   - `POST /api/v1/auth/sign-up` validates minimum length (>8), uppercase, lowercase, and special characters, rejecting insecure credentials with `400 VALIDATION_ERROR`.
3. **Role-Based Authorization (RBAC)**:
   - `POST /api/v1/staff` verifies that only authenticated users with the `admin` role can provision staff, rejecting customer or unauthorized requests with `403 FORBIDDEN`.
4. **Quotation Conversion**:
   - `POST /api/v1/quotations/:id/convert` tests 1-click atomic conversion into active subscriptions, ensuring the quotation is marked `CONVERTED` and lines are copied immutably.
5. **PDFKit Generation**:
   - `GET /api/v1/invoices/:id/pdf` verifies that the response stream is a valid binary PDF starting with the `%PDF-` header and containing full line-item details.
6. **Payment Recording**:
   - `POST /api/v1/invoices/:id/payments` checks balance recalculations, updates `amountPaid`, and transitions the invoice from `CONFIRMED` to `PAID` when fully settled.
