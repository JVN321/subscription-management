import { z } from 'zod';

// ==========================================
// 1. Core Primitives & Enums
// ==========================================

export const DecimalStringSchema = z
  .string()
  .regex(/^-?\d+(\.\d{1,4})?$/, 'Must be a valid decimal string with up to 4 decimal places');

export const UserRoleSchema = z.enum(['admin', 'staff', 'customer']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const BillingIntervalSchema = z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']);
export type BillingInterval = z.infer<typeof BillingIntervalSchema>;

export const ProductTypeSchema = z.enum(['SOFTWARE', 'SERVICE', 'ADD_ON', 'HARDWARE']);
export type ProductType = z.infer<typeof ProductTypeSchema>;

export const SubscriptionStatusSchema = z.enum([
  'DRAFT',
  'QUOTATION',
  'CONFIRMED',
  'ACTIVE',
  'PAUSED',
  'CLOSED'
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

export const InvoiceStatusSchema = z.enum(['DRAFT', 'CONFIRMED', 'PAID', 'CANCELLED']);
export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>;

export const PaymentMethodSchema = z.enum([
  'WIRE_TRANSFER',
  'CREDIT_CARD',
  'BANK_DEBIT',
  'CHECK',
  'CASH',
  'OTHER'
]);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const DiscountTypeSchema = z.enum(['FIXED_AMOUNT', 'PERCENTAGE']);
export type DiscountType = z.infer<typeof DiscountTypeSchema>;

export const DiscountTargetTypeSchema = z.enum(['PRODUCT', 'SUBSCRIPTION']);
export type DiscountTargetType = z.infer<typeof DiscountTargetTypeSchema>;

// ==========================================
// 2. Authentication & User Schemas
// ==========================================

export const PasswordSchema = z
  .string()
  .min(9, 'Password must be greater than 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const SignUpSchema = z.object({
  email: z.string().email(),
  password: PasswordSchema,
  name: z.string().min(1).max(255),
  companyName: z.string().optional(),
  role: UserRoleSchema.default('customer')
});
export type SignUpInput = z.infer<typeof SignUpSchema>;

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});
export type SignInInput = z.infer<typeof SignInSchema>;

// ==========================================
// 3. Customer Schemas
// ==========================================

export const CreateCustomerSchema = z.object({
  companyName: z.string().min(1).max(255),
  contactName: z.string().min(1).max(255),
  email: z.string().email(),
  phone: z.string().optional(),
  taxIdentifier: z.string().optional(),
  billingAddress: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().default('US')
    })
    .default({ country: 'US' }),
  paymentTerms: z.string().default('NET_30')
});
export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;

// ==========================================
// 4. Products & Variants Schemas
// ==========================================

export const CreateVariantSchema = z.object({
  name: z.string().min(1).max(100),
  sku: z.string().min(1).max(50),
  priceAdjustment: DecimalStringSchema, // e.g. "560.0000" for Odoo brand
  isPercentage: z.boolean().default(false)
});
export type CreateVariantInput = z.infer<typeof CreateVariantSchema>;

export const CreateProductSchema = z.object({
  name: z.string().min(1).max(255),
  productType: ProductTypeSchema.default('SOFTWARE'),
  salesPrice: DecimalStringSchema,
  costPrice: DecimalStringSchema.default('0.0000'),
  notes: z.string().optional(),
  variants: z.array(CreateVariantSchema).default([])
});
export type CreateProductInput = z.infer<typeof CreateProductSchema>;

// ==========================================
// 5. Plans Schemas
// ==========================================

export const CreatePlanSchema = z.object({
  name: z.string().min(1).max(255),
  billingInterval: BillingIntervalSchema,
  intervalCount: z.number().int().min(1).default(1),
  minQuantity: z.number().int().min(1).default(1),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional(),
  autoClose: z.boolean().default(false),
  allowEarlyClose: z.boolean().default(true),
  allowPause: z.boolean().default(true),
  allowRenewal: z.boolean().default(true)
});
export type CreatePlanInput = z.infer<typeof CreatePlanSchema>;

// ==========================================
// 6. Tax & Discount Schemas
// ==========================================

export const CreateTaxSchema = z.object({
  name: z.string().min(1).max(100),
  rate: DecimalStringSchema, // e.g. "0.2000" for 20% VAT
  isInclusive: z.boolean().default(false),
  countryCode: z.string().optional(),
  state: z.string().optional()
});
export type CreateTaxInput = z.infer<typeof CreateTaxSchema>;

export const CreateDiscountSchema = z.object({
  code: z.string().min(1).max(50),
  discountType: DiscountTypeSchema,
  value: DecimalStringSchema, // e.g. "50.0000" or "0.1000" for 10%
  targetType: DiscountTargetTypeSchema.default('SUBSCRIPTION'),
  productId: z.string().uuid().optional(),
  minPurchaseAmount: DecimalStringSchema.default('0.0000'),
  minQuantity: z.number().int().min(0).default(0),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxUses: z.number().int().positive().optional()
});
export type CreateDiscountInput = z.infer<typeof CreateDiscountSchema>;

// ==========================================
// 7. Quotation & Template Schemas
// ==========================================

export const QuotationLineInputSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().int().min(1),
  unitPrice: DecimalStringSchema
});

export const CreateQuotationSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
  notes: z.string().optional(),
  validityDays: z.number().int().positive().default(30),
  lines: z.array(QuotationLineInputSchema).min(1, 'At least one line item required')
});
export type CreateQuotationInput = z.infer<typeof CreateQuotationSchema>;

export const CreateQuotationTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  defaultPlanId: z.string().uuid(),
  validityDays: z.number().int().positive().default(30),
  lines: z.array(QuotationLineInputSchema).default([])
});
export type CreateQuotationTemplateInput = z.infer<typeof CreateQuotationTemplateSchema>;

// ==========================================
// 8. Subscription Schemas
// ==========================================

export const CreateSubscriptionSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
  quotationId: z.string().uuid().optional(),
  startDate: z.string(), // ISO Date string YYYY-MM-DD
  endDate: z.string().optional(),
  paymentTerms: z.string().default('NET_30'),
  lines: z.array(QuotationLineInputSchema).min(1)
});
export type CreateSubscriptionInput = z.infer<typeof CreateSubscriptionSchema>;

// ==========================================
// 9. Invoices & Payments Schemas
// ==========================================

export const RecordPaymentSchema = z.object({
  amount: DecimalStringSchema,
  paymentMethod: PaymentMethodSchema,
  paymentDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  notes: z.string().optional()
});
export type RecordPaymentInput = z.infer<typeof RecordPaymentSchema>;

export const TriggerBillingRunSchema = z.object({
  targetDate: z.string().optional() // Defaults to current date if omitted
});
export type TriggerBillingRunInput = z.infer<typeof TriggerBillingRunSchema>;
