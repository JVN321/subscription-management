# API Conventions & Standards

> **Status: Confirmed API Standards**
>
> REST conventions, versioning, response envelopes, pagination, error schemas, and rate limiting for `apps/api`.

---

## 1. Versioning & URL Structure

- All public API routes are prefixed with `/api/v1/`.
- Paths use kebab-case resource nouns (e.g., `/api/v1/quotation-templates`, `/api/v1/product-variants`).
- Standard REST HTTP verbs:
  - `GET`: Retrieve resource or collection (idempotent, safe).
  - `POST`: Create resource or trigger an action.
  - `PATCH`: Partial update of a resource.
  - `DELETE`: Deactivate / delete a resource.

---

## 2. Standard Response & Error Envelopes

### Success Envelope
Single resources return the object directly or wrapped in `data`:
```json
{
  "data": {
    "id": "c56a4180-65aa-42ec-a945-5fd21dec0538",
    "subscriptionNumber": "SUB-2026-0001",
    "status": "ACTIVE"
  }
}
```

### Collection Envelope with Keyset Pagination
```json
{
  "data": [ ... ],
  "pagination": {
    "nextCursor": "eyJjcmVhdGVkQXQiOiIyMDI2LTEwLTAxVDAwOjAwOjAwWiIsImlkIjoiMTIzIn0=",
    "hasMore": true,
    "limit": 50
  }
}
```

### Standard Error Envelope (RFC 7807 Aligned)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "salesPrice",
        "issue": "Must be a valid decimal string"
      }
    ],
    "traceId": "4bf92f3577b34da6a3ce929d0e0e4736"
  }
}
```

---

## 3. Standard HTTP Status Codes

- `200 OK`: Successful read or update.
- `201 Created`: Resource successfully created.
- `204 No Content`: Successful deletion.
- `400 Bad Request`: Schema validation error.
- `401 Unauthorized`: Missing or invalid session cookie/token.
- `403 Forbidden`: Authenticated user lacks required role.
- `404 Not Found`: Resource does not exist.
- `409 Conflict`: Business invariant collision (e.g. duplicate email or double conversion).
- `429 Too Many Requests`: Rate limit threshold exceeded.
- `500 Internal Server Error`: Unexpected unhandled error (stack traces hidden from client).
