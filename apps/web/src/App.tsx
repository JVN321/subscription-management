import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  Repeat,
  Receipt,
  Package,
  User,
  Shield,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  CreditCard,
  Plus,
  RefreshCw,
  Pause,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const API_BASE = 'http://localhost:3001/api/v1';

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'quotations' | 'subscriptions' | 'invoices' | 'catalog' | 'portal'>('dashboard');
  const [currentRole, setCurrentRole] = useState<'admin' | 'staff' | 'customer'>('admin');
  
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const headers = { 'x-user-role': currentRole };
      
      const [repRes, schedRes, quotesRes, subsRes, invsRes, prodsRes, plansRes, custsRes] = await Promise.all([
        fetch(`${API_BASE}/reports/summary`, { headers }).then(r => r.json()).catch(() => ({ data: null })),
        fetch(`${API_BASE}/billing/scheduler`, { headers }).then(r => r.json()).catch(() => ({ data: null })),
        fetch(`${API_BASE}/quotations`, { headers }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${API_BASE}/subscriptions`, { headers }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${API_BASE}/invoices`, { headers }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${API_BASE}/products`, { headers }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${API_BASE}/plans`, { headers }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${API_BASE}/customers`, { headers }).then(r => r.json()).catch(() => ({ data: [] }))
      ]);

      if (repRes?.data) setReport(repRes.data);
      if (schedRes?.data) setScheduler(schedRes.data);
      if (quotesRes?.data) setQuotations(quotesRes.data);
      if (subsRes?.data) setSubscriptions(subsRes.data);
      if (invsRes?.data) setInvoices(invsRes.data);
      if (prodsRes?.data) setProducts(prodsRes.data);
      if (plansRes?.data) setPlans(plansRes.data);
      if (custsRes?.data) setCustomers(custsRes.data);

      if (custsRes?.data?.length > 0 && !selectedCustomer) {
        setSelectedCustomer(custsRes.data[0].id);
      }
      if (plansRes?.data?.length > 0 && !selectedPlan) {
        setSelectedPlan(plansRes.data[0].id);
      }
      if (prodsRes?.data?.length > 0 && !selectedProduct) {
        setSelectedProduct(prodsRes.data[0].id);
        if (prodsRes.data[0].variants?.length > 0) {
          setSelectedVariant(prodsRes.data[0].variants[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 15000); // Polling refresh
    return () => clearInterval(interval);
  }, [currentRole]);

  // Actions
  const handleTriggerBilling = async () => {
    try {
      const res = await fetch(`${API_BASE}/billing/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      }).then(r => r.json());

      if (res.data) {
        showToast(`Billing scan complete: Generated ${res.data.generatedCount} invoices (${res.data.skippedCount} duplicates skipped).`);
        await loadData();
      }
    } catch (e) {
      showToast('Billing scan failed');
    }
  };

  const handleConvertQuote = async (quoteId: string) => {
    try {
      const res = await fetch(`${API_BASE}/quotations/${quoteId}/convert`, { method: 'POST' }).then(r => r.json());
      if (res.data) {
        showToast(`Quotation converted! Active Subscription #${res.data.subscriptionNumber} created.`);
        await loadData();
      }
    } catch (e) {
      showToast('Conversion failed');
    }
  };

  const handleToggleSubStatus = async (subId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      await fetch(`${API_BASE}/subscriptions/${subId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      showToast(`Subscription status updated to ${nextStatus}`);
      await loadData();
    } catch (e) {
      showToast('Failed to update subscription');
    }
  };

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const product = products.find(p => p.id === selectedProduct);
      const variant = product?.variants?.find((v: any) => v.id === selectedVariant);
      const basePrice = parseFloat(product?.salesPrice || '0');
      const adj = parseFloat(variant?.priceAdjustment || '0');
      const unitPrice = (basePrice + adj).toFixed(4);

      await fetch(`${API_BASE}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer,
          planId: selectedPlan,
          validityDays: 30,
          lines: [{
            productId: selectedProduct,
            variantId: selectedVariant || undefined,
            quantity: Number(quantity),
            unitPrice
          }]
        })
      });

      showToast('Quotation created successfully');
      setShowQuoteModal(false);
      await loadData();
    } catch (e) {
      showToast('Failed to create quote');
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      const res = await fetch(`${API_BASE}/invoices/${selectedInvoice.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount).toFixed(4),
          paymentMethod,
          notes: paymentNote || 'Payment recorded via console'
        })
      }).then(r => r.json());

      if (res.invoice) {
        showToast(`Payment recorded! Invoice #${res.invoice.invoiceNumber} status: ${res.invoice.status}`);
        setShowPaymentModal(false);
        await loadData();
      }
    } catch (e) {
      showToast('Failed to record payment');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: '#1e293b',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          color: '#f8fafc',
          padding: '12px 20px',
          borderRadius: 10,
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          fontWeight: 500
        }}>
          <Sparkles size={16} color="#818cf8" />
          {toastMessage}
        </div>
      )}

      {/* Top Header Bar */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.8)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
        padding: '12px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            width: 34,
            height: 34,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(99, 102, 241, 0.4)'
          }}>
            <Repeat size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', color: '#fff' }}>
              BRIGHTLOOP
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>
              Subscription & Recurring Billing Platform
            </div>
          </div>

          {/* Scheduler Live Indicator */}
          <div style={{
            marginLeft: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '3px 10px',
            borderRadius: 999,
            fontSize: 11,
            color: '#34d399',
            fontWeight: 600
          }}>
            <span style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981'
            }} />
            Auto-Billing Engine Active ({scheduler?.intervalSeconds || 30}s)
          </div>
        </div>

        {/* Right Persona & Role Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 3
          }}>
            <button
              onClick={() => { setCurrentRole('admin'); setActiveTab('dashboard'); }}
              style={{
                background: currentRole === 'admin' ? 'var(--accent-primary)' : 'transparent',
                color: currentRole === 'admin' ? '#fff' : 'var(--text-muted)',
                border: 'none',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Admin View
            </button>
            <button
              onClick={() => { setCurrentRole('staff'); setActiveTab('quotations'); }}
              style={{
                background: currentRole === 'staff' ? 'var(--accent-primary)' : 'transparent',
                color: currentRole === 'staff' ? '#fff' : 'var(--text-muted)',
                border: 'none',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Staff Console
            </button>
            <button
              onClick={() => { setCurrentRole('customer'); setActiveTab('portal'); }}
              style={{
                background: currentRole === 'customer' ? 'var(--accent-cyan)' : 'transparent',
                color: currentRole === 'customer' ? '#0f172a' : 'var(--text-muted)',
                border: 'none',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Customer Portal
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: '#fff'
            }}>
              {currentRole === 'admin' ? 'A' : currentRole === 'staff' ? 'B' : 'S'}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {currentRole === 'admin' ? 'Alice Cooper' : currentRole === 'staff' ? 'Bob Miller' : 'Sarah Connor'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                {currentRole === 'admin' ? 'admin@brightloop.com' : currentRole === 'staff' ? 'staff@brightloop.com' : 'sarah@shopflow.com'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <nav style={{
        background: 'rgba(15, 23, 42, 0.4)',
        borderBottom: '1px solid var(--border)',
        padding: '0 32px',
        display: 'flex',
        gap: 4
      }}>
        <TabButton icon={<LayoutDashboard size={15} />} label="Dashboard & KPIs" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <TabButton icon={<FileText size={15} />} label="Quotations" count={quotations.length} active={activeTab === 'quotations'} onClick={() => setActiveTab('quotations')} />
        <TabButton icon={<Repeat size={15} />} label="Subscriptions" count={subscriptions.length} active={activeTab === 'subscriptions'} onClick={() => setActiveTab('subscriptions')} />
        <TabButton icon={<Receipt size={15} />} label="Invoices & Payments" count={invoices.length} active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} />
        <TabButton icon={<Package size={15} />} label="Catalog & Pricing" active={activeTab === 'catalog'} onClick={() => setActiveTab('catalog')} />
        <TabButton icon={<User size={15} />} label="Customer Portal" active={activeTab === 'portal'} onClick={() => setActiveTab('portal')} />
      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '28px 32px', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
        
        {/* ========================================================= */}
        {/* TAB 1: EXECUTIVE DASHBOARD */}
        {/* ========================================================= */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                  Operational & Financial Performance
                </h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Real-time subscription metrics, monthly recurring revenue, and accounts receivable.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={handleTriggerBilling} className="btn-primary">
                  <Play size={14} fill="#fff" />
                  Run Billing Scan Now
                </button>
                <button onClick={loadData} className="btn-secondary">
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
              <KpiCard
                title="Active Subscriptions"
                value={report?.activeSubscriptions ?? 0}
                subtitle={`${report?.pausedSubscriptions ?? 0} currently paused`}
                color="#6366f1"
              />
              <KpiCard
                title="Monthly Recurring Revenue"
                value={`$${parseFloat(report?.mrr || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                subtitle="Normalized monthly recurring run rate"
                color="#06b6d4"
              />
              <KpiCard
                title="Total Revenue Collected"
                value={`$${parseFloat(report?.totalRevenueCollected || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                subtitle="From settled customer payments"
                color="#10b981"
              />
              <KpiCard
                title="Total Amount Owed"
                value={`$${parseFloat(report?.totalAmountOwed || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                subtitle={`${report?.overdueInvoicesCount ?? 0} overdue invoices`}
                color={report?.overdueInvoicesCount > 0 ? '#f43f5e' : '#f59e0b'}
              />
            </div>

            {/* Quick Scene Tour Panel */}
            <div className="glass-panel" style={{ padding: 20, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                  Workflow Quick Action: Convert Quote to Invoiced & Paid in Seconds
                </h3>
                <span className="badge badge-active">Scene 1–7 Ready</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                Follow Brightloop's standard flow: create a quote with Odoo variant (+560), convert to active subscription, trigger billing day run, and record payment.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button onClick={() => { setActiveTab('quotations'); setShowQuoteModal(true); }} className="btn-secondary btn-sm">
                  1. Create Quote (+560 Variant)
                </button>
                <button onClick={() => setActiveTab('quotations')} className="btn-secondary btn-sm">
                  2. Convert Quote to Subscription
                </button>
                <button onClick={handleTriggerBilling} className="btn-secondary btn-sm">
                  3. Trigger Billing Run
                </button>
                <button onClick={() => setActiveTab('invoices')} className="btn-secondary btn-sm">
                  4. View Invoice & Download PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: QUOTATIONS */}
        {/* ========================================================= */}
        {activeTab === 'quotations' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Quotations & Sales Proposals</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Scene 3: Reusable templates, validity windows, and 1-click conversion to active subscriptions.
                </p>
              </div>
              <button onClick={() => setShowQuoteModal(true)} className="btn-primary">
                <Plus size={15} />
                New Quotation
              </button>
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Quote #</th>
                    <th>Customer</th>
                    <th>Expires At</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 30 }}>No quotations generated yet. Click "New Quotation" above.</td></tr>
                  ) : (
                    quotations.map((q) => (
                      <tr key={q.id}>
                        <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{q.quoteNumber}</td>
                        <td>{customers.find(c => c.id === q.customerId)?.companyName || 'ShopFlow Retail'}</td>
                        <td>{new Date(q.expiresAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge badge-${q.status.toLowerCase()}`}>
                            {q.status}
                          </span>
                        </td>
                        <td>
                          {q.status === 'SENT' ? (
                            <button
                              onClick={() => handleConvertQuote(q.id)}
                              className="btn-primary btn-sm"
                            >
                              <CheckCircle2 size={13} />
                              Convert to Subscription
                            </button>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                              Converted (Sub: {q.convertedSubscriptionId?.slice(0, 8)})
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SUBSCRIPTIONS */}
        {/* ========================================================= */}
        {activeTab === 'subscriptions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Active Subscriptions</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Scene 2 & 4: Commercial agreements, renewal policies, and automatic billing due dates.
                </p>
              </div>
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Subscription #</th>
                    <th>Customer</th>
                    <th>Plan</th>
                    <th>Next Billing Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 30 }}>No subscriptions active. Convert an accepted quote to create one.</td></tr>
                  ) : (
                    subscriptions.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600, color: '#a5b4fc' }}>{s.subscriptionNumber}</td>
                        <td>{customers.find(c => c.id === s.customerId)?.companyName || 'ShopFlow'}</td>
                        <td>{plans.find(p => p.id === s.planId)?.name || 'Monthly Growth'}</td>
                        <td style={{ fontWeight: 500, color: 'var(--accent-cyan)' }}>{s.nextBillingDate}</td>
                        <td>
                          <span className={`badge badge-${s.status.toLowerCase()}`}>
                            {s.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => handleToggleSubStatus(s.id, s.status)}
                              className="btn-secondary btn-sm"
                            >
                              {s.status === 'ACTIVE' ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Resume</>}
                            </button>
                            <button
                              onClick={handleTriggerBilling}
                              className="btn-primary btn-sm"
                            >
                              Bill Now
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: INVOICES & PAYMENTS */}
        {/* ========================================================= */}
        {activeTab === 'invoices' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Invoices & Accounts Receivable</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Scene 4 & 6: Automated tax & discount computation, PDFKit generation, and payment matching.
                </p>
              </div>
              <button onClick={handleTriggerBilling} className="btn-primary">
                <Play size={14} fill="#fff" />
                Run Billing Scan
              </button>
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Customer</th>
                    <th>Billing Period</th>
                    <th>Total ($)</th>
                    <th>Paid ($)</th>
                    <th>Balance Due</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 30 }}>No invoices generated yet. Run a billing scan to generate invoices.</td></tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: 600, color: '#f8fafc' }}>{inv.invoiceNumber}</td>
                        <td>{customers.find(c => c.id === inv.customerId)?.companyName || 'ShopFlow'}</td>
                        <td style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                          {inv.billingPeriodStart} → {inv.billingPeriodEnd}
                        </td>
                        <td style={{ fontWeight: 600 }}>${parseFloat(inv.totalAmount).toFixed(2)}</td>
                        <td style={{ color: '#34d399' }}>${parseFloat(inv.amountPaid).toFixed(2)}</td>
                        <td style={{ fontWeight: 600, color: parseFloat(inv.outstandingAmount) > 0 ? '#fb7185' : '#94a3b8' }}>
                          ${parseFloat(inv.outstandingAmount).toFixed(2)}
                        </td>
                        <td>
                          {inv.isOverdue ? (
                            <span className="badge badge-overdue">OVERDUE</span>
                          ) : (
                            <span className={`badge badge-${inv.status.toLowerCase()}`}>
                              {inv.status}
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <a
                              href={`${API_BASE}/invoices/${inv.id}/pdf`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-secondary btn-sm"
                              style={{ textDecoration: 'none' }}
                            >
                              <Download size={13} />
                              PDF
                            </a>
                            {inv.status !== 'PAID' && (
                              <button
                                onClick={() => {
                                  setSelectedInvoice(inv);
                                  setPaymentAmount(inv.outstandingAmount);
                                  setShowPaymentModal(true);
                                }}
                                className="btn-primary btn-sm"
                              >
                                <CreditCard size={13} />
                                Pay
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: CATALOG & PRICING */}
        {/* ========================================================= */}
        {activeTab === 'catalog' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Products, Plans & Discounts</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Scene 2 & 5: Configurable variant adjustments (e.g. Odoo brand +560.0000), minimum quantities, and tax rules.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              {/* Products Card */}
              <div className="glass-panel" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Package size={16} color="var(--accent-primary)" />
                  Software Products & Variants
                </h3>
                {products.map((p) => (
                  <div key={p.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#f8fafc' }}>{p.name}</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>${parseFloat(p.salesPrice).toFixed(2)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', margin: '4px 0' }}>{p.notes}</div>
                    {p.variants?.map((v: any) => (
                      <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#a5b4fc', marginLeft: 12, marginTop: 4 }}>
                        <span>↳ {v.name}</span>
                        <span style={{ fontWeight: 600 }}>+${parseFloat(v.priceAdjustment).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Plans Card */}
              <div className="glass-panel" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Repeat size={16} color="var(--accent-cyan)" />
                  Billing Plans & Intervals
                </h3>
                {plans.map((pl) => (
                  <div key={pl.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#f8fafc' }}>{pl.name}</span>
                      <span className="badge badge-active">{pl.billingInterval}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
                      Min Qty: {pl.minQuantity} seat(s) | Auto-Close: {pl.autoClose ? 'Yes' : 'No'} | Pause Allowed: {pl.allowPause ? 'Yes' : 'No'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: CUSTOMER PORTAL */}
        {/* ========================================================= */}
        {activeTab === 'portal' && (
          <div>
            <div className="glass-panel" style={{ padding: 24, marginBottom: 24, background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(99, 102, 241, 0.08) 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="badge badge-confirmed" style={{ marginBottom: 8 }}>Self-Service Subscriber Portal</span>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>ShopFlow Retail Solutions</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Primary Contact: Sarah Connor (sarah@shopflow.com) | NY Sales Tax Registered
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Balance Due</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: invoices.some(i => parseFloat(i.outstandingAmount) > 0) ? '#fb7185' : '#34d399' }}>
                    ${invoices.reduce((sum, i) => sum + parseFloat(i.outstandingAmount || '0'), 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
                Your Subscriptions & Invoice History
              </h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice / Document</th>
                    <th>Billing Period</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 600 }}>{inv.invoiceNumber}</td>
                      <td>{inv.billingPeriodStart} → {inv.billingPeriodEnd}</td>
                      <td style={{ fontWeight: 600 }}>${parseFloat(inv.totalAmount).toFixed(2)}</td>
                      <td>
                        <span className={`badge badge-${inv.status.toLowerCase()}`}>{inv.status}</span>
                      </td>
                      <td>
                        <a
                          href={`${API_BASE}/invoices/${inv.id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-primary btn-sm"
                          style={{ textDecoration: 'none' }}
                        >
                          <Download size={13} />
                          Invoice PDF
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Create Quotation */}
      {showQuoteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
              Create New Commercial Quotation
            </h3>
            <form onSubmit={handleCreateQuote} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Customer</label>
                <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} className="input-control">
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.companyName} ({c.email})</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Recurring Plan</label>
                <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} className="input-control">
                  {plans.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.billingInterval})</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Software Product</label>
                <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="input-control">
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} (${parseFloat(p.salesPrice).toFixed(2)})</option>)}
                </select>
              </div>

              {products.find(p => p.id === selectedProduct)?.variants?.length > 0 && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                    Product Variant (Brand Adjustment)
                  </label>
                  <select value={selectedVariant} onChange={(e) => setSelectedVariant(e.target.value)} className="input-control">
                    {products.find(p => p.id === selectedProduct)?.variants.map((v: any) => (
                      <option key={v.id} value={v.id}>{v.name} (+${parseFloat(v.priceAdjustment).toFixed(2)})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Seat / License Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="input-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button type="button" onClick={() => setShowQuoteModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Generate Quotation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Payment */}
      {showPaymentModal && selectedInvoice && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
              Record Payment: {selectedInvoice.invoiceNumber}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Total Amount: ${parseFloat(selectedInvoice.totalAmount).toFixed(2)} | Current Outstanding: ${parseFloat(selectedInvoice.outstandingAmount).toFixed(2)}
            </p>
            <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Payment Amount ($)</label>
                <input
                  type="text"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="input-control"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Payment Method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input-control">
                  <option value="WIRE_TRANSFER">Wire Transfer</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="BANK_DEBIT">Direct Debit (ACH)</option>
                  <option value="CHECK">Corporate Check</option>
                  <option value="OTHER">Other / Cash</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Notes / Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Bank Ref #9921"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="input-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button type="button" onClick={() => setShowPaymentModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Confirm & Reconcile Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ icon, label, count, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
        color: active ? '#818cf8' : 'var(--text-muted)',
        border: 'none',
        borderBottom: active ? '2px solid var(--accent-primary)' : '2px solid transparent',
        padding: '14px 16px',
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
        transition: 'all 0.15s ease'
      }}
    >
      {icon}
      {label}
      {count !== undefined && (
        <span style={{
          background: active ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.08)',
          color: active ? '#a5b4fc' : 'var(--text-dim)',
          padding: '1px 6px',
          borderRadius: 10,
          fontSize: 11,
          fontWeight: 700
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

function KpiCard({ title, value, subtitle, color }: any) {
  return (
    <div className="glass-panel" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 4,
        height: '100%',
        backgroundColor: color
      }} />
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {title}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '8px 0 4px 0', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
        {subtitle}
      </div>
    </div>
  );
}
