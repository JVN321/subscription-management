import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../src/App';

// Mock fetch responses for API
const mockSummary = {
  activeSubscriptions: 2,
  pausedSubscriptions: 0,
  mrr: '1720.0000',
  totalRevenue: '3200.0000',
  outstandingBalance: '500.0000',
  overdueCount: 1,
  recentInvoicesCount: 4
};

const mockScheduler = {
  running: true,
  intervalSeconds: 60,
  nextRunInSeconds: 45,
  lastRunAt: '2026-10-31T10:00:00.000Z'
};

const mockQuotations = [
  {
    id: 'quote-1',
    quoteNumber: 'QT-001001',
    customerId: 'cust-1',
    planId: 'plan-1',
    status: 'SENT',
    expiresAt: '2026-11-30T00:00:00.000Z',
    notes: 'Standard quotation'
  }
];

const mockSubscriptions = [
  {
    id: 'sub-1',
    subscriptionNumber: 'SUB-001001',
    customerId: 'cust-1',
    planId: 'plan-1',
    status: 'ACTIVE',
    startDate: '2026-10-01',
    nextBillingDate: '2026-11-01',
    paymentTerms: 'NET_30'
  }
];

const mockInvoices = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-202610-001',
    customerId: 'cust-1',
    subscriptionId: 'sub-1',
    billingPeriodStart: '2026-10-01',
    billingPeriodEnd: '2026-10-31',
    subtotal: '1000.0000',
    discountAmount: '0.0000',
    taxAmount: '100.0000',
    totalAmount: '1100.0000',
    amountPaid: '0.0000',
    status: 'CONFIRMED',
    issueDate: '2026-10-01',
    dueDate: '2026-10-31',
    outstandingAmount: '1100.0000',
    isOverdue: false
  }
];

const mockProducts = [
  {
    id: 'prod-1',
    name: 'Enterprise ERP Suite',
    productType: 'SOFTWARE',
    salesPrice: '1200.0000',
    costPrice: '400.0000',
    variants: [
      {
        id: 'var-1',
        name: 'Odoo Connected Engine',
        priceAdjustment: '560.0000',
        isPercentage: false
      }
    ]
  }
];

const mockPlans = [
  {
    id: 'plan-1',
    name: 'Standard Monthly',
    billingInterval: 'MONTHLY',
    minQuantity: 1,
    autoClose: false
  }
];

const mockCustomers = [
  {
    id: 'cust-1',
    companyName: 'Acme Technologies',
    contactName: 'Sarah Jenkins',
    email: 'sarah@acme.com',
    billingAddress: '100 Innovation Way'
  }
];

describe('Brightloop Web App (Vitest Component & UI Suite)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/reports/summary')) return Promise.resolve({ json: () => Promise.resolve({ data: mockSummary }) });
      if (url.includes('/billing/scheduler')) return Promise.resolve({ json: () => Promise.resolve({ data: mockScheduler }) });
      if (url.includes('/quotations')) return Promise.resolve({ json: () => Promise.resolve({ data: mockQuotations }) });
      if (url.includes('/subscriptions')) return Promise.resolve({ json: () => Promise.resolve({ data: mockSubscriptions }) });
      if (url.includes('/invoices')) return Promise.resolve({ json: () => Promise.resolve({ data: mockInvoices }) });
      if (url.includes('/products')) return Promise.resolve({ json: () => Promise.resolve({ data: mockProducts }) });
      if (url.includes('/plans')) return Promise.resolve({ json: () => Promise.resolve({ data: mockPlans }) });
      if (url.includes('/customers')) return Promise.resolve({ json: () => Promise.resolve({ data: mockCustomers }) });
      return Promise.resolve({ json: () => Promise.resolve({ data: [] }) });
    });
  });

  it('renders top bar with BRIGHTLOOP brand logo and search input', async () => {
    render(<App />);
    expect(screen.getByText('BRIGHTLOOP')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search invoices, subscriptions, customers.../i)).toBeInTheDocument();
  });

  it('toggles light and dark themes on theme button click', async () => {
    render(<App />);
    const themeBtn = screen.getByTitle(/Switch to (Dark|Light) Mode/i);
    expect(themeBtn).toBeInTheDocument();

    const initialTheme = document.documentElement.getAttribute('data-theme');
    fireEvent.click(themeBtn);
    const newTheme = document.documentElement.getAttribute('data-theme');
    expect(newTheme).not.toBe(initialTheme);
  });

  it('switches between navigation tabs (Dashboard, Subscriptions, Catalog, Portal)', async () => {
    render(<App />);

    // Click Subscriptions tab
    const subTab = screen.getByRole('button', { name: /Subscriptions/i });
    fireEvent.click(subTab);
    await waitFor(() => {
      expect(screen.getAllByText('Subscriptions').length).toBeGreaterThan(0);
    });

    // Click Catalog tab
    const catalogTab = screen.getByRole('button', { name: /Catalog/i });
    fireEvent.click(catalogTab);
    await waitFor(() => {
      expect(screen.getByText(/Software Catalog/i)).toBeInTheDocument();
    });

    // Click Customer Portal tab
    const portalTab = screen.getByRole('button', { name: /Customer Portal/i });
    fireEvent.click(portalTab);
    await waitFor(() => {
      expect(screen.getByText(/Agreements:/i)).toBeInTheDocument();
    });
  });

  it('auto-switches to Customer Portal when Customer role is selected', async () => {
    render(<App />);
    const roleSelect = screen.getByRole('combobox');
    fireEvent.change(roleSelect, { target: { value: 'customer' } });

    await waitFor(() => {
      expect(screen.getByText(/Agreements:/i)).toBeInTheDocument();
    });
  });

  it('displays accurate financial metrics from API on the dashboard', async () => {
    render(<App />);
    await waitFor(() => {
      const heading = screen.getByText('Monthly Recurring Revenue');
      expect(heading.parentElement?.textContent).toContain('1,720');
    });
  });
});
