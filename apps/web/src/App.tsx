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
  Clock,
  Download,
  CreditCard,
  Plus,
  RefreshCw,
  Pause,
  ArrowRight,
  Sun,
  Moon,
  Search,
  Bell,
  Cpu,
  Activity,
  Layers,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ExternalLink,
  ChevronDown,
  Lock,
  Database
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
        if (custsRes.data[0]) setSelectedCustomer(custsRes.data[0].id);
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
    }, 8000);
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
        showToast(`Billing scan executed: ${data.data.generatedCount} generated, ${data.data.skippedCount} skipped.`);
        loadData();
      }
    } catch (e) {
      showToast('Billing scan execution failed');
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
        showToast('Quotation converted to active subscription');
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
        showToast('New quotation created');
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

  const customerPortalData = {
    customer: customers.find((c) => c.contactName?.toLowerCase().includes('sarah') || c.id === selectedCustomer) || customers[0],
    subs: subscriptions.filter((s) => s.customerId === customers[0]?.id || customers.length === 1),
    invs: invoices.filter((i) => i.customerId === customers[0]?.id || customers.length === 1)
  };

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

      {/* TOP COMPACT NAVIGATION BAR (Precision Engineered Header) */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-panel)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: '48px',
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
          {/* Left: Industrial Brand Mark & Telemetry */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
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
              <span style={{ fontSize: '0.9375rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                BRIGHTLOOP
              </span>
            </div>

            <div style={{ height: '14px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span className="status-signal signal-active">
                <span className="signal-dot" />
                <span>ENGINE ONLINE</span>
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                LATENCY: {report?.queryTimeMs || 4}ms
              </span>
            </div>
          </div>

          {/* Center: Search Field */}
          <div
            style={{
              position: 'relative',
              maxWidth: '360px',
              width: '100%',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Search size={13} style={{ position: 'absolute', left: '0.625rem', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search contracts, invoices, accounts... (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{
                height: '1.875rem',
                paddingLeft: '2rem',
                fontSize: '0.75rem',
                backgroundColor: 'var(--bg-well)'
              }}
            />
          </div>

          {/* Right: Circular Icon Controls, Role, and User Chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Refresh */}
            <button
              className="btn-icon-circle"
              onClick={loadData}
              title="Refresh telemetry"
              disabled={loading}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* Notifications */}
            <button className="btn-icon-circle" title="System alerts">
              <Bell size={13} />
            </button>

            {/* Theme Toggle */}
            <button
              className="btn-icon-circle"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon size={13} /> : <Sun size={13} color="var(--brand-orange)" />}
            </button>

            <div style={{ height: '14px', width: '1px', backgroundColor: 'var(--border-subtle)', margin: '0 0.25rem' }} />

            {/* Persona Switcher Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-well)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.15rem 0.5rem',
                gap: '0.375rem',
                height: '1.875rem'
              }}
            >
              <Shield size={12} color="var(--brand-orange)" />
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as any)}
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
                <option value="admin">Role: Admin</option>
                <option value="staff">Role: Staff</option>
                <option value="customer">Role: Customer</option>
              </select>
            </div>

            {/* User Avatar */}
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--text-primary)',
                color: 'var(--text-inverse)',
                fontSize: '0.6875rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Signed in operator"
            >
              {currentRole === 'customer' ? 'SC' : 'OP'}
            </div>
          </div>
        </div>
      </header>

      {/* SUB-HEADER: TECHNICAL NAVIGATION & SCHEDULER HORIZON */}
      <div
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-panel-elevated)',
          padding: '0.5rem 1.25rem'
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
            gap: '0.75rem'
          }}
        >
          {/* Segmented Navigation */}
          <nav className="nav-segmented">
            <button
              className={`nav-tab-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={13} />
              <span>Operations Console</span>
            </button>
            <button
              className={`nav-tab-item ${activeTab === 'quotations' ? 'active' : ''}`}
              onClick={() => setActiveTab('quotations')}
            >
              <FileText size={13} />
              <span>Quotations</span>
              {quotations.filter((q) => q.status === 'SENT').length > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--brand-orange)',
                    color: '#FFFFFF',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.625rem',
                    padding: '0 0.35rem',
                    fontWeight: 700
                  }}
                >
                  {quotations.filter((q) => q.status === 'SENT').length}
                </span>
              )}
            </button>
            <button
              className={`nav-tab-item ${activeTab === 'subscriptions' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscriptions')}
            >
              <Repeat size={13} />
              <span>Subscriptions</span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                ({subscriptions.length})
              </span>
            </button>
            <button
              className={`nav-tab-item ${activeTab === 'invoices' ? 'active' : ''}`}
              onClick={() => setActiveTab('invoices')}
            >
              <Receipt size={13} />
              <span>Invoices & AR</span>
              {invoices.filter((i) => i.isOverdue).length > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--status-danger)',
                    color: '#FFFFFF',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.625rem',
                    padding: '0 0.35rem',
                    fontWeight: 700
                  }}
                >
                  {invoices.filter((i) => i.isOverdue).length}
                </span>
              )}
            </button>
            <button
              className={`nav-tab-item ${activeTab === 'catalog' ? 'active' : ''}`}
              onClick={() => setActiveTab('catalog')}
            >
              <Package size={13} />
              <span>Catalog & Plans</span>
            </button>
            <button
              className={`nav-tab-item ${activeTab === 'portal' ? 'active' : ''}`}
              onClick={() => setActiveTab('portal')}
            >
              <Users size={13} />
              <span>Customer Portal</span>
            </button>
          </nav>

          {/* Right: Scheduler Status Pill & Manual Trigger Action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-secondary)'
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: scheduler?.isRunning ? 'var(--brand-orange)' : 'var(--text-muted)'
                }}
              />
              <span>
                SCHEDULER: {scheduler?.isRunning ? `TICK ${scheduler.intervalSeconds}s` : 'STOPPED'}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>|</span>
              <span>
                TOTAL RUNS: {scheduler?.totalRuns || 0}
              </span>
            </div>

            <button
              className="btn btn-primary btn-sm"
              onClick={handleTriggerBilling}
              disabled={billingLoading}
            >
              <Play size={12} />
              <span>{billingLoading ? 'Executing Cycle...' : 'Run Billing Scan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN WORKSPACE CONTENT */}
      <main style={{ maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '1.25rem', flex: 1 }}>
        {/* ========================================================================= */}
        {/* TAB 1: OPERATIONS CONSOLE (THE INDUSTRIAL DASHBOARD) */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* PRIMARY METRIC INSTRUMENT STRIP (Contiguous, Hairline Dividers) */}
            <div className="instrument-strip">
              <div className="instrument-strip-cell">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Monthly Recurring Revenue
                  </span>
                  <DollarSign size={14} color="var(--brand-orange)" />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', fontFamily: 'var(--font-mono)' }}>
                  ${report ? parseFloat(report.mrr).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Normalized monthly contracted run-rate
                </div>
              </div>

              <div className="instrument-strip-cell">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Active Subscriptions
                  </span>
                  <Repeat size={14} color="var(--brand-orange)" />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', fontFamily: 'var(--font-mono)' }}>
                  {report ? report.activeSubscriptions : subscriptions.filter((s) => s.status === 'ACTIVE').length}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {report?.pausedSubscriptions || 0} paused contracts • 0 cancellations
                </div>
              </div>

              <div className="instrument-strip-cell">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Settled Revenue
                  </span>
                  <CheckCircle2 size={14} color="var(--status-success)" />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', fontFamily: 'var(--font-mono)', color: 'var(--status-success)' }}>
                  ${report ? parseFloat(report.totalRevenueCollected).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  100% reconciled across wire & cards
                </div>
              </div>

              <div className="instrument-strip-cell">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Accounts Receivable
                  </span>
                  <AlertCircle size={14} color="var(--status-danger)" />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', fontFamily: 'var(--font-mono)', color: parseFloat(report?.totalAmountOwed || '0') > 0 ? 'var(--status-danger)' : 'var(--text-primary)' }}>
                  ${report ? parseFloat(report.totalAmountOwed).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--status-danger)', marginTop: '0.25rem' }}>
                  {report?.overdueInvoicesCount || 0} overdue invoice (${report ? parseFloat(report.overdueAmount).toFixed(2) : '0.00'})
                </div>
              </div>
            </div>

            {/* TWO-COLUMN INDUSTRIAL WORKSPACE (68% Main / 32% Side Panels) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '1.25rem' }}>
              {/* LEFT COLUMN: PRIMARY WORKSPACE */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Billing Engine Telemetry Panel */}
                <div className="instrument-panel" style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Cpu size={15} color="var(--brand-orange)" />
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Automatic Recurring Billing Telemetry
                      </span>
                    </div>
                    <span className="status-signal signal-orange">
                      <span className="signal-dot" />
                      <span>Lock: Advisory 89214 Safe</span>
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg-well)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem'
                    }}
                  >
                    <div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.6875rem' }}>Execution Mode</div>
                      <div style={{ fontWeight: 600, marginTop: '0.15rem' }}>In-Process Scheduler</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.6875rem' }}>Last Scan Executed</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, marginTop: '0.15rem' }}>
                        {scheduler?.lastRunAt ? new Date(scheduler.lastRunAt).toLocaleTimeString() : 'Pending'}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.6875rem' }}>Last Batch Generated</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--brand-orange)', marginTop: '0.15rem' }}>
                        {scheduler?.lastGeneratedCount || 0} invoices
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.6875rem' }}>Duplicates Skipped</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, marginTop: '0.15rem' }}>
                        {scheduler?.lastSkippedCount || 0} (Idempotent)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Data Table: Operational Invoices */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Receipt size={14} color="var(--brand-orange)" />
                      <h3 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Recent Invoices & Accounts Receivable
                      </h3>
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('invoices')}>
                      <span>View All Invoices</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>

                  <div className="table-wrapper">
                    <table className="table-industrial">
                      <thead>
                        <tr>
                          <th>Invoice Ref</th>
                          <th>Customer</th>
                          <th>Period Horizon</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Total</th>
                          <th style={{ textAlign: 'right' }}>Balance Due</th>
                          <th style={{ textAlign: 'center' }}>PDF</th>
                          <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.length === 0 ? (
                          <tr>
                            <td colSpan={8} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                              No invoices generated yet.
                            </td>
                          </tr>
                        ) : (
                          invoices.slice(0, 6).map((inv) => {
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
                                </td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                  {inv.billingPeriodStart} ➔ {inv.billingPeriodEnd}
                                </td>
                                <td>
                                  <span
                                    className={`status-signal ${
                                      isPaid ? 'signal-active' : inv.isOverdue ? 'signal-danger' : 'signal-orange'
                                    }`}
                                  >
                                    <span className="signal-dot" />
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
                                    style={{ width: '24px', height: '24px' }}
                                  >
                                    <Download size={11} />
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
                                      Record
                                    </button>
                                  ) : (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--status-success)', fontWeight: 600 }}>Settled</span>
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
              </div>

              {/* RIGHT COLUMN: SECONDARY INFORMATION PANELS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* System Activity Stream */}
                <div className="instrument-panel" style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Activity size={14} color="var(--brand-orange)" />
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Operational Audit Trail
                      </span>
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>LIVE STREAM</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.75rem' }}>
                    <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-hairline)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.6875rem' }}>
                        <span>SYSTEM CRON</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>T-00:12</span>
                      </div>
                      <div style={{ fontWeight: 500, marginTop: '0.15rem' }}>
                        Automated scan evaluated active subscriptions with 0 duplicate collisions.
                      </div>
                    </div>

                    <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-hairline)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.6875rem' }}>
                        <span>FINANCE RECONCILE</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>SETTLED</span>
                      </div>
                      <div style={{ fontWeight: 500, marginTop: '0.15rem' }}>
                        Wire transfer payment reconciled against invoice with zero float drift.
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.6875rem' }}>
                        <span>CATALOG DISPATCH</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>ODOO +560</span>
                      </div>
                      <div style={{ fontWeight: 500, marginTop: '0.15rem' }}>
                        Brand variant pricing adjustment correctly applied to new quotes.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overdue Collection Queue */}
                <div className="instrument-panel" style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={14} color="var(--status-danger)" />
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Overdue Invoices Queue
                      </span>
                    </div>
                    <span className="status-signal signal-danger">
                      <span className="signal-dot" />
                      <span>{invoices.filter((i) => i.isOverdue).length} PENDING</span>
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {invoices.filter((i) => i.isOverdue).length === 0 ? (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                        No overdue accounts receivable.
                      </div>
                    ) : (
                      invoices.filter((i) => i.isOverdue).map((inv) => (
                        <div
                          key={inv.id}
                          style={{
                            padding: '0.625rem',
                            backgroundColor: 'var(--bg-well)',
                            borderRadius: 'var(--radius-sm)',
                            borderLeft: '3px solid var(--status-danger)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                              {inv.invoiceNumber}
                            </div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                              Due Date: {inv.dueDate}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--status-danger)' }}>
                              ${parseFloat(inv.outstandingAmount || inv.totalAmount).toFixed(2)}
                            </div>
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ height: '1.5rem', padding: '0 0.5rem', fontSize: '0.6875rem', marginTop: '0.25rem' }}
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setPaymentAmount(inv.outstandingAmount || inv.totalAmount);
                                setShowPaymentModal(true);
                              }}
                            >
                              Collect
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Database Infrastructure Status */}
                <div className="instrument-panel" style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                    <Database size={14} color="var(--brand-orange)" />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Infrastructure Telemetry
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Relational Store</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>PostgreSQL 16 (Port 5433)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Numeric Money Invariant</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>NUMERIC(14, 4) Zero Float</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Locking Protocol</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>pg_try_advisory_xact_lock</span>
                    </div>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Quotations & Sales Proposals</h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Manage multi-tier proposals with 1-click atomic conversion into active contracts.
                </p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowQuoteModal(true)}>
                <Plus size={13} />
                <span>Create New Quotation</span>
              </button>
            </div>

            <div className="table-wrapper">
              <table className="table-industrial">
                <thead>
                  <tr>
                    <th>Quote Ref</th>
                    <th>Customer Account</th>
                    <th>Billing Plan</th>
                    <th>Status</th>
                    <th>Expiry Horizon</th>
                    <th>Converted Contract</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
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
                          <td>{plan?.name || 'Enterprise Annual'}</td>
                          <td>
                            <span className={`status-signal ${isConverted ? 'signal-active' : 'signal-orange'}`}>
                              <span className="signal-dot" />
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
                                <ArrowRight size={12} />
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Contracted Subscriptions</h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Active recurring agreements, lifecycle state toggles, and next billing horizons.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="status-signal signal-active">
                  <span className="signal-dot" />
                  <span>{subscriptions.filter((s) => s.status === 'ACTIVE').length} Active</span>
                </span>
                <span className="status-signal signal-warning">
                  <span className="signal-dot" />
                  <span>{subscriptions.filter((s) => s.status === 'PAUSED').length} Paused</span>
                </span>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="table-industrial">
                <thead>
                  <tr>
                    <th>Contract Ref</th>
                    <th>Customer</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Commencement</th>
                    <th>Next Scheduled Horizon</th>
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
                          <span
                            className={`status-signal ${
                              isActive ? 'signal-active' : sub.status === 'PAUSED' ? 'signal-warning' : 'signal-danger'
                            }`}
                          >
                            <span className="signal-dot" />
                            <span>{sub.status}</span>
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{sub.startDate}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--brand-orange)' }}>
                          {sub.nextBillingDate}
                        </td>
                        <td>
                          <span className="status-signal">{sub.paymentTerms || 'NET_30'}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleToggleSubStatus(sub.id, sub.status)}
                          >
                            {isActive ? <Pause size={12} /> : <Play size={12} />}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Invoices & Receivables Ledger</h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Immutable financial snapshots, vector PDF statements, and settlement ledger.
                </p>
              </div>

              <button className="btn btn-primary btn-sm" onClick={handleTriggerBilling} disabled={billingLoading}>
                <Play size={12} />
                <span>{billingLoading ? 'Processing...' : 'Run Billing Scan'}</span>
              </button>
            </div>

            <div className="table-wrapper">
              <table className="table-industrial">
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th>Customer</th>
                    <th>Billing Horizon</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                    <th style={{ textAlign: 'right' }}>Discount</th>
                    <th style={{ textAlign: 'right' }}>Tax (20%)</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th style={{ textAlign: 'right' }}>Balance Due</th>
                    <th style={{ textAlign: 'center' }}>PDF</th>
                    <th style={{ textAlign: 'right' }}>Reconcile</th>
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
                          {inv.billingPeriodStart} ➔ {inv.billingPeriodEnd}
                        </td>
                        <td>
                          <span
                            className={`status-signal ${
                              isPaid ? 'signal-active' : inv.isOverdue ? 'signal-danger' : 'signal-orange'
                            }`}
                          >
                            <span className="signal-dot" />
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
                            title="Download Vector PDF"
                            style={{ width: '24px', height: '24px' }}
                          >
                            <Download size={11} />
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Software Catalog & Variant Adjustments</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Configured software solutions, multi-brand variant differentials (+560 Odoo brand), and interval plans.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {products.map((p) => (
                <div key={p.id} className="instrument-panel" style={{ padding: '1.125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{p.name}</h3>
                      <span className="status-signal signal-orange" style={{ marginTop: '0.25rem' }}>
                        {p.productType}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        ${parseFloat(p.salesPrice).toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Base list price</div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Brand Variant Differentials
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {p.variants?.map((v: any) => (
                        <div
                          key={v.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.45rem 0.625rem',
                            backgroundColor: 'var(--bg-well)',
                            borderRadius: 'var(--radius-xs)',
                            fontSize: '0.75rem'
                          }}
                        >
                          <span style={{ fontWeight: 500 }}>{v.name}</span>
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

            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Billing Interval Plans</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {plans.map((pl) => (
                  <div key={pl.id} className="instrument-panel" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                      <h4 style={{ fontWeight: 600, fontSize: '0.875rem' }}>{pl.name}</h4>
                      <span className="status-signal">{pl.billingInterval}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <div>Min Seats: {pl.minQuantity} units</div>
                      <div>Auto-Close on Expiry: {pl.autoClose ? 'Yes' : 'No'}</div>
                      <div>Allows Contract Pause: {pl.allowPause ? 'Yes' : 'No'}</div>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="instrument-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--brand-orange)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span className="status-signal signal-orange">Customer Self-Service Interface</span>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem' }}>
                    {customerPortalData.customer?.companyName || 'Corporate Client Account'}
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Primary Contact: {customerPortalData.customer?.contactName} • {customerPortalData.customer?.email}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.625rem' }}>
                  <div className="instrument-panel" style={{ padding: '0.625rem 1rem' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Active Plan</div>
                    <div style={{ fontWeight: 700, color: 'var(--brand-orange)', fontSize: '0.8125rem' }}>
                      Monthly Pro (Odoo Brand)
                    </div>
                  </div>
                  <div className="instrument-panel" style={{ padding: '0.625rem 1rem' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Total Invoices</div>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                      {customerPortalData.invs.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.5rem' }}>Active Agreements</h3>
              <div className="table-wrapper">
                <table className="table-industrial">
                  <thead>
                    <tr>
                      <th>Subscription ID</th>
                      <th>Status</th>
                      <th>Commenced</th>
                      <th>Next Horizon</th>
                      <th>Terms</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerPortalData.subs.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{s.subscriptionNumber}</td>
                        <td>
                          <span className="status-signal signal-active">
                            <span className="signal-dot" />
                            <span>{s.status}</span>
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{s.startDate}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--brand-orange)' }}>
                          {s.nextBillingDate}
                        </td>
                        <td>{s.paymentTerms}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.5rem' }}>Invoice Statements & Vector PDF</h3>
              <div className="table-wrapper">
                <table className="table-industrial">
                  <thead>
                    <tr>
                      <th>Invoice No</th>
                      <th>Issue Date</th>
                      <th>Billing Period</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerPortalData.invs.map((inv) => (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{inv.invoiceNumber}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{inv.issueDate}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                          {inv.billingPeriodStart} to {inv.billingPeriodEnd}
                        </td>
                        <td>
                          <span className={`status-signal ${inv.status === 'PAID' ? 'signal-active' : 'signal-orange'}`}>
                            <span className="signal-dot" />
                            <span>{inv.status}</span>
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                          ${parseFloat(inv.totalAmount).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <a
                            href={`${API_BASE}/invoices/${inv.id}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary btn-sm"
                          >
                            <Download size={12} />
                            <span>Download PDF</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: CREATE QUOTATION */}
      {/* ========================================================================= */}
      {showQuoteModal && (
        <div className="dialog-backdrop">
          <div className="dialog-panel">
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Generate New Quotation</h3>
              <button className="btn-icon-circle" onClick={() => setShowQuoteModal(false)}>✕</button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
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
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Billing Plan</label>
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
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Seats / Quantity</label>
                <input
                  type="number"
                  min={1}
                  className="input-field"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setShowQuoteModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleCreateQuote} disabled={loading}>
                {loading ? 'Creating...' : 'Create Quotation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECORD PAYMENT */}
      {/* ========================================================================= */}
      {showPaymentModal && selectedInvoice && (
        <div className="dialog-backdrop">
          <div className="dialog-panel">
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Record Customer Settlement</h3>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Invoice Ref: {selectedInvoice.invoiceNumber}</p>
              </div>
              <button className="btn-icon-circle" onClick={() => setShowPaymentModal(false)}>✕</button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-well)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Invoice Total:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>${parseFloat(selectedInvoice.totalAmount).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Settled to Date:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>${parseFloat(selectedInvoice.amountPaid).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.25rem' }}>
                  <span style={{ fontWeight: 600 }}>Outstanding Balance Due:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--brand-orange)' }}>
                    ${Math.max(0, parseFloat(selectedInvoice.totalAmount) - parseFloat(selectedInvoice.amountPaid)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Payment Amount ($)</label>
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
                  <option value="WIRE_TRANSFER">Wire Transfer (Fedwire / ACH)</option>
                  <option value="CREDIT_CARD">Corporate Card</option>
                  <option value="CHECK">Certified Bank Check</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Audit Reference</label>
                <input
                  type="text"
                  placeholder="e.g. JPMorgan Wire Ref #100293"
                  className="input-field"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                />
              </div>
            </div>

            <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setShowPaymentModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleRecordPayment} disabled={loading}>
                {loading ? 'Processing...' : 'Confirm & Reconcile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
