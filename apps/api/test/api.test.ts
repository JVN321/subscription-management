import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE = 'http://localhost:3001/api/v1';

describe('Hono API End-to-End HTTP Contracts & Workflows', () => {
  beforeAll(async () => {
    // Check that Hono API is responding
    const res = await fetch(`${API_BASE}/health`);
    expect(res.status).toBe(200);
  });

  it('GET /api/v1/health returns ok status', async () => {
    const res = await fetch(`${API_BASE}/health`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
  });

  describe('Auth & Role Permissions', () => {
    it('POST /api/v1/auth/sign-up rejects weak passwords (<8 chars or missing complexity)', async () => {
      const res = await fetch(`${API_BASE}/auth/sign-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `weak-${Date.now()}@test.com`,
          password: 'weak'
        })
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('POST /api/v1/staff blocks non-admin callers (403 Forbidden)', async () => {
      const res = await fetch(`${API_BASE}/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'customer' // Not admin
        },
        body: JSON.stringify({
          email: `staff-${Date.now()}@test.com`,
          name: 'Unauthorized Staff'
        })
      });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error.code).toBe('FORBIDDEN');
    });
  });

  describe('Catalog & Products', () => {
    it('GET /api/v1/products returns products with attached variants', async () => {
      const res = await fetch(`${API_BASE}/products`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      const first = data.data[0];
      expect(first.name).toBeDefined();
      expect(first.salesPrice).toBeDefined();
      expect(Array.isArray(first.variants)).toBe(true);
    });
  });

  describe('Customer → Quote → Subscription → Billing → Payment Workflow', () => {
    let customerId: string;
    let quoteId: string;
    let subscriptionId: string;
    let invoiceId: string;

    it('creates a new customer via sign-up', async () => {
      const email = `api-test-${Date.now()}@acme.org`;
      const res = await fetch(`${API_BASE}/auth/sign-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: 'ComplexPass123!@#',
          role: 'customer',
          name: 'Sarah Connor API',
          companyName: 'Cyberdyne Research LLC'
        })
      });
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.data.customer).toBeDefined();
      customerId = data.data.customer.id;
    });

    it('creates a quotation for the customer', async () => {
      // Get a plan and a product
      const [plansRes, prodsRes] = await Promise.all([
        fetch(`${API_BASE}/plans`).then((r) => r.json()),
        fetch(`${API_BASE}/products`).then((r) => r.json())
      ]);

      const plan = plansRes.data[0];
      const prod = prodsRes.data[0];
      const variant = prod.variants?.[0];

      const res = await fetch(`${API_BASE}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          planId: plan.id,
          validityDays: 30,
          lines: [
            {
              productId: prod.id,
              variantId: variant?.id,
              quantity: 5,
              unitPrice: '1560.0000'
            }
          ]
        })
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.data.id).toBeDefined();
      quoteId = data.data.id;
    });

    it('converts the quotation to an active subscription with 1-click', async () => {
      const res = await fetch(`${API_BASE}/quotations/${quoteId}/convert`, {
        method: 'POST',
        headers: { 'x-user-role': 'staff' }
      });
      expect([200, 201]).toContain(res.status);
      const data = await res.json();
      expect(data.data.status).toBe('ACTIVE');
      subscriptionId = data.data.id;
    });

    it('triggers automatic billing scan and generates invoice', async () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await fetch(`${API_BASE}/billing/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetDate: todayStr })
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data).toBeDefined();
      expect(data.data.generatedCount).toBeGreaterThanOrEqual(1);

      // Verify invoice exists
      const invsRes = await fetch(`${API_BASE}/invoices`);
      const invsData = await invsRes.json();
      const generated = invsData.data.find((i: any) => i.subscriptionId === subscriptionId);
      expect(generated).toBeDefined();
      expect(generated.status).toBe('CONFIRMED');
      expect(parseFloat(generated.totalAmount)).toBeGreaterThan(0);
      invoiceId = generated.id;
    });

    it('generates official vector PDF invoice from PDFKit (GET /api/v1/invoices/:id/pdf)', async () => {
      const res = await fetch(`${API_BASE}/invoices/${invoiceId}/pdf`);
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('application/pdf');
      const buffer = await res.arrayBuffer();
      // PDF documents start with '%PDF-' header
      const header = Buffer.from(buffer.slice(0, 5)).toString();
      expect(header).toBe('%PDF-');
      expect(buffer.byteLength).toBeGreaterThan(1000);
    });

    it('records customer payment and transitions invoice to PAID status', async () => {
      const invRes = await fetch(`${API_BASE}/invoices`);
      const invData = await invRes.json();
      const invoice = invData.data.find((i: any) => i.id === invoiceId);

      const payRes = await fetch(`${API_BASE}/invoices/${invoiceId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: invoice.totalAmount, // Pay full amount
          paymentMethod: 'WIRE_TRANSFER',
          notes: 'Automated Test Wire Reference #100293'
        })
      });

      expect(payRes.status).toBe(201);
      const payData = await payRes.json();
      expect(payData.payment).toBeDefined();
      expect(payData.invoice.status).toBe('PAID');
      expect(parseFloat(payData.invoice.amountPaid)).toBe(parseFloat(invoice.totalAmount));
    });

    it('GET /api/v1/reports/summary reflects updated revenue metrics', async () => {
      const res = await fetch(`${API_BASE}/reports/summary`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.activeSubscriptions).toBeGreaterThanOrEqual(1);
      expect(parseFloat(data.data.totalRevenueCollected)).toBeGreaterThan(0);
      expect(data.data.queryTimeMs).toBeLessThan(2000); // Sub-2s target
    });
  });
});
