# API Contract: OpenAPI 3.1 & Documentation

> **Status: Confirmed Architecture**
>
> Contract-first API specifications, interactive documentation, and client SDK generation using `@hono/zod-openapi`.

---

## 1. Role & Technology Overview

API routes in `apps/api` are declared using `@hono/zod-openapi`. This ties together HTTP routing, runtime Zod validation, and OpenAPI 3.1 document generation into a single type-safe declaration.

Benefits:
- **No Documentation Drift**: The OpenAPI specification is automatically derived from the live running code.
- **Interactive UI**: Ships with built-in Scalar or Swagger UI served directly at `/api/docs`.
- **Client Generation**: Frontend clients in `apps/web` can generate typed RPC fetch callers directly from the OpenAPI schema.

---

## 2. Route Definition Pattern

```typescript
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { ProductSchema, ErrorEnvelopeSchema } from '@repo/contracts';

export const getProductByIdRoute = createRoute({
  method: 'get',
  path: '/api/v1/products/{id}',
  summary: 'Retrieve product by ID',
  description: 'Returns product details including variants and current pricing.',
  request: {
    params: z.object({
      id: z.string().uuid({ description: 'Unique product identifier' })
    })
  },
  responses: {
    200: {
      content: { 'application/json': { schema: ProductSchema } },
      description: 'Product retrieved successfully'
    },
    404: {
      content: { 'application/json': { schema: ErrorEnvelopeSchema } },
      description: 'Product not found'
    }
  }
});
```

---

## 3. OpenAPI Documentation Endpoint

The API server mounts documentation endpoints under `/api/`:
- `GET /api/v1/openapi.json`: Machine-readable OpenAPI 3.1 specification.
- `GET /api/docs`: Interactive web interface (Scalar or Swagger UI) for testing endpoints directly in the browser.
