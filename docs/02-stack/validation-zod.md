# Validation: Zod

> **Status: Confirmed Architecture**
>
> Runtime data validation, schema composition, environment variable parsing, and DTO sharing via Zod.

---

## 1. Role & Technology Overview

**Zod** is the universal validation and type inference engine across the entire monorepo. It guarantees that untrusted input from HTTP requests, environment files, and external APIs is validated before execution.

Key Rules:
- **Parse at Boundaries**: Validate immediately upon receiving input in route handlers or worker jobs.
- **Single Source of Truth**: Zod schemas defined in `packages/contracts` generate both runtime validation checks and TypeScript static types (`z.infer<typeof Schema>`).
- **Eliminate Schema Duplication**: Use `drizzle-zod` where applicable to derive input schemas directly from Drizzle table definitions.

---

## 2. Directory Structure (`packages/contracts`)

```text
packages/contracts/
├── src/
│   ├── index.ts                     # Master contract export
│   ├── common.ts                    # Pagination, UUID, date, money schemas
│   ├── auth.ts                      # Sign-in, sign-up, password reset schemas
│   ├── products.ts                  # Product & variant schemas
│   ├── plans.ts                     # Plan interval & rule schemas
│   ├── quotations.ts                # Quotation & template schemas
│   ├── subscriptions.ts             # Subscription creation & mutation schemas
│   ├── billing.ts                   # Billing run & invoice schemas
│   └── payments.ts                  # Payment entry schemas
├── package.json
└── tsconfig.json
```

---

## 3. Example Schema Definitions

```typescript
import { z } from 'zod';

// Money and interval primitives
export const CurrencyAmountSchema = z.string().regex(/^\d+(\.\d{1,4})?$/, 'Must be a valid decimal string');
export const BillingIntervalSchema = z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']);

// Product Variant Schema
export const CreateProductVariantSchema = z.object({
  name: z.string().min(1).max(100),
  sku: z.string().min(1).max(50),
  priceAdjustment: CurrencyAmountSchema, // e.g., "560.0000" for Odoo brand
  isPercentage: z.boolean().default(false)
});

// Product Schema
export const CreateProductSchema = z.object({
  name: z.string().min(1).max(255),
  productType: z.enum(['SERVICE', 'SOFTWARE', 'HARDWARE', 'CONSUMABLE']),
  salesPrice: CurrencyAmountSchema,
  costPrice: CurrencyAmountSchema,
  notes: z.string().optional(),
  variants: z.array(CreateProductVariantSchema).default([])
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
```
