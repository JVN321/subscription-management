import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  integer,
  boolean,
  date,
  timestamp,
  jsonb,
  uniqueIndex,
  index
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ==========================================
// 1. Users & Accounts
// ==========================================
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('customer'),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// ==========================================
// 2. Customers
// ==========================================
export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  contactName: varchar('contact_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }),
  taxIdentifier: varchar('tax_identifier', { length: 100 }),
  billingAddress: jsonb('billing_address').default({ country: 'US' }),
  paymentTerms: varchar('payment_terms', { length: 50 }).default('NET_30').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// ==========================================
// 3. Products & Variants
// ==========================================
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  productType: varchar('product_type', { length: 50 }).default('SOFTWARE').notNull(),
  salesPrice: numeric('sales_price', { precision: 14, scale: 4 }).notNull(),
  costPrice: numeric('cost_price', { precision: 14, scale: 4 }).default('0.0000').notNull(),
  notes: text('notes'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const productVariants = pgTable('product_variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  sku: varchar('sku', { length: 50 }).notNull().unique(),
  priceAdjustment: numeric('price_adjustment', { precision: 14, scale: 4 }).notNull(), // e.g. 560.0000 for Odoo brand
  isPercentage: boolean('is_percentage').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// ==========================================
// 4. Plans
// ==========================================
export const plans = pgTable('plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  billingInterval: varchar('billing_interval', { length: 50 }).notNull(), // DAILY, WEEKLY, MONTHLY, YEARLY
  intervalCount: integer('interval_count').default(1).notNull(),
  minQuantity: integer('min_quantity').default(1).notNull(),
  availableFrom: date('available_from'),
  availableTo: date('available_to'),
  autoClose: boolean('auto_close').default(false).notNull(),
  allowEarlyClose: boolean('allow_early_close').default(true).notNull(),
  allowPause: boolean('allow_pause').default(true).notNull(),
  allowRenewal: boolean('allow_renewal').default(true).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// ==========================================
// 5. Taxes & Discounts
// ==========================================
export const taxes = pgTable('taxes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  rate: numeric('rate', { precision: 14, scale: 4 }).notNull(), // e.g. 0.2000 for 20%
  isInclusive: boolean('is_inclusive').default(false).notNull(),
  countryCode: varchar('country_code', { length: 10 }),
  state: varchar('state', { length: 50 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const discounts = pgTable('discounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  discountType: varchar('discount_type', { length: 50 }).notNull(), // FIXED_AMOUNT, PERCENTAGE
  value: numeric('value', { precision: 14, scale: 4 }).notNull(),
  targetType: varchar('target_type', { length: 50 }).default('SUBSCRIPTION').notNull(), // PRODUCT, SUBSCRIPTION
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  minPurchaseAmount: numeric('min_purchase_amount', { precision: 14, scale: 4 }).default('0.0000').notNull(),
  minQuantity: integer('min_quantity').default(0).notNull(),
  startDate: date('start_date'),
  endDate: date('end_date'),
  maxUses: integer('max_uses'),
  timesUsed: integer('times_used').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// ==========================================
// 6. Quotation Templates & Quotations
// ==========================================
export const quotationTemplates = pgTable('quotation_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  defaultPlanId: uuid('default_plan_id').references(() => plans.id, { onDelete: 'restrict' }).notNull(),
  validityDays: integer('validity_days').default(30).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const quotations = pgTable('quotations', {
  id: uuid('id').defaultRandom().primaryKey(),
  quoteNumber: varchar('quote_number', { length: 50 }).notNull().unique(),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'restrict' }).notNull(),
  planId: uuid('plan_id').references(() => plans.id, { onDelete: 'restrict' }).notNull(),
  status: varchar('status', { length: 50 }).default('DRAFT').notNull(), // DRAFT, SENT, ACCEPTED, CONVERTED, CANCELLED, EXPIRED
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  convertedSubscriptionId: uuid('converted_subscription_id'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const quotationLines = pgTable('quotation_lines', {
  id: uuid('id').defaultRandom().primaryKey(),
  quotationId: uuid('quotation_id').references(() => quotations.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'restrict' }).notNull(),
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
  quantity: integer('quantity').default(1).notNull(),
  unitPrice: numeric('unit_price', { precision: 14, scale: 4 }).notNull(),
  amount: numeric('amount', { precision: 14, scale: 4 }).notNull()
});

// ==========================================
// 7. Subscriptions
// ==========================================
export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    subscriptionNumber: varchar('subscription_number', { length: 50 }).notNull().unique(),
    customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'restrict' }).notNull(),
    planId: uuid('plan_id').references(() => plans.id, { onDelete: 'restrict' }).notNull(),
    quotationId: uuid('quotation_id').references(() => quotations.id, { onDelete: 'set null' }),
    status: varchar('status', { length: 50 }).default('DRAFT').notNull(), // DRAFT, QUOTATION, CONFIRMED, ACTIVE, PAUSED, CLOSED
    startDate: date('start_date').notNull(),
    endDate: date('end_date'),
    nextBillingDate: date('next_billing_date').notNull(),
    paymentTerms: varchar('payment_terms', { length: 50 }).default('NET_30').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    statusBillingIdx: index('idx_sub_status_billing').on(table.status, table.nextBillingDate),
    customerIdx: index('idx_sub_customer').on(table.customerId)
  })
);

export const subscriptionLines = pgTable('subscription_lines', {
  id: uuid('id').defaultRandom().primaryKey(),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'restrict' }).notNull(),
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
  quantity: integer('quantity').default(1).notNull(),
  unitPrice: numeric('unit_price', { precision: 14, scale: 4 }).notNull(),
  taxId: uuid('tax_id').references(() => taxes.id, { onDelete: 'set null' }),
  discountId: uuid('discount_id').references(() => discounts.id, { onDelete: 'set null' }),
  totalAmount: numeric('total_amount', { precision: 14, scale: 4 }).notNull()
});

// ==========================================
// 8. Invoices & Invoice Lines
// ==========================================
export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    invoiceNumber: varchar('invoice_number', { length: 50 }).notNull().unique(),
    subscriptionId: uuid('subscription_id').references(() => subscriptions.id, { onDelete: 'set null' }),
    customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'restrict' }).notNull(),
    status: varchar('status', { length: 50 }).default('DRAFT').notNull(), // DRAFT, CONFIRMED, PAID, CANCELLED
    issueDate: date('issue_date').notNull(),
    dueDate: date('due_date').notNull(),
    billingPeriodStart: date('billing_period_start').notNull(),
    billingPeriodEnd: date('billing_period_end').notNull(),
    subtotal: numeric('subtotal', { precision: 14, scale: 4 }).default('0.0000').notNull(),
    taxAmount: numeric('tax_amount', { precision: 14, scale: 4 }).default('0.0000').notNull(),
    discountAmount: numeric('discount_amount', { precision: 14, scale: 4 }).default('0.0000').notNull(),
    totalAmount: numeric('total_amount', { precision: 14, scale: 4 }).default('0.0000').notNull(),
    amountPaid: numeric('amount_paid', { precision: 14, scale: 4 }).default('0.0000').notNull(),
    pdfUrl: varchar('pdf_url', { length: 500 }),
    customerSnapshot: jsonb('customer_snapshot'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    // Idempotency: Prevents duplicate invoices for the same subscription and period!
    uqSubPeriod: uniqueIndex('uq_invoices_sub_period').on(table.subscriptionId, table.billingPeriodStart),
    customerIdx: index('idx_invoices_customer').on(table.customerId),
    statusIdx: index('idx_invoices_status_due').on(table.status, table.dueDate)
  })
);

