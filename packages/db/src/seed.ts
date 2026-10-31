import { db, client } from './client';
import * as schema from './schema';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('[Seed] Seeding database with Brightloop business data...');

  try {
    // 1. Users (All seeded with unified demo password: Brightloop@2026)
    const [adminUser] = await db
      .insert(schema.users)
      .values({
        email: 'admin@brightloop.com',
        passwordHash: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyGq0LhB0aYc1tV9C1sN1Yq3D5t7W2K6', // Brightloop@2026
        role: 'admin',
        name: 'Alice Cooper (Admin)'
      })
      .onConflictDoNothing()
      .returning();

    const [staffUser] = await db
      .insert(schema.users)
      .values({
        email: 'staff@brightloop.com',
        passwordHash: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyGq0LhB0aYc1tV9C1sN1Yq3D5t7W2K6', // Brightloop@2026
        role: 'staff',
        name: 'Bob Miller (Sales & Ops)'
      })
      .onConflictDoNothing()
      .returning();

    const [customerUser] = await db
      .insert(schema.users)
      .values({
        email: 'sarah@shopflow.com',
        passwordHash: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyGq0LhB0aYc1tV9C1sN1Yq3D5t7W2K6', // Brightloop@2026
        role: 'customer',
        name: 'Sarah Connor (ShopFlow)'
      })
      .onConflictDoNothing()
      .returning();

    const [techCorpUser] = await db
      .insert(schema.users)
      .values({
        email: 'techcorp@client.com',
        passwordHash: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyGq0LhB0aYc1tV9C1sN1Yq3D5t7W2K6', // Brightloop@2026
        role: 'customer',
        name: 'David Vance (TechCorp)'
      })
      .onConflictDoNothing()
      .returning();

    const [retailHubUser] = await db
      .insert(schema.users)
      .values({
        email: 'retailhub@client.com',
        passwordHash: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyGq0LhB0aYc1tV9C1sN1Yq3D5t7W2K6', // Brightloop@2026
        role: 'customer',
        name: 'Marcus Reed (RetailHub)'
      })
      .onConflictDoNothing()
      .returning();

    // 2. Customer Records
    await db
      .insert(schema.customers)
      .values({
        userId: customerUser?.id,
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
      .onConflictDoNothing();

    if (techCorpUser) {
      await db
        .insert(schema.customers)
        .values({
          userId: techCorpUser.id,
          companyName: 'TechCorp Solutions',
          contactName: 'David Vance',
          email: 'techcorp@client.com',
          phone: '+1 555-0144',
          taxIdentifier: 'US-TAX-55210',
          billingAddress: {
            street: '100 Tech Blvd',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94107',
            country: 'US'
          },
          paymentTerms: 'NET_30'
        })
        .onConflictDoNothing();
    }

    if (retailHubUser) {
      await db
        .insert(schema.customers)
        .values({
          userId: retailHubUser.id,
          companyName: 'RetailHub Stores',
          contactName: 'Marcus Reed',
          email: 'retailhub@client.com',
          phone: '+1 555-0188',
          taxIdentifier: 'US-TAX-77491',
          billingAddress: {
            street: '220 Market Way',
            city: 'Chicago',
            state: 'IL',
            postalCode: '60601',
            country: 'US'
          },
          paymentTerms: 'NET_15'
        })
        .onConflictDoNothing();
    }

    // 3. Products
    let [erpProduct] = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.name, 'Brightloop ERP Core'));

    if (!erpProduct) {
      [erpProduct] = await db
        .insert(schema.products)
        .values({
          name: 'Brightloop ERP Core',
          productType: 'SOFTWARE',
          salesPrice: '1000.0000',
          costPrice: '300.0000',
          notes: 'Flagship enterprise resource planning software license.'
        })
        .returning();
    }

    let [analyticsProduct] = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.name, 'Analytics & Reporting Add-on'));

    if (!analyticsProduct) {
      [analyticsProduct] = await db
        .insert(schema.products)
        .values({
          name: 'Analytics & Reporting Add-on',
          productType: 'ADD_ON',
          salesPrice: '250.0000',
          costPrice: '50.0000',
          notes: 'Advanced BI reporting and cohort retention dashboards.'
        })
        .returning();
    }

    // 4. Product Variants (Scene 2: Brand variant adding 560 to price)
    await db
      .insert(schema.productVariants)
      .values({
        productId: erpProduct.id,
        name: 'Odoo Brand Edition',
        sku: 'ERP-CORE-ODOO',
        priceAdjustment: '560.0000',
        isPercentage: false
      })
      .onConflictDoNothing();

    await db
      .insert(schema.productVariants)
      .values({
        productId: erpProduct.id,
        name: 'Standard Edition',
        sku: 'ERP-CORE-STD',
        priceAdjustment: '0.0000',
        isPercentage: false
      })
      .onConflictDoNothing();

    // 5. Plans (Scene 2: Daily, weekly, monthly, yearly, minQuantity, pause, renewal)
    let [monthlyPlan] = await db
      .select()
      .from(schema.plans)
      .where(eq(schema.plans.name, 'Monthly Growth Plan'));

    if (!monthlyPlan) {
      [monthlyPlan] = await db
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
    }

    await db
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
      .onConflictDoNothing();

    await db
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
      .onConflictDoNothing();

    // 6. Taxes
    await db
      .insert(schema.taxes)
      .values({
        name: 'Standard VAT (20%)',
        rate: '0.2000',
        isInclusive: false,
        countryCode: 'GB'
      })
      .onConflictDoNothing();

    await db
      .insert(schema.taxes)
      .values({
        name: 'NY State Sales Tax (8.875%)',
        rate: '0.0888',
        isInclusive: false,
        countryCode: 'US',
        state: 'NY'
      })
      .onConflictDoNothing();

    // 7. Discounts (Scene 5: Fixed or %, min quantity/purchase, limits)
    await db
      .insert(schema.discounts)
      .values({
        code: 'VOLUME10',
        discountType: 'PERCENTAGE',
        value: '0.1000',
        targetType: 'SUBSCRIPTION',
        minPurchaseAmount: '1000.0000',
        minQuantity: 5,
        maxUses: 100,
        timesUsed: 0
      })
      .onConflictDoNothing();

    await db
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
      .onConflictDoNothing();

    // 8. Quotation Template (Scene 3)
    await db
      .insert(schema.quotationTemplates)
      .values({
        name: 'Enterprise Onboarding Package',
        defaultPlanId: monthlyPlan.id,
        validityDays: 30
      })
      .onConflictDoNothing();

    console.log('[Seed] Seeding completed successfully.');
    console.log('[Seed] Unified Demo Password for all accounts: Brightloop@2026');
    console.log('[Seed] - Admin: admin@brightloop.com');
    console.log('[Seed] - Staff: staff@brightloop.com');
    console.log('[Seed] - Customer: sarah@shopflow.com');
    console.log('[Seed] - Customer: techcorp@client.com');
    console.log('[Seed] - Customer: retailhub@client.com');
  } catch (error) {
    console.error('[Seed Error] Seeding failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
