import { db, client } from './client';
import * as schema from './schema';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Seeding database with Brightloop business data...');

  try {
    // 1. Users
    const [adminUser] = await db
      .insert(schema.users)
      .values({
        email: 'admin@brightloop.com',
        passwordHash: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyGq0LhB0aYc1tV9C1sN1Yq3D5t7W2K6', // Demo hash for Admin123!@#
        role: 'admin',
        name: 'Alice Cooper (Admin)'
      })
      .onConflictDoNothing()
      .returning();

    const [staffUser] = await db
      .insert(schema.users)
      .values({
        email: 'staff@brightloop.com',
        passwordHash: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyGq0LhB0aYc1tV9C1sN1Yq3D5t7W2K6', // Demo hash for Staff123!@#
        role: 'staff',
        name: 'Bob Miller (Sales & Ops)'
      })
      .onConflictDoNothing()
      .returning();

    const [customerUser] = await db
      .insert(schema.users)
      .values({
        email: 'sarah@shopflow.com',
        passwordHash: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyGq0LhB0aYc1tV9C1sN1Yq3D5t7W2K6', // Demo hash for Customer123!@#
        role: 'customer',
        name: 'Sarah Connor (ShopFlow)'
      })
      .onConflictDoNothing()
      .returning();

    // 2. Customer Record
    const [customer] = await db
      .insert(schema.customers)
      .values({
        userId: customerUser ? customerUser.id : undefined,
        companyName: 'ShopFlow Retail Solutions',
        contactName: 'Sarah Connor',
        email: 'sarah@shopflow.com',
        phone: '+1 555-0199',
        taxIdentifier: 'US-TAX-89214',
        billingAddress: {
          street: '450 Lexington Ave, Suite 1200',
          city: 'New York',
          state: 'NY',
          postalCode: '10017',
          country: 'US'
        },
        paymentTerms: 'NET_30'
      })
      .onConflictDoNothing()
      .returning();

    // 3. Products
    const [erpProduct] = await db
      .insert(schema.products)
      .values({
        name: 'Brightloop ERP Core',
        productType: 'SOFTWARE',
        salesPrice: '1000.0000',
        costPrice: '300.0000',
        notes: 'Flagship enterprise resource planning software license.'
      })
      .returning();

    const [analyticsProduct] = await db
      .insert(schema.products)
      .values({
        name: 'Analytics & Reporting Add-on',
        productType: 'ADD_ON',
        salesPrice: '250.0000',
        costPrice: '50.0000',
        notes: 'Advanced BI reporting and cohort retention dashboards.'
      })
      .returning();

    // 4. Product Variants (Scene 2: Brand variant adding 560 to price)
    const [odooVariant] = await db
      .insert(schema.productVariants)
      .values({
        productId: erpProduct.id,
        name: 'Odoo Brand Edition',
        sku: 'ERP-CORE-ODOO',
        priceAdjustment: '560.0000', // Adds +560.0000 to price!
        isPercentage: false
      })
      .returning();

    await db.insert(schema.productVariants).values({
      productId: erpProduct.id,
      name: 'Standard Edition',
      sku: 'ERP-CORE-STD',
      priceAdjustment: '0.0000',
      isPercentage: false
    });

    // 5. Plans (Scene 2: Daily, weekly, monthly, yearly, minQuantity, pause, renewal)
    const [monthlyPlan] = await db
      .insert(schema.plans)
      .values({
        name: 'Monthly Growth Plan',
        billingInterval: 'MONTHLY',
        intervalCount: 1,
        minQuantity: 2,
        autoClose: false,
        allowEarlyClose: true,
        allowPause: true,
        allowRenewal: true
      })
      .returning();

    const [annualPlan] = await db
      .insert(schema.plans)
      .values({
        name: 'Annual Enterprise Plan',
        billingInterval: 'YEARLY',
        intervalCount: 1,
        minQuantity: 5,
        autoClose: false,
        allowEarlyClose: true,
        allowPause: true,
        allowRenewal: true
      })
      .returning();

    const [dailyTrialPlan] = await db
      .insert(schema.plans)
      .values({
        name: 'Daily Sandbox Trial',
        billingInterval: 'DAILY',
        intervalCount: 1,
        minQuantity: 1,
        autoClose: true,
        allowEarlyClose: true,
        allowPause: false,
        allowRenewal: false
      })
      .returning();

    // 6. Taxes
    const [vatTax] = await db
      .insert(schema.taxes)
      .values({
        name: 'Standard VAT (20%)',
        rate: '0.2000',
        isInclusive: false,
        countryCode: 'GB'
      })
      .returning();

    const [salesTax] = await db
      .insert(schema.taxes)
      .values({
        name: 'NY State Sales Tax (8.875%)',
        rate: '0.0888',
        isInclusive: false,
        countryCode: 'US',
        state: 'NY'
      })
      .returning();

    // 7. Discounts (Scene 5: Fixed or %, min quantity/purchase, limits)
    const [volDiscount] = await db
      .insert(schema.discounts)
      .values({
        code: 'VOLUME10',
        discountType: 'PERCENTAGE',
        value: '0.1000', // 10%
        targetType: 'SUBSCRIPTION',
        minPurchaseAmount: '1000.0000',
        minQuantity: 5,
        maxUses: 100,
        timesUsed: 0
      })
      .returning();

    const [fixedDiscount] = await db
      .insert(schema.discounts)
      .values({
        code: 'EARLYBIRD100',
        discountType: 'FIXED_AMOUNT',
        value: '100.0000',
        targetType: 'SUBSCRIPTION',
        minPurchaseAmount: '500.0000',
        minQuantity: 1,
        maxUses: 50,
        timesUsed: 0
      })
      .returning();

    // 8. Quotation Template (Scene 3)
    const [quoteTemplate] = await db
      .insert(schema.quotationTemplates)
      .values({
        name: 'Enterprise Onboarding Package',
        defaultPlanId: monthlyPlan.id,
        validityDays: 30
      })
      .returning();

    console.log('✅ Seeding complete!');
    console.log(`- Admin: admin@brightloop.com (Password: Admin123!@#)`);
    console.log(`- Staff: staff@brightloop.com (Password: Staff123!@#)`);
    console.log(`- Customer: sarah@shopflow.com (Password: Customer123!@#)`);
    console.log(`- Product: ${erpProduct.name} with Odoo Variant (+560.0000)`);
    console.log(`- Plan: ${monthlyPlan.name} (Monthly, min 2 seats)`);
    console.log(`- Template: ${quoteTemplate.name}`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
