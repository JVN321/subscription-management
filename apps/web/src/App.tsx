import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  Repeat,
  Receipt,
  Package,
  Users,
  Shield,
  Play,
  CheckCircle2,
  AlertCircle,
  Download,
  CreditCard,
  Plus,
  RefreshCw,
  Pause,
  ArrowRight,
  Sun,
  Moon,
  Search,
  DollarSign
} from 'lucide-react';

const API_BASE = 'http://localhost:3001/api/v1';

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('brightloop_theme') as 'light' | 'dark') || 'light';
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'quotations' | 'subscriptions' | 'invoices' | 'catalog' | 'portal'>('dashboard');
  const [currentRole, setCurrentRole] = useState<'admin' | 'staff' | 'customer'>('admin');
  const [searchQuery, setSearchQuery] = useState('');

  // Data States
  const [report, setReport] = useState<any>(null);
  const [scheduler, setScheduler] = useState<any>(null);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('WIRE_TRANSFER');
  const [paymentNote, setPaymentNote] = useState('');

  // Quote Form
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [quantity, setQuantity] = useState(5);
  const [portalCustomerId, setPortalCustomerId] = useState('');

  // Theme Sync
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('brightloop_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const headers = { 'x-user-role': currentRole };

      const [repRes, schedRes, quotesRes, subsRes, invsRes, prodsRes, plansRes, custsRes] = await Promise.all([
        fetch(`${API_BASE}/reports/summary`, { headers }).then((r) => r.json()).catch(() => ({ data: null })),
        fetch(`${API_BASE}/billing/scheduler`, { headers }).then((r) => r.json()).catch(() => ({ data: null })),
        fetch(`${API_BASE}/quotations`, { headers }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch(`${API_BASE}/subscriptions`, { headers }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch(`${API_BASE}/invoices`, { headers }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch(`${API_BASE}/products`, { headers }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch(`${API_BASE}/plans`, { headers }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch(`${API_BASE}/customers`, { headers }).then((r) => r.json()).catch(() => ({ data: [] }))
      ]);

      if (repRes?.data) setReport(repRes.data);
      if (schedRes?.data) setScheduler(schedRes.data);
      if (quotesRes?.data) setQuotations(quotesRes.data);
      if (subsRes?.data) setSubscriptions(subsRes.data);
      if (invsRes?.data) setInvoices(invsRes.data);
      if (prodsRes?.data) {
        setProducts(prodsRes.data);
        if (prodsRes.data[0]) {
          setSelectedProduct(prodsRes.data[0].id);
          if (prodsRes.data[0].variants?.[0]) {
            setSelectedVariant(prodsRes.data[0].variants[0].id);
          }
        }
      }
      if (plansRes?.data) {
        setPlans(plansRes.data);
        if (plansRes.data[0]) setSelectedPlan(plansRes.data[0].id);
      }
      if (custsRes?.data) {
        setCustomers(custsRes.data);
        if (custsRes.data[0]) {
          setSelectedCustomer(custsRes.data[0].id);
          setPortalCustomerId((prev) => prev || custsRes.data[0].id);
        }
      }
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      fetch(`${API_BASE}/billing/scheduler`).then((r) => r.json()).then((res) => {
        if (res?.data) setScheduler(res.data);
      }).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [currentRole]);

  // Actions
  const handleTriggerBilling = async () => {
    try {
      setBillingLoading(true);
      const res = await fetch(`${API_BASE}/billing/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetDate: new Date().toISOString().split('T')[0] })
      });
      const data = await res.json();
      if (data?.data) {
        showToast(`Billing scan complete: ${data.data.generatedCount} generated, ${data.data.skippedCount} skipped`);
        loadData();
      }
    } catch (e) {
      showToast('Billing scan failed');
    } finally {
      setBillingLoading(false);
    }
  };

  const handleConvertQuote = async (quoteId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/quotations/${quoteId}/convert`, {
        method: 'POST',
        headers: { 'x-user-role': currentRole }
      });
      const data = await res.json();
      if (data?.data) {
        showToast('Quotation converted to subscription');
        loadData();
        setActiveTab('subscriptions');
      }
    } catch (e) {
      showToast('Conversion failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubStatus = async (subId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await fetch(`${API_BASE}/subscriptions/${subId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      showToast(`Subscription ${nextStatus === 'ACTIVE' ? 'resumed' : 'paused'}`);
      loadData();
    } catch (e) {
      showToast('Status update failed');
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedInvoice || !paymentAmount) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/invoices/${selectedInvoice.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount).toFixed(4),
          paymentMethod,
          notes: paymentNote || 'Reconciled via Console'
        })
      });
      if (res.ok) {
        showToast(`Payment of $${parseFloat(paymentAmount).toFixed(2)} recorded`);
        setShowPaymentModal(false);
        setSelectedInvoice(null);
        setPaymentAmount('');
        loadData();
      }
    } catch (e) {
      showToast('Payment recording failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuote = async () => {
    if (!selectedCustomer || !selectedPlan || !selectedProduct) return;
    try {
      setLoading(true);
      const prod = products.find((p) => p.id === selectedProduct);
      const variant = prod?.variants?.find((v: any) => v.id === selectedVariant);
      let unitPrice = prod?.salesPrice || '1000.0000';
      if (variant) {
        unitPrice = (parseFloat(unitPrice) + parseFloat(variant.priceAdjustment)).toFixed(4);
      }

      const res = await fetch(`${API_BASE}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer,
          planId: selectedPlan,
          validityDays: 30,
          lines: [
            {
              productId: selectedProduct,
              variantId: selectedVariant || undefined,
              quantity,
              unitPrice
            }
          ]
        })
      });

      if (res.ok) {
        showToast('Quotation created');
        setShowQuoteModal(false);
        loadData();
        setActiveTab('quotations');
      }
    } catch (e) {
      showToast('Quote creation failed');
    } finally {
      setLoading(false);
    }
  };

  const activeCustomer = customers.find((c) => c.id === (portalCustomerId || customers[0]?.id)) || customers[0];
  const customerPortalData = {
    customer: activeCustomer,
    subs: subscriptions.filter((s) => s.customerId === activeCustomer?.id),
    invs: invoices.filter((i) => i.customerId === activeCustomer?.id)
  };

  const upcomingRenewals = subscriptions
    .filter((s) => s.status === 'ACTIVE')
    .slice(0, 4);

  const overdueInvoices = invoices.filter((i) => i.isOverdue);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.25rem',
            right: '1.25rem',
            zIndex: 9999,
            backgroundColor: 'var(--text-primary)',
            color: 'var(--text-inverse)',
            padding: '0.625rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.12)'
          }}
        >
          <CheckCircle2 size={15} color="var(--brand-orange)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BAR: Clean, Deliberate, Restrained */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-panel)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: '46px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '22px',
                height: '22px',
                backgroundColor: 'var(--brand-orange)',
                borderRadius: 'var(--radius-xs)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <Repeat size={13} strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              BRIGHTLOOP
            </span>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: '320px', width: '100%' }}>
            <Search size={13} style={{ position: 'absolute', left: '0.625rem', top: '0.45rem', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search invoices, subscriptions, customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{
                height: '1.75rem',
                paddingLeft: '1.875rem',
                fontSize: '0.75rem',
                backgroundColor: 'var(--bg-well)'
              }}
            />
          </div>

          {/* Controls: Refresh, Theme Switcher, Role Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="btn-icon-circle"
              onClick={loadData}
              title="Refresh"
              disabled={loading}
              style={{ width: '28px', height: '28px' }}
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              className="btn-icon-circle"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              style={{ width: '28px', height: '28px' }}
            >
              {theme === 'light' ? <Moon size={12} /> : <Sun size={12} color="var(--brand-orange)" />}
            </button>

            <div style={{ height: '14px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-well)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xs)',
                padding: '0 0.5rem',
                height: '1.75rem',
                fontSize: '0.75rem'
              }}
            >
              <span style={{ color: 'var(--text-muted)', marginRight: '0.25rem' }}>Role:</span>
              <select
                value={currentRole}
                onChange={(e) => {
                  const newRole = e.target.value as any;
                  setCurrentRole(newRole);
                  if (newRole === 'customer') {
                    setActiveTab('portal');
                  } else if (activeTab === 'portal') {
                    setActiveTab('dashboard');
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="customer">Customer</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* SUB-HEADER: Concise Section Navigation */}
      <div
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-panel-elevated)',
          padding: '0.375rem 1.25rem'
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}
        >
          {/* Tabs */}
          <nav className="nav-segmented">
            <button
              className={`nav-tab-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={12} />
              <span>Dashboard</span>
            </button>
            <button
              className={`nav-tab-item ${activeTab === 'quotations' ? 'active' : ''}`}
              onClick={() => setActiveTab('quotations')}
            >
              <FileText size={12} />
              <span>Quotations</span>
              {quotations.filter((q) => q.status === 'SENT').length > 0 && (
                <span style={{ color: 'var(--brand-orange)', fontWeight: 700, fontSize: '0.6875rem' }}>
                  ({quotations.filter((q) => q.status === 'SENT').length})
                </span>
              )}
            </button>
            <button
              className={`nav-tab-item ${activeTab === 'subscriptions' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscriptions')}
            >
              <Repeat size={12} />
              <span>Subscriptions</span>
            </button>
            <button
              className={`nav-tab-item ${activeTab === 'invoices' ? 'active' : ''}`}
              onClick={() => setActiveTab('invoices')}
            >
              <Receipt size={12} />
              <span>Invoices & Payments</span>
              {overdueInvoices.length > 0 && (
                <span style={{ color: 'var(--status-danger)', fontWeight: 700, fontSize: '0.6875rem' }}>
                  ({overdueInvoices.length})
                </span>
              )}
            </button>
            <button
              className={`nav-tab-item ${activeTab === 'catalog' ? 'active' : ''}`}
              onClick={() => setActiveTab('catalog')}
            >
              <Package size={12} />
              <span>Catalog</span>
            </button>
            <button
              className={`nav-tab-item ${activeTab === 'portal' ? 'active' : ''}`}
              onClick={() => setActiveTab('portal')}
            >
              <Users size={12} />
              <span>Customer Portal</span>
            </button>
          </nav>

          {/* Right Action: Billing Scan */}
          <button
            className="btn btn-primary btn-sm"
            onClick={handleTriggerBilling}
            disabled={billingLoading}
          >
            <Play size={11} />
            <span>{billingLoading ? 'Processing...' : 'Run Billing Scan'}</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main style={{ maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '1rem 1.25rem', flex: 1 }}>
        {/* ========================================================================= */}
        {/* TAB 1: DASHBOARD (DESLOPIFIED OPERATIONS OVERVIEW) */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* PRIMARY SUMMARY STRIP */}
            <div className="instrument-strip">
              <div className="instrument-strip-cell">
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Monthly Recurring Revenue
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
                  ${report ? parseFloat(report.mrr).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Active contracted run-rate
                </div>
              </div>

              <div className="instrument-strip-cell">
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Active Subscriptions
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
                  {report ? report.activeSubscriptions : subscriptions.filter((s) => s.status === 'ACTIVE').length}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  {report?.pausedSubscriptions || 0} paused
                </div>
              </div>

              <div className="instrument-strip-cell">
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Settled Revenue
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--status-success)', marginTop: '0.15rem' }}>
                  ${report ? parseFloat(report.totalRevenueCollected).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Total collected
                </div>
              </div>

              <div className="instrument-strip-cell">
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Outstanding Balance
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: parseFloat(report?.totalAmountOwed || '0') > 0 ? 'var(--status-danger)' : 'var(--text-primary)', marginTop: '0.15rem' }}>
                  ${report ? parseFloat(report.totalAmountOwed).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--status-danger)' }}>
                  {overdueInvoices.length} overdue (${report ? parseFloat(report.overdueAmount).toFixed(2) : '0.00'})
                </div>
              </div>
            </div>

            {/* TWO-COLUMN WORKSPACE: Recent Invoices & Action Panels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: '1rem' }}>
              {/* Central Area: Invoices Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Recent Invoices
                  </h2>
                  <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('invoices')}>
                    <span>All Invoices</span>
                    <ArrowRight size={11} />
                  </button>
                </div>

                <div className="table-wrapper">
                  <table className="table-industrial">
                    <thead>
                      <tr>
                        <th>Invoice</th>
                        <th>Customer</th>
                        <th>Billing Period</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Total</th>
                        <th style={{ textAlign: 'right' }}>Balance</th>
                        <th style={{ textAlign: 'center' }}>PDF</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                            No invoices generated yet. Click "Run Billing Scan" to process due subscriptions.
                          </td>
                        </tr>
                      ) : (
                        invoices.slice(0, 5).map((inv) => {
                          const cust = customers.find((c) => c.id === inv.customerId);
                          const isPaid = inv.status === 'PAID';
                          const outstanding = Math.max(0, parseFloat(inv.totalAmount) - parseFloat(inv.amountPaid));

                          return (
                            <tr key={inv.id}>
                              <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{inv.invoiceNumber}</td>
                              <td>{inv.customerSnapshot?.companyName || cust?.companyName || 'Corporate Client'}</td>
                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                {inv.billingPeriodStart} to {inv.billingPeriodEnd}
                              </td>
                              <td>
                                <span className={`status-signal ${isPaid ? 'signal-active' : inv.isOverdue ? 'signal-danger' : 'signal-orange'}`}>
                                  <span>{isPaid ? 'PAID' : inv.isOverdue ? 'OVERDUE' : inv.status}</span>
                                </span>
                              </td>
                              <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                ${parseFloat(inv.totalAmount).toFixed(2)}
                              </td>
                              <td
                                style={{
                                  textAlign: 'right',
                                  fontFamily: 'var(--font-mono)',
                                  fontWeight: 700,
                                  color: outstanding > 0 ? 'var(--status-danger)' : 'var(--status-success)'
                                }}
                              >
                                ${outstanding.toFixed(2)}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <a
                                  href={`${API_BASE}/invoices/${inv.id}/pdf`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn-icon-circle"
                                  title="Download PDF"
                                  style={{ width: '22px', height: '22px' }}
                                >
                                  <Download size={10} />
                                </a>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                {!isPaid ? (
                                  <button
                                    className="btn btn-primary btn-sm"
                                    style={{ height: '1.5rem', padding: '0 0.5rem', fontSize: '0.6875rem' }}
                                    onClick={() => {
                                      setSelectedInvoice(inv);
                                      setPaymentAmount(outstanding.toFixed(2));
                                      setShowPaymentModal(true);
                                    }}
                                  >
                                    Pay
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '0.6875rem', color: 'var(--status-success)', fontWeight: 600 }}>Settled</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Side Panels: Upcoming Renewals & Overdue Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Overdue Invoices Alert Panel */}
                <div className="instrument-panel" style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      Overdue Invoices
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--status-danger)', fontWeight: 700 }}>
                      {overdueInvoices.length} REQUIRED
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {overdueInvoices.length === 0 ? (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        All invoice balances are up to date.
                      </div>
                    ) : (
                      overdueInvoices.map((inv) => (
                        <div
                          key={inv.id}
                          style={{
                            padding: '0.5rem',
                            backgroundColor: 'var(--bg-well)',
                            borderRadius: 'var(--radius-xs)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.75rem'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{inv.invoiceNumber}</div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Due: {inv.dueDate}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--status-danger)' }}>
                              ${parseFloat(inv.outstandingAmount || inv.totalAmount).toFixed(2)}
                            </div>
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ height: '1.375rem', padding: '0 0.4rem', fontSize: '0.625rem', marginTop: '0.15rem' }}
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setPaymentAmount(inv.outstandingAmount || inv.totalAmount);
                                setShowPaymentModal(true);
                              }}
                            >
                              Settle
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Upcoming Renewals Panel */}
                <div className="instrument-panel" style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      Upcoming Billing Horizons
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      Active
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.75rem' }}>
                    {upcomingRenewals.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)' }}>No active contracts.</div>
                    ) : (
                      upcomingRenewals.map((sub) => {
                        const cust = customers.find((c) => c.id === sub.customerId);
                        return (
                          <div
                            key={sub.id}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: 'var(--bg-well)',
                              borderRadius: 'var(--radius-xs)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 600 }}>{cust?.companyName || 'Corporate Client'}</div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                                {sub.subscriptionNumber}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--brand-orange)' }}>
                              {sub.nextBillingDate}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: QUOTATIONS (SCENE 3) */}
        {/* ========================================================================= */}
        {activeTab === 'quotations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Quotations</h2>
              <button className="btn btn-primary btn-sm" onClick={() => setShowQuoteModal(true)}>
                <Plus size={12} />
                <span>New Quotation</span>
              </button>
            </div>

            <div className="table-wrapper">
              <table className="table-industrial">
                <thead>
                  <tr>
                    <th>Quote Ref</th>
                    <th>Customer</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Expires</th>
                    <th>Converted Subscription</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                        No quotations found.
                      </td>
                    </tr>
                  ) : (
                    quotations.map((q) => {
                      const cust = customers.find((c) => c.id === q.customerId);
                      const plan = plans.find((p) => p.id === q.planId);
                      const isConverted = q.status === 'CONVERTED';

                      return (
                        <tr key={q.id}>
                          <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{q.quoteNumber}</td>
                          <td>
                            <div style={{ fontWeight: 500 }}>{cust?.companyName || 'Corporate Client'}</div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>{cust?.contactName}</div>
                          </td>
                          <td>{plan?.name || 'Standard Plan'}</td>
                          <td>
                            <span className={`status-signal ${isConverted ? 'signal-active' : 'signal-orange'}`}>
                              <span>{q.status}</span>
                            </span>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                            {q.expiresAt ? new Date(q.expiresAt).toLocaleDateString() : '30 days'}
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                            {q.convertedSubscriptionId ? (
                              <span style={{ color: 'var(--brand-orange)', fontWeight: 600 }}>
                                #{q.convertedSubscriptionId.slice(0, 8)}...
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>—</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {!isConverted ? (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleConvertQuote(q.id)}
                              >
                                <span>Convert to Sub</span>
                                <ArrowRight size={11} />
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--status-success)', fontWeight: 600 }}>
                                Converted
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SUBSCRIPTIONS */}
        {/* ========================================================================= */}
        {activeTab === 'subscriptions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Subscriptions</h2>
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>
                  {subscriptions.filter((s) => s.status === 'ACTIVE').length} Active
                </span>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ color: 'var(--status-warning)', fontWeight: 600 }}>
                  {subscriptions.filter((s) => s.status === 'PAUSED').length} Paused
                </span>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="table-industrial">
                <thead>
                  <tr>
                    <th>Subscription</th>
                    <th>Customer</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>Next Billing Date</th>
                    <th>Terms</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => {
                    const cust = customers.find((c) => c.id === sub.customerId);
                    const plan = plans.find((p) => p.id === sub.planId);
                    const isActive = sub.status === 'ACTIVE';

                    return (
                      <tr key={sub.id}>
                        <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{sub.subscriptionNumber}</td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{cust?.companyName || 'Corporate Client'}</div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>{cust?.email}</div>
                        </td>
                        <td>{plan?.name || 'Standard Monthly'}</td>
                        <td>
                          <span className={`status-signal ${isActive ? 'signal-active' : sub.status === 'PAUSED' ? 'signal-warning' : 'signal-danger'}`}>
                            <span>{sub.status}</span>
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{sub.startDate}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--brand-orange)' }}>
                          {sub.nextBillingDate}
                        </td>
                        <td>{sub.paymentTerms || 'NET_30'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleToggleSubStatus(sub.id, sub.status)}
                          >
                            {isActive ? <Pause size={11} /> : <Play size={11} />}
                            <span>{isActive ? 'Pause' : 'Resume'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: INVOICES & PAYMENTS */}
        {/* ========================================================================= */}
        {activeTab === 'invoices' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Invoices & Payments</h2>
              <button className="btn btn-primary btn-sm" onClick={handleTriggerBilling} disabled={billingLoading}>
                <Play size={11} />
                <span>{billingLoading ? 'Processing...' : 'Run Billing Scan'}</span>
              </button>
            </div>

            <div className="table-wrapper">
              <table className="table-industrial">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Customer</th>
                    <th>Period</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                    <th style={{ textAlign: 'right' }}>Discount</th>
                    <th style={{ textAlign: 'right' }}>Tax</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th style={{ textAlign: 'right' }}>Balance Due</th>
                    <th style={{ textAlign: 'center' }}>PDF</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const cust = customers.find((c) => c.id === inv.customerId);
                    const isPaid = inv.status === 'PAID';
                    const outstanding = Math.max(0, parseFloat(inv.totalAmount) - parseFloat(inv.amountPaid));

                    return (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{inv.invoiceNumber}</td>
                        <td>
                          <div style={{ fontWeight: 500 }}>
                            {inv.customerSnapshot?.companyName || cust?.companyName || 'Corporate Client'}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Due: {inv.dueDate}</div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                          {inv.billingPeriodStart} to {inv.billingPeriodEnd}
                        </td>
                        <td>
                          <span className={`status-signal ${isPaid ? 'signal-active' : inv.isOverdue ? 'signal-danger' : 'signal-orange'}`}>
                            <span>{isPaid ? 'PAID' : inv.isOverdue ? 'OVERDUE' : inv.status}</span>
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                          ${parseFloat(inv.subtotal).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--brand-orange)' }}>
                          -${parseFloat(inv.discountAmount).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                          ${parseFloat(inv.taxAmount).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          ${parseFloat(inv.totalAmount).toFixed(2)}
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: outstanding > 0 ? 'var(--status-danger)' : 'var(--status-success)'
                          }}
                        >
                          ${outstanding.toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <a
                            href={`${API_BASE}/invoices/${inv.id}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-icon-circle"
                            title="Download PDF"
                            style={{ width: '22px', height: '22px' }}
                          >
                            <Download size={10} />
                          </a>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {!isPaid ? (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setPaymentAmount(outstanding.toFixed(2));
                                setShowPaymentModal(true);
                              }}
                            >
                              <CreditCard size={11} />
                              <span>Record</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--status-success)', fontWeight: 600 }}>Settled</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: CATALOG & INTERVAL PLANS */}
        {/* ========================================================================= */}
        {activeTab === 'catalog' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Software Catalog</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {products.map((p) => (
                <div key={p.id} className="instrument-panel" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{p.name}</h3>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{p.productType}</div>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      ${parseFloat(p.salesPrice).toFixed(2)}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.625rem', marginTop: '0.625rem' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                      Brand Variants
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {p.variants?.map((v: any) => (
                        <div
                          key={v.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '0.35rem 0.5rem',
                            backgroundColor: 'var(--bg-well)',
                            borderRadius: 'var(--radius-xs)',
                            fontSize: '0.75rem'
                          }}
                        >
                          <span>{v.name}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--brand-orange)' }}>
                            +{parseFloat(v.priceAdjustment).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.5rem' }}>Billing Interval Plans</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                {plans.map((pl) => (
                  <div key={pl.id} className="instrument-panel" style={{ padding: '0.875rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{pl.name}</span>
                      <span className="status-signal">{pl.billingInterval}</span>
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                      Min: {pl.minQuantity} units • Auto-close: {pl.autoClose ? 'Yes' : 'No'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: CUSTOMER SELF-SERVICE PORTAL */}
        {/* ========================================================================= */}
        {activeTab === 'portal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="instrument-panel" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                    {customerPortalData.customer?.companyName || 'Customer Portal'}
                  </h2>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Contact: {customerPortalData.customer?.contactName} • {customerPortalData.customer?.email}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Account:</span>
                    <select
                      value={customerPortalData.customer?.id || ''}
                      onChange={(e) => setPortalCustomerId(e.target.value)}
                      style={{
                        backgroundColor: 'var(--bg-well)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-xs)',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.companyName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                    <div className="instrument-panel" style={{ padding: '0.375rem 0.75rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Agreements: </span>
                      <span style={{ fontWeight: 700 }}>{customerPortalData.subs.length}</span>
                    </div>
                    <div className="instrument-panel" style={{ padding: '0.375rem 0.75rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Invoices: </span>
                      <span style={{ fontWeight: 700 }}>{customerPortalData.invs.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Subscriptions</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {customerPortalData.subs.filter((s) => s.status === 'ACTIVE').length} active
                </span>
              </div>
              <div className="table-wrapper">
                <table className="table-industrial">
                  <thead>
                    <tr>
                      <th>Subscription</th>
                      <th>Status</th>
                      <th>Start Date</th>
                      <th>Next Billing Date</th>
                      <th>Terms</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerPortalData.subs.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                          No active subscriptions for this account.
                        </td>
                      </tr>
                    ) : (
                      customerPortalData.subs.map((s) => (
                        <tr key={s.id}>
                          <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{s.subscriptionNumber}</td>
                          <td>
                            <span className={`status-signal ${s.status === 'ACTIVE' ? 'signal-active' : 'signal-warning'}`}>
                              <span>{s.status}</span>
                            </span>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{s.startDate}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--brand-orange)' }}>
                            {s.nextBillingDate}
                          </td>
                          <td>{s.paymentTerms}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => handleToggleSubStatus(s.id, s.status)}
                            >
                              {s.status === 'ACTIVE' ? <Pause size={10} /> : <Play size={10} />}
                              <span>{s.status === 'ACTIVE' ? 'Pause' : 'Resume'}</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Invoice Statements</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {customerPortalData.invs.length} total statements
                </span>
              </div>
              <div className="table-wrapper">
                <table className="table-industrial">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Issue Date</th>
                      <th>Billing Period</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerPortalData.invs.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                          No invoices recorded for this account.
                        </td>
                      </tr>
                    ) : (
                      customerPortalData.invs.map((inv) => (
                        <tr key={inv.id}>
                          <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{inv.invoiceNumber}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{inv.issueDate}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                            {inv.billingPeriodStart} to {inv.billingPeriodEnd}
                          </td>
                          <td>
                            <span className={`status-signal ${inv.status === 'PAID' ? 'signal-active' : 'signal-orange'}`}>
                              <span>{inv.status}</span>
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                            ${parseFloat(inv.totalAmount).toFixed(2)}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                              {inv.status !== 'PAID' && (
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() => {
                                    setSelectedInvoice(inv);
                                    setPaymentAmount(inv.outstandingAmount || inv.totalAmount);
                                    setShowPaymentModal(true);
                                  }}
                                  style={{ height: '1.5rem', padding: '0 0.5rem', fontSize: '0.6875rem' }}
                                >
                                  <CreditCard size={10} />
                                  <span>Pay</span>
                                </button>
                              )}
                              <a
                                href={`${API_BASE}/invoices/${inv.id}/pdf`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-primary btn-sm"
                                style={{ height: '1.5rem', padding: '0 0.5rem', fontSize: '0.6875rem' }}
                              >
                                <Download size={10} />
                                <span>PDF</span>
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: CREATE QUOTATION */}
      {showQuoteModal && (
        <div className="dialog-backdrop">
          <div className="dialog-panel">
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>New Quotation</h3>
              <button className="btn-icon-circle" onClick={() => setShowQuoteModal(false)}>✕</button>
            </div>

            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Customer</label>
                <select
                  className="input-field"
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.companyName} ({c.contactName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Plan</label>
                <select
                  className="input-field"
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                >
                  {plans.map((pl) => (
                    <option key={pl.id} value={pl.id}>{pl.name} ({pl.billingInterval})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Product</label>
                <select
                  className="input-field"
                  value={selectedProduct}
                  onChange={(e) => {
                    setSelectedProduct(e.target.value);
                    const p = products.find((prod) => prod.id === e.target.value);
                    if (p?.variants?.[0]) setSelectedVariant(p.variants[0].id);
                  }}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} - ${parseFloat(p.salesPrice).toFixed(2)}</option>
                  ))}
                </select>
              </div>

              {products.find((p) => p.id === selectedProduct)?.variants?.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Brand Variant</label>
                  <select
                    className="input-field"
                    value={selectedVariant}
                    onChange={(e) => setSelectedVariant(e.target.value)}
                  >
                    {products.find((p) => p.id === selectedProduct)?.variants.map((v: any) => (
                      <option key={v.id} value={v.id}>{v.name} (+${parseFloat(v.priceAdjustment).toFixed(2)})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Seats</label>
                <input
                  type="number"
                  min={1}
                  className="input-field"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setShowQuoteModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleCreateQuote} disabled={loading}>
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RECORD PAYMENT */}
      {showPaymentModal && selectedInvoice && (
        <div className="dialog-backdrop">
          <div className="dialog-panel">
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Record Payment</h3>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Invoice: {selectedInvoice.invoiceNumber}</div>
              </div>
              <button className="btn-icon-circle" onClick={() => setShowPaymentModal(false)}>✕</button>
            </div>

            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.625rem', backgroundColor: 'var(--bg-well)', borderRadius: 'var(--radius-xs)', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Invoice Total:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>${parseFloat(selectedInvoice.totalAmount).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.15rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Settled to Date:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>${parseFloat(selectedInvoice.amountPaid).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.25rem' }}>
                  <span style={{ fontWeight: 600 }}>Balance Due:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--brand-orange)' }}>
                    ${Math.max(0, parseFloat(selectedInvoice.totalAmount) - parseFloat(selectedInvoice.amountPaid)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Payment Method</label>
                <select
                  className="input-field"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="WIRE_TRANSFER">Wire Transfer</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="CHECK">Check</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Reference Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Wire Reference #100293"
                  className="input-field"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                />
              </div>
            </div>

            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setShowPaymentModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleRecordPayment} disabled={loading}>
                {loading ? 'Recording...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