export const invoiceLines = pgTable('invoice_lines', {
  id: uuid('id').defaultRandom().primaryKey(),
  invoiceId: uuid('invoice_id').references(() => invoices.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  productNameSnapshot: varchar('product_name_snapshot', { length: 255 }).notNull(),
  variantNameSnapshot: varchar('variant_name_snapshot', { length: 100 }),
  quantity: integer('quantity').default(1).notNull(),
  unitPriceSnapshot: numeric('unit_price_snapshot', { precision: 14, scale: 4 }).notNull(),
  taxRateSnapshot: numeric('tax_rate_snapshot', { precision: 14, scale: 4 }).default('0.0000').notNull(),
  discountAmountSnapshot: numeric('discount_amount_snapshot', { precision: 14, scale: 4 }).default('0.0000').notNull(),
  lineTotal: numeric('line_total', { precision: 14, scale: 4 }).notNull()
});

// ==========================================
// 9. Payments
// ==========================================
export const payments = pgTable(
  'payments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    invoiceId: uuid('invoice_id').references(() => invoices.id, { onDelete: 'restrict' }).notNull(),
    amount: numeric('amount', { precision: 14, scale: 4 }).notNull(),
    paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
    paymentDate: date('payment_date').notNull(),
    notes: text('notes'),
    recordedBy: uuid('recorded_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    invoiceIdx: index('idx_payments_invoice').on(table.invoiceId)
  })
);

// ==========================================
// 10. Audit Logs
// ==========================================
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: varchar('entity_id', { length: 100 }).notNull(),
  payloadDiff: jsonb('payload_diff'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});
