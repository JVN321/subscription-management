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
  DollarSign,
  Mail,
  Key,
  LogIn,
  LogOut,
  Send,
  Percent,
  UserPlus,
  Tag,
  Clock,
  Filter,
  Check,
  XCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';

const API_BASE = 'http://localhost:3001/api/v1';

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('brightloop_theme') as 'light' | 'dark') || 'light';
  });

  const [activeTab, setActiveTab] = useState<'landing' | 'dashboard' | 'quotations' | 'subscriptions' | 'invoices' | 'discounts' | 'catalog' | 'portal'>('dashboard');
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

  // Discounts, Templates & Staff Management States (Scenes 1, 3, 5)
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [quotationTemplates, setQuotationTemplates] = useState<any[]>([]);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);

  // Discount Form
  const [discountCode, setDiscountCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('0.15');
  const [discountMinQty, setDiscountMinQty] = useState('5');
  const [discountMinSpend, setDiscountMinSpend] = useState('500.00');
  const [discountMaxUses, setDiscountMaxUses] = useState('50');

  // Staff Provisioning Form
  const [staffEmail, setStaffEmail] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffPassword, setStaffPassword] = useState('Brightloop@2026');

  // Quotation Template Form
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [validityDays, setValidityDays] = useState(30);

  // Invoice Filter
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'unpaid' | 'overdue'>('all');

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

  // Authentication & Session State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot' | 'resend_info'>('signin');
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string; role: 'admin' | 'staff' | 'customer' } | null>(() => {
    const saved = localStorage.getItem('brightloop_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return { id: 'admin-1', email: 'admin@brightloop.com', name: 'Alice Cooper (Admin)', role: 'admin' };
  });

  const [loginEmail, setLoginEmail] = useState('admin@brightloop.com');
  const [loginPassword, setLoginPassword] = useState('Brightloop@2026');
  const [signupName, setSignupName] = useState('');
  const [signupCompany, setSignupCompany] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('Brightloop@2026');
  const [forgotEmail, setForgotEmail] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSignIn = async (emailOverride?: string, passwordOverride?: string) => {
    const emailToUse = emailOverride || loginEmail;
    const passwordToUse = passwordOverride || loginPassword;
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/sign-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse, password: passwordToUse })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAuthError(data.error?.message || 'Invalid credentials');
        return;
      }
      const user = data.data.user;
      setCurrentUser(user);
      setCurrentRole(user.role);
      localStorage.setItem('brightloop_user', JSON.stringify(user));
      if (data.data.customer) {
        setPortalCustomerId(data.data.customer.id);
      }
      if (user.role === 'customer') {
        setActiveTab('portal');
      } else {
        setActiveTab('dashboard');
      }
      setShowAuthModal(false);
      showToast(`Signed in as ${user.email} (${user.role.toUpperCase()})`);
      loadData();
    } catch (err) {
      setAuthError('Connection failed to backend API');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!signupEmail || !signupPassword) {
      setAuthError('Email and password are required');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/sign-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          name: signupName || signupEmail.split('@')[0],
          companyName: signupCompany || 'Client Account',
          role: 'customer'
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAuthError(data.error?.message || 'Registration failed');
        return;
      }
      const user = data.data.user;
      setCurrentUser(user);
      setCurrentRole('customer');
      localStorage.setItem('brightloop_user', JSON.stringify(user));
      if (data.data.customer) {
        setPortalCustomerId(data.data.customer.id);
      }
      setActiveTab('portal');
      setShowAuthModal(false);
      showToast(`Account created for ${user.email}! Welcome email dispatched via Resend.`);
      loadData();
    } catch (err) {
      setAuthError('Registration connection failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      setAuthError('Please enter an email address');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      showToast(data.data?.message || 'Password reset link dispatched via Resend.');
      setAuthMode('signin');
    } catch (err) {
      setAuthError('Failed to dispatch reset email');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSendInvoiceEmail = async (invoiceId: string) => {
    try {
      const res = await fetch(`${API_BASE}/invoices/${invoiceId}/send`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.data) {
        showToast(`Invoice sent to ${data.data.recipient} (${data.data.mode === 'live' ? 'Live via Resend' : 'Simulated'})`);
      }
    } catch (e) {
      showToast('Failed to send invoice email');
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('brightloop_user');
    showToast('Signed out of Brightloop console');
    setActiveTab('landing');
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const headers = { 'x-user-role': currentRole };

      const [repRes, schedRes, quotesRes, subsRes, invsRes, prodsRes, plansRes, custsRes, discRes, tplRes] = await Promise.all([
        fetch(`${API_BASE}/reports/summary`, { headers }).then((r) => r.json()).catch(() => ({ data: null })),
        fetch(`${API_BASE}/billing/scheduler`, { headers }).then((r) => r.json()).catch(() => ({ data: null })),
        fetch(`${API_BASE}/quotations`, { headers }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch(`${API_BASE}/subscriptions`, { headers }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch(`${API_BASE}/invoices`, { headers }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch(`${API_BASE}/products`, { headers }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch(`${API_BASE}/plans`, { headers }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch(`${API_BASE}/customers`, { headers }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch(`${API_BASE}/discounts`, { headers }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch(`${API_BASE}/quotation-templates`, { headers }).then((r) => r.json()).catch(() => ({ data: [] }))
      ]);

      if (repRes?.data) setReport(repRes.data);
      if (schedRes?.data) setScheduler(schedRes.data);
      if (quotesRes?.data) setQuotations(quotesRes.data);
      if (subsRes?.data) setSubscriptions(subsRes.data);
      if (invsRes?.data) setInvoices(invsRes.data);
      if (discRes?.data) setDiscounts(discRes.data);
      if (tplRes?.data) {
        setQuotationTemplates(tplRes.data);
        if (tplRes.data[0]) {
          setSelectedTemplate(tplRes.data[0].id);
        }
      }
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

  const handleCreateDiscount = async () => {
    if (!discountCode || !discountValue) {
      showToast('Discount code and value are required');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/discounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: discountCode.toUpperCase(),
          discountType,
          value: discountValue,
          targetType: 'SUBSCRIPTION',
          minQuantity: parseInt(discountMinQty) || 1,
          minPurchaseAmount: discountMinSpend,
          maxUses: parseInt(discountMaxUses) || 50,
          timesUsed: 0
        })
      });
      const data = await res.json();
      if (data.data) {
        showToast(`Discount rule ${data.data.code} created`);
        setShowDiscountModal(false);
        setDiscountCode('');
        loadData();
      }
    } catch (e) {
      showToast('Failed to create discount');
    }
  };

  const handleCreateStaff = async () => {
    if (!staffEmail || !staffPassword) {
      showToast('Email and password are required');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentRole
        },
        body: JSON.stringify({
          email: staffEmail,
          password: staffPassword,
          name: staffName || staffEmail.split('@')[0]
        })
      });
      const data = await res.json();
      if (res.status === 403) {
        showToast('Forbidden: Only admins can provision staff');
        return;
      }
      if (data.data) {
        showToast(`Staff member ${data.data.email} provisioned`);
        setShowStaffModal(false);
        setStaffEmail('');
        setStaffName('');
        loadData();
      } else if (data.error) {
        showToast(data.error.message || 'Staff provisioning failed');
      }
    } catch (e) {
      showToast('Staff provisioning failed');
    }
  };

  const handleUpdateInvoiceStatus = async (invoiceId: string, nextStatus: string) => {
    try {
      await fetch(`${API_BASE}/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      showToast(`Invoice updated to ${nextStatus}`);
      loadData();
    } catch (e) {
      showToast('Invoice status update failed');
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
          validityDays: validityDays || 30,
          templateId: selectedTemplate || undefined,
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
                  const newRole = e.target.value as 'admin' | 'staff' | 'customer';
                  setCurrentRole(newRole);
                  if (newRole === 'admin') {
                    const u = { id: 'admin-1', email: 'admin@brightloop.com', name: 'Alice Cooper (Admin & Finance Lead)', role: 'admin' as const };
                    setCurrentUser(u);
                    localStorage.setItem('brightloop_user', JSON.stringify(u));
                    setActiveTab('dashboard');
                    showToast('Switched to Administrator Persona');
                  } else if (newRole === 'staff') {
                    const u = { id: 'staff-1', email: 'staff@brightloop.com', name: 'Bob Miller (Sales & Billing Staff)', role: 'staff' as const };
                    setCurrentUser(u);
                    localStorage.setItem('brightloop_user', JSON.stringify(u));
                    setActiveTab('quotations');
                    showToast('Switched to Sales & Billing Staff Persona');
                  } else {
                    const u = { id: 'cust-1', email: 'sarah@shopflow.com', name: 'Sarah Jenkins (ShopFlow E-Commerce)', role: 'customer' as const };
                    setCurrentUser(u);
                    localStorage.setItem('brightloop_user', JSON.stringify(u));
                    setActiveTab('portal');
                    showToast('Switched to Customer Persona');
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

            {/* User Session / Email Login Pill */}
            {currentUser ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  backgroundColor: 'var(--bg-panel-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '0 0.5rem',
                  height: '1.75rem',
                  fontSize: '0.75rem'
                }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--brand-orange)' }} />
                <span
                  style={{
                    maxWidth: '130px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: 500,
                    color: 'var(--text-primary)'
                  }}
                  title={currentUser.email}
                >
                  {currentUser.email}
                </span>
                <button
                  onClick={() => {
                    setAuthMode('signin');
                    setShowAuthModal(true);
                  }}
                  title="Switch User / Account"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Users size={11} />
                </button>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <LogOut size={11} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('signin');
                  setShowAuthModal(true);
                }}
                className="btn btn-primary"
                style={{ height: '1.75rem', padding: '0 0.625rem', fontSize: '0.75rem' }}
              >
                <LogIn size={11} style={{ marginRight: '0.25rem' }} />
                Sign In
              </button>
            )}
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
          {/* Role-Specific Segmented Navigation Tabs */}
          <nav className="nav-segmented">
            {currentRole === 'admin' && (
              <button
                className={`nav-tab-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard size={12} />
                <span>Executive Telemetry</span>
              </button>
            )}

            {(currentRole === 'admin' || currentRole === 'staff') && (
              <>
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
              </>
            )}

            {currentRole === 'admin' && (
              <button
                className={`nav-tab-item ${activeTab === 'discounts' ? 'active' : ''}`}
                onClick={() => setActiveTab('discounts')}
              >
                <Percent size={12} />
                <span>Discounts & Rules</span>
              </button>
            )}

            {(currentRole === 'admin' || currentRole === 'staff') && (
              <button
                className={`nav-tab-item ${activeTab === 'catalog' ? 'active' : ''}`}
                onClick={() => setActiveTab('catalog')}
              >
                <Package size={12} />
                <span>Catalog</span>
              </button>
            )}

            {(currentRole === 'admin' || currentRole === 'customer') && (
              <button
                className={`nav-tab-item ${activeTab === 'portal' ? 'active' : ''}`}
                onClick={() => setActiveTab('portal')}
              >
                <Users size={12} />
                <span>Customer Portal</span>
              </button>
            )}

            <button
              className={`nav-tab-item ${activeTab === 'landing' ? 'active' : ''}`}
              onClick={() => setActiveTab('landing')}
            >
              <Sparkles size={12} color="var(--brand-orange)" />
              <span>Personas & Scenarios</span>
            </button>
          </nav>

          {/* Right Role-Aware Contextual Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {currentRole === 'admin' && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setShowStaffModal(true)}
                title="Admin only: Provision authorized sales representative or billing staff (Scene 1)"
              >
                <UserPlus size={11} />
                <span>Provision Staff</span>
              </button>
            )}

            {(currentRole === 'admin' || currentRole === 'staff') && (
              <>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowQuoteModal(true)}
                  title="Prepare offer starting from quotation template (Scene 3)"
                >
                  <Plus size={11} />
                  <span>New Quote</span>
                </button>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleTriggerBilling}
                  disabled={billingLoading}
                  title="Run automated recurring billing scan on due subscriptions (Scene 4)"
                >
                  <Play size={11} />
                  <span>{billingLoading ? 'Processing...' : 'Run Billing Scan'}</span>
                </button>
              </>
            )}

            {currentRole === 'customer' && (
              <button
                className="btn btn-outline btn-sm"
                onClick={loadData}
                disabled={loading}
              >
                <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
                <span>Sync Account</span>
              </button>
            )}
          </div>
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
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
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
                                  <button
                                    onClick={() => handleSendInvoiceEmail(inv.id)}
                                    className="btn-icon-circle"
                                    title="Dispatch Invoice Email via Resend"
                                    style={{ width: '22px', height: '22px' }}
                                  >
                                    <Mail size={10} color="var(--brand-orange)" />
                                  </button>
                                </div>
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
        {/* ========================================================================= */}
        {/* TAB 4: INVOICES & PAYMENTS (SCENES 4 & 6) */}
        {/* ========================================================================= */}
        {activeTab === 'invoices' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Context Header */}
            <div className="instrument-panel" style={{ padding: '0.75rem 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Invoices & Payments</h2>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                    Scene 4: Billing Day recurring scan with automated tax calculations. Confirm, cancel, email via Resend, and print.
                    Scene 6: Record payments with method, amount, date, and notes.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {/* Filter Pills */}
                  <div style={{ display: 'flex', backgroundColor: 'var(--bg-well)', borderRadius: 'var(--radius-xs)', padding: '2px', border: '1px solid var(--border-subtle)' }}>
                    <button
                      onClick={() => setInvoiceFilter('all')}
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        border: 'none',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: invoiceFilter === 'all' ? 'var(--bg-panel-elevated)' : 'transparent',
                        color: invoiceFilter === 'all' ? 'var(--text-primary)' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      All ({invoices.length})
                    </button>
                    <button
                      onClick={() => setInvoiceFilter('unpaid')}
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        border: 'none',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: invoiceFilter === 'unpaid' ? 'var(--bg-panel-elevated)' : 'transparent',
                        color: invoiceFilter === 'unpaid' ? 'var(--brand-orange)' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      Unpaid ({invoices.filter((i) => i.status !== 'PAID').length})
                    </button>
                    <button
                      onClick={() => setInvoiceFilter('overdue')}
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        border: 'none',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: invoiceFilter === 'overdue' ? 'var(--bg-panel-elevated)' : 'transparent',
                        color: invoiceFilter === 'overdue' ? 'var(--status-danger)' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      Overdue ({overdueInvoices.length})
                    </button>
                  </div>

                  <button className="btn btn-primary btn-sm" onClick={handleTriggerBilling} disabled={billingLoading}>
                    <Play size={11} />
                    <span>{billingLoading ? 'Scanning...' : 'Run Billing Scan'}</span>
                  </button>
                </div>
              </div>
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
                    <th style={{ textAlign: 'center' }}>Dispatch</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={11} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                        No invoices generated yet. Click "Run Billing Scan" to process active subscriptions.
                      </td>
                    </tr>
                  ) : (
                    invoices
                      .filter((inv) => {
                        if (invoiceFilter === 'unpaid') return inv.status !== 'PAID';
                        if (invoiceFilter === 'overdue') return inv.isOverdue || (inv.status !== 'PAID' && new Date(inv.dueDate) < new Date());
                        return true;
                      })
                      .map((inv) => {
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
                              <span className={`status-signal ${isPaid ? 'signal-active' : inv.isOverdue ? 'signal-danger' : inv.status === 'CONFIRMED' ? 'signal-active' : 'signal-orange'}`}>
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
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <button
                                  className="btn-icon-circle"
                                  title="Send invoice email to customer via Resend"
                                  onClick={() => handleSendInvoiceEmail(inv.id)}
                                  style={{ width: '24px', height: '24px' }}
                                >
                                  <Mail size={11} color="var(--brand-orange)" />
                                </button>
                                <a
                                  href={`${API_BASE}/invoices/${inv.id}/pdf`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn-icon-circle"
                                  title="Print / Download PDF"
                                  style={{ width: '24px', height: '24px' }}
                                >
                                  <Download size={11} />
                                </a>
                              </div>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                {inv.status === 'DRAFT' && (
                                  <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => handleUpdateInvoiceStatus(inv.id, 'CONFIRMED')}
                                    title="Confirm draft invoice"
                                    style={{ fontSize: '0.6875rem', padding: '0.2rem 0.4rem' }}
                                  >
                                    <Check size={10} />
                                    <span>Confirm</span>
                                  </button>
                                )}
                                {!isPaid && inv.status !== 'CANCELLED' && (
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                      setSelectedInvoice(inv);
                                      setPaymentAmount(outstanding.toFixed(2));
                                      setShowPaymentModal(true);
                                    }}
                                    title="Record customer payment against invoice"
                                    style={{ fontSize: '0.6875rem', padding: '0.2rem 0.4rem' }}
                                  >
                                    <CreditCard size={10} />
                                    <span>Record Pay</span>
                                  </button>
                                )}
                                {isPaid && (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--status-success)', fontWeight: 600 }}>Settled</span>
                                )}
                              </div>
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
        {/* TAB 5: DISCOUNTS & PRICING RULES (SCENE 5: A CUSTOMER ASKS FOR A BETTER PRICE) */}
        {/* ========================================================================= */}
        {activeTab === 'discounts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="instrument-panel" style={{ padding: '0.875rem 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Discounts & Pricing Rules (Scene 5)</h2>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                    Only administrators can create discount rules: fixed amount or percentage, with minimum seats or spend thresholds,
                    and usage caps. Discounts automatically apply during automated billing day scans.
                  </p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowDiscountModal(true)}>
                  <Plus size={11} />
                  <span>Create Discount Rule</span>
                </button>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="table-industrial">
                <thead>
                  <tr>
                    <th>Rule Code</th>
                    <th>Type</th>
                    <th>Discount Value</th>
                    <th>Target Scope</th>
                    <th>Min Seats / Spend</th>
                    <th>Usage Counter</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                        No discount rules configured. Click "Create Discount Rule" to set up volume tiers or promotions.
                      </td>
                    </tr>
                  ) : (
                    discounts.map((d) => (
                      <tr key={d.id}>
                        <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--brand-orange)' }}>
                          {d.code}
                        </td>
                        <td>
                          <span className="status-signal">
                            {d.discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          {d.discountType === 'PERCENTAGE'
                            ? `${(parseFloat(d.value) * 100).toFixed(0)}% OFF`
                            : `$${parseFloat(d.value).toFixed(2)} OFF`}
                        </td>
                        <td>{d.targetType === 'SUBSCRIPTION' ? 'Whole Subscription' : 'Product Lines'}</td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Min {d.minQuantity || 1} seats • ${parseFloat(d.minPurchaseAmount || '0').toFixed(2)} min spend
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                          {d.timesUsed || 0} / {d.maxUses ? `${d.maxUses} uses` : 'Unlimited'}
                        </td>
                        <td>
                          <span className="status-signal signal-active">
                            <span>ACTIVE</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
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
        {/* ========================================================================= */}
        {/* TAB 7: PERSONAS & SCENARIOS HUB (LANDING PAGE) */}
        {/* ========================================================================= */}
        {activeTab === 'landing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Hero / System Overview */}
            <div className="instrument-panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.2rem 0.5rem', backgroundColor: 'var(--bg-well)', borderRadius: 'var(--radius-xs)', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--brand-orange)', marginBottom: '0.5rem' }}>
                    <Sparkles size={11} />
                    <span>HACKATHON SCENARIO HUB & ROLE QUICK-ACCESS</span>
                  </div>
                  <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                    Brightloop Subscription Management Engine
                  </h1>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0 0', maxWidth: '780px', lineHeight: 1.5 }}>
                    Test and verify all 7 real-world business scenarios from the hackathon problem statement. Switch between organizational personas below to experience role-tailored workflows.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => { setAuthMode('signin'); setShowAuthModal(true); }}
                  >
                    <LogIn size={11} />
                    <span>Sign In Dialog</span>
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                  >
                    <Mail size={11} />
                    <span>Sign Up (Temp Mail)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Persona Quick Switcher Cards */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                1. Select Organizational Persona (Instant Switch)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.75rem' }}>
                {/* Persona 1: Admin */}
                <div
                  className="instrument-panel"
                  style={{
                    padding: '1rem',
                    border: currentRole === 'admin' ? '1.5px solid var(--brand-orange)' : '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="status-signal signal-orange">
                        <span>ADMIN / FINANCE LEAD</span>
                      </span>
                      {currentRole === 'admin' && (
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--brand-orange)' }}>
                          ACTIVE PERSONA
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginTop: '0.5rem' }}>
                      Alice Cooper (Finance Lead)
                    </h3>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      admin@brightloop.com • Unified Pass: Brightloop@2026
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.4 }}>
                      Scene 7: Month-end executive telemetry, MRR, AR overdue chasing. Scene 5: Configures discount rules. Scene 1: Provisions staff members.
                    </p>
                  </div>
                  <button
                    className={`btn ${currentRole === 'admin' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                    onClick={() => {
                      const u = { id: 'admin-1', email: 'admin@brightloop.com', name: 'Alice Cooper (Admin & Finance Lead)', role: 'admin' as const };
                      setCurrentRole('admin');
                      setCurrentUser(u);
                      localStorage.setItem('brightloop_user', JSON.stringify(u));
                      setActiveTab('dashboard');
                      showToast('Switched to Alice Cooper (Admin / Finance Lead)');
                    }}
                  >
                    <span>{currentRole === 'admin' ? 'Open Finance Dashboard' : 'Switch to Admin Persona'}</span>
                    <ArrowRight size={11} />
                  </button>
                </div>

                {/* Persona 2: Staff */}
                <div
                  className="instrument-panel"
                  style={{
                    padding: '1rem',
                    border: currentRole === 'staff' ? '1.5px solid var(--brand-orange)' : '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="status-signal signal-active">
                        <span>STAFF / SALES REP</span>
                      </span>
                      {currentRole === 'staff' && (
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--brand-orange)' }}>
                          ACTIVE PERSONA
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginTop: '0.5rem' }}>
                      Bob Miller (Sales & Billing Ops)
                    </h3>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      staff@brightloop.com • Unified Pass: Brightloop@2026
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.4 }}>
                      Scene 3: Prepares offers from quotation templates, 1-click convert to subscription. Scene 4: Confirms & emails invoices. Scene 6: Records customer payments.
                    </p>
                  </div>
                  <button
                    className={`btn ${currentRole === 'staff' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                    onClick={() => {
                      const u = { id: 'staff-1', email: 'staff@brightloop.com', name: 'Bob Miller (Sales & Billing Staff)', role: 'staff' as const };
                      setCurrentRole('staff');
                      setCurrentUser(u);
                      localStorage.setItem('brightloop_user', JSON.stringify(u));
                      setActiveTab('quotations');
                      showToast('Switched to Bob Miller (Sales & Billing Staff)');
                    }}
                  >
                    <span>{currentRole === 'staff' ? 'Open Quotations Workflow' : 'Switch to Staff Persona'}</span>
                    <ArrowRight size={11} />
                  </button>
                </div>

                {/* Persona 3: Customer */}
                <div
                  className="instrument-panel"
                  style={{
                    padding: '1rem',
                    border: currentRole === 'customer' ? '1.5px solid var(--brand-orange)' : '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="status-signal">
                        <span>CUSTOMER PORTAL</span>
                      </span>
                      {currentRole === 'customer' && (
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--brand-orange)' }}>
                          ACTIVE PERSONA
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginTop: '0.5rem' }}>
                      Sarah Jenkins (ShopFlow E-Commerce)
                    </h3>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      sarah@shopflow.com • Unified Pass: Brightloop@2026
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.4 }}>
                      Customer Self-Service: Inspects active subscription status, pauses/resumes service, views invoice statements, downloads official PDFs, and pays balances.
                    </p>
                  </div>
                  <button
                    className={`btn ${currentRole === 'customer' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                    onClick={() => {
                      const u = { id: 'cust-1', email: 'sarah@shopflow.com', name: 'Sarah Jenkins (ShopFlow E-Commerce)', role: 'customer' as const };
                      setCurrentRole('customer');
                      setCurrentUser(u);
                      localStorage.setItem('brightloop_user', JSON.stringify(u));
                      setActiveTab('portal');
                      showToast('Switched to Sarah Jenkins (Customer Portal)');
                    }}
                  >
                    <span>{currentRole === 'customer' ? 'Open Customer Portal' : 'Switch to Customer Persona'}</span>
                    <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            </div>

            {/* The 5 Key Business Scenarios from the Prompt */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                2. Problem Statement Scenarios & Step-by-Step Executions
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                {/* Scene 3 Card */}
                <div className="instrument-panel" style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--brand-orange)', textTransform: 'uppercase' }}>
                      Scene 3
                    </div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: '0.2rem 0' }}>
                      Turning a Quote into a Subscription
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                      Sales rep prepares an offer starting from a quotation template. Stays valid for set days, with lines showing product, qty, unit price, taxes, and amount. Converts to Active subscription in 1 click without manual re-entry.
                    </p>
                  </div>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      if (currentRole === 'customer') setCurrentRole('staff');
                      setActiveTab('quotations');
                    }}
                  >
                    <span>Execute Quotation Flow</span>
                    <ArrowRight size={11} />
                  </button>
                </div>

                {/* Scene 4 Card */}
                <div className="instrument-panel" style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--brand-orange)', textTransform: 'uppercase' }}>
                      Scene 4
                    </div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: '0.2rem 0' }}>
                      Billing Day & Automated Invoicing
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                      Hundreds of subscriptions are due at once. Automated batch scanner creates invoices from subscriptions with taxes and customer lines calculated automatically. Confirm, cancel, email via Resend, and print.
                    </p>
                  </div>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      if (currentRole === 'customer') setCurrentRole('staff');
                      setActiveTab('invoices');
                    }}
                  >
                    <span>Run Billing Day Flow</span>
                    <ArrowRight size={11} />
                  </button>
                </div>

                {/* Scene 5 Card */}
                <div className="instrument-panel" style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--brand-orange)', textTransform: 'uppercase' }}>
                      Scene 5
                    </div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: '0.2rem 0' }}>
                      A Customer Asks for a Better Price
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                      Customer wants a discount for taking more seats. Admin creates discount rules: fixed or percentage, min seats, spend, and usage caps. Rule appears on the next billing invoice on its own.
                    </p>
                  </div>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setCurrentRole('admin');
                      setActiveTab('discounts');
                    }}
                  >
                    <span>Manage Discount Rules</span>
                    <ArrowRight size={11} />
                  </button>
                </div>

                {/* Scene 6 Card */}
                <div className="instrument-panel" style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--brand-orange)', textTransform: 'uppercase' }}>
                      Scene 6
                    </div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: '0.2rem 0' }}>
                      The Money Comes In
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                      Payments arrive by Wire, Card, Check. Each is recorded with method, amount, date, and reference note against the invoice. Immediate visibility of paid vs overdue invoices.
                    </p>
                  </div>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      if (currentRole === 'customer') setCurrentRole('staff');
                      setActiveTab('invoices');
                    }}
                  >
                    <span>Record & Track Payments</span>
                    <ArrowRight size={11} />
                  </button>
                </div>

                {/* Scene 7 Card */}
                <div className="instrument-panel" style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--brand-orange)', textTransform: 'uppercase' }}>
                      Scene 7
                    </div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: '0.2rem 0' }}>
                      The Finance Lead at Month End
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                      One place to see active subscriptions, MRR, cash collected, and overdue AR. Filterable summary table with sub-10ms response time (well within the &lt;2 second benchmark).
                    </p>
                  </div>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setCurrentRole('admin');
                      setActiveTab('dashboard');
                    }}
                  >
                    <span>Open Finance Telemetry</span>
                    <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: CREATE QUOTATION (SCENE 3) */}
      {showQuoteModal && (
        <div className="dialog-backdrop">
          <div className="dialog-panel" style={{ maxWidth: '480px' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>New Quotation (Scene 3)</h3>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                  Prepare offer starting from a template with pre-filled lines and validity days.
                </p>
              </div>
              <button className="btn-icon-circle" onClick={() => setShowQuoteModal(false)}>✕</button>
            </div>

            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Quotation Template (Scene 3)
                </label>
                <select
                  className="input-field"
                  value={selectedTemplate}
                  onChange={(e) => {
                    setSelectedTemplate(e.target.value);
                    const tpl = quotationTemplates.find((t) => t.id === e.target.value);
                    if (tpl) {
                      if (tpl.defaultPlanId) setSelectedPlan(tpl.defaultPlanId);
                      if (tpl.validityDays) setValidityDays(tpl.validityDays);
                    }
                  }}
                >
                  <option value="">Custom Quotation (No Template)</option>
                  {quotationTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.validityDays || 30} days validity)
                    </option>
                  ))}
                </select>
              </div>

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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
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
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Validity (Days)</label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    className="input-field"
                    value={validityDays}
                    onChange={(e) => setValidityDays(parseInt(e.target.value) || 30)}
                  />
                </div>
              </div>

              {/* Real-time Line Item Calculation Summary */}
              {(() => {
                const prod = products.find((p) => p.id === selectedProduct);
                const variant = prod?.variants?.find((v: any) => v.id === selectedVariant);
                let basePrice = parseFloat(prod?.salesPrice || '1000');
                if (variant) basePrice += parseFloat(variant.priceAdjustment || '0');
                const lineSubtotal = basePrice * (quantity || 1);
                const lineTax = lineSubtotal * 0.1;
                const lineTotal = lineSubtotal + lineTax;

                const expDate = new Date();
                expDate.setDate(expDate.getDate() + (validityDays || 30));

                return (
                  <div style={{ backgroundColor: 'var(--bg-well)', padding: '0.625rem', borderRadius: 'var(--radius-xs)', fontSize: '0.75rem', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Calculated Expiry Date:</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{expDate.toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Effective Unit Price:</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>${basePrice.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Subtotal ({quantity || 1} seats):</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>${lineSubtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Tax (10% Automated Rule):</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>${lineTax.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.25rem', borderTop: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontWeight: 600 }}>Quotation Amount:</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--brand-orange)' }}>
                        ${lineTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setShowQuoteModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleCreateQuote} disabled={loading}>
                {loading ? 'Creating...' : 'Create Quotation'}
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

      {/* MODAL: CREATE DISCOUNT RULE (SCENE 5: A CUSTOMER ASKS FOR A BETTER PRICE) */}
      {showDiscountModal && (
        <div className="dialog-backdrop">
          <div className="dialog-panel" style={{ maxWidth: '480px' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>Create Discount Rule (Scene 5)</h3>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                  Admin only. Rule automatically applies to invoices when criteria are met.
                </p>
              </div>
              <button className="btn-icon-circle" onClick={() => setShowDiscountModal(false)}>✕</button>
            </div>

            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Discount Code</label>
                <input
                  type="text"
                  placeholder="e.g. ENTERPRISE25 or VOLUME10"
                  className="input-field"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Discount Type</label>
                  <select
                    className="input-field"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    {discountType === 'PERCENTAGE' ? 'Rate (e.g. 0.20 for 20%)' : 'Dollar Amount ($)'}
                  </label>
                  <input
                    type="number"
                    step={discountType === 'PERCENTAGE' ? '0.01' : '1'}
                    className="input-field"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Min Seats / Quantity</label>
                  <input
                    type="number"
                    min={1}
                    className="input-field"
                    value={discountMinQty}
                    onChange={(e) => setDiscountMinQty(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Min Spend ($)</label>
                  <input
                    type="number"
                    min={0}
                    step="50"
                    className="input-field"
                    value={discountMinSpend}
                    onChange={(e) => setDiscountMinSpend(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Max Usage Cap (Times)</label>
                <input
                  type="number"
                  min={1}
                  className="input-field"
                  value={discountMaxUses}
                  onChange={(e) => setDiscountMaxUses(e.target.value)}
                />
              </div>
            </div>

            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setShowDiscountModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleCreateDiscount}>
                Create Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PROVISION STAFF MEMBER (SCENE 1: STAFF PROVISIONING) */}
      {showStaffModal && (
        <div className="dialog-backdrop">
          <div className="dialog-panel" style={{ maxWidth: '440px' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>Provision Staff Member (Scene 1)</h3>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                  Admin only. Authorized role for sales & billing operations.
                </p>
              </div>
              <button className="btn-icon-circle" onClick={() => setShowStaffModal(false)}>✕</button>
            </div>

            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bob Miller"
                  className="input-field"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Staff Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. staff2@brightloop.com"
                  className="input-field"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Temporary Password</label>
                <input
                  type="password"
                  className="input-field"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                />
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Default unified demo password: <code style={{ color: 'var(--brand-orange)' }}>Brightloop@2026</code>
                </span>
              </div>
            </div>

            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setShowStaffModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleCreateStaff}>
                Provision Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AUTHENTICATION & RESEND EMAIL SETUP */}
      {showAuthModal && (
        <div className="dialog-backdrop">
          <div className="dialog-panel" style={{ maxWidth: '480px' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>
                  {authMode === 'signin' && 'Sign In to Brightloop'}
                  {authMode === 'signup' && 'Create Account (Any / Temp Email)'}
                  {authMode === 'forgot' && 'Reset Password'}
                  {authMode === 'resend_info' && 'Resend Email Service Setup'}
                </h3>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: '0.125rem 0 0 0' }}>
                  Industrial Precision Subscription Management Platform
                </p>
              </div>
              <button className="btn-icon-circle" onClick={() => setShowAuthModal(false)}>✕</button>
            </div>

            {/* Mode Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-well)' }}>
              <button
                onClick={() => { setAuthMode('signin'); setAuthError(null); }}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: 'none',
                  background: authMode === 'signin' ? 'var(--bg-panel-elevated)' : 'transparent',
                  color: authMode === 'signin' ? 'var(--brand-orange)' : 'var(--text-muted)',
                  borderBottom: authMode === 'signin' ? '2px solid var(--brand-orange)' : '2px solid transparent',
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: 'none',
                  background: authMode === 'signup' ? 'var(--bg-panel-elevated)' : 'transparent',
                  color: authMode === 'signup' ? 'var(--brand-orange)' : 'var(--text-muted)',
                  borderBottom: authMode === 'signup' ? '2px solid var(--brand-orange)' : '2px solid transparent',
                  cursor: 'pointer'
                }}
              >
                Sign Up (Temp Mail)
              </button>
              <button
                onClick={() => { setAuthMode('resend_info'); setAuthError(null); }}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: 'none',
                  background: authMode === 'resend_info' ? 'var(--bg-panel-elevated)' : 'transparent',
                  color: authMode === 'resend_info' ? 'var(--brand-orange)' : 'var(--text-muted)',
                  borderBottom: authMode === 'resend_info' ? '2px solid var(--brand-orange)' : '2px solid transparent',
                  cursor: 'pointer'
                }}
              >
                Resend Config
              </button>
            </div>

            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {authError && (
                <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--status-danger)', borderRadius: 'var(--radius-xs)', color: 'var(--status-danger)', fontSize: '0.75rem' }}>
                  {authError}
                </div>
              )}

              {authMode === 'signin' && (
                <>
                  {/* Quick-fill Seed Accounts for Evaluators */}
                  <div style={{ backgroundColor: 'var(--bg-well)', padding: '0.625rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      1-Click Evaluator Demo Sign-In
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.375rem' }}>
                      <button
                        type="button"
                        onClick={() => handleSignIn('admin@brightloop.com', 'Brightloop@2026')}
                        className="btn btn-outline"
                        style={{ fontSize: '0.6875rem', padding: '0.25rem 0.375rem', textAlign: 'center' }}
                      >
                        Admin
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSignIn('staff@brightloop.com', 'Brightloop@2026')}
                        className="btn btn-outline"
                        style={{ fontSize: '0.6875rem', padding: '0.25rem 0.375rem', textAlign: 'center' }}
                      >
                        Staff
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSignIn('sarah@shopflow.com', 'Brightloop@2026')}
                        className="btn btn-outline"
                        style={{ fontSize: '0.6875rem', padding: '0.25rem 0.375rem', textAlign: 'center' }}
                      >
                        Customer
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="e.g. admin@brightloop.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Password
                    </label>
                    <input
                      type="password"
                      className="input-field"
                      placeholder="Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        Unified seed password: <code style={{ color: 'var(--brand-orange)' }}>Brightloop@2026</code>
                      </span>
                      <button
                        type="button"
                        onClick={() => { setAuthMode('forgot'); setAuthError(null); setForgotEmail(loginEmail); }}
                        style={{ background: 'none', border: 'none', color: 'var(--brand-orange)', fontSize: '0.6875rem', cursor: 'pointer', padding: 0 }}
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={() => handleSignIn()}
                    disabled={authLoading}
                    style={{ width: '100%', marginTop: '0.25rem' }}
                  >
                    {authLoading ? 'Signing In...' : 'Sign In'}
                  </button>
                </>
              )}

              {authMode === 'signup' && (
                <>
                  <div style={{ backgroundColor: 'var(--bg-well)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                    Works with any temporary email service (e.g. 10minutemail, temp-mail.org). A welcome email will be dispatched via Resend.
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Contact Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="input-field"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Company Name</label>
                      <input
                        type="text"
                        placeholder="Acme Corp"
                        className="input-field"
                        value={signupCompany}
                        onChange={(e) => setSignupCompany(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Email Address (or Temporary Email)</label>
                    <input
                      type="email"
                      placeholder="e.g. tempuser123@mailinator.com"
                      className="input-field"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Password</label>
                    <input
                      type="password"
                      placeholder="e.g. Brightloop@2026"
                      className="input-field"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                    />
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                      Must be &gt;8 characters with uppercase, lowercase, and special character.
                    </span>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={handleSignUp}
                    disabled={authLoading}
                    style={{ width: '100%', marginTop: '0.25rem' }}
                  >
                    {authLoading ? 'Creating Account...' : 'Create Account & Enter Portal'}
                  </button>
                </>
              )}

              {authMode === 'forgot' && (
                <>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Enter your registered email address. A password reset link will be dispatched via Resend.
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Email Address</label>
                    <input
                      type="email"
                      placeholder="admin@brightloop.com"
                      className="input-field"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={handleForgotPassword}
                    disabled={authLoading}
                    style={{ width: '100%' }}
                  >
                    {authLoading ? 'Dispatching...' : 'Dispatch Reset Email via Resend'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setAuthMode('signin'); setAuthError(null); }}
                    className="btn btn-outline"
                    style={{ width: '100%' }}
                  >
                    Back to Sign In
                  </button>
                </>
              )}

              {authMode === 'resend_info' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: 'var(--bg-well)', padding: '0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                      Where to add your Resend API Key:
                    </div>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>
                      Open the root <code>.env</code> file in the repository and set your API key:
                    </p>
                    <pre style={{ margin: 0, padding: '0.5rem', backgroundColor: 'var(--bg-panel-elevated)', borderRadius: 'var(--radius-xs)', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', border: '1px solid var(--border-subtle)', overflowX: 'auto' }}>
                      RESEND_API_KEY=re_your_api_key_here<br />
                      RESEND_FROM_EMAIL=onboarding@resend.dev
                    </pre>
                  </div>

                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <strong>Email Delivery Modes:</strong><br />
                    • <strong>Live Mode:</strong> When <code>RESEND_API_KEY</code> is set, welcome emails, invoice dispatch notifications, and password resets are sent to real inboxes.<br />
                    • <strong>Safe Simulation Mode:</strong> When no key is set, emails are safely logged to the backend API console in real time without throwing errors.
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      showToast('Dispatching test password reset email to admin@brightloop.com...');
                      await fetch(`${API_BASE}/auth/forgot-password`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: 'admin@brightloop.com' })
                      });
                      showToast('Test email dispatched! Check backend terminal or Resend dashboard.');
                    }}
                    className="btn btn-outline"
                    style={{ width: '100%', fontSize: '0.75rem' }}
                  >
                    <Send size={11} style={{ marginRight: '0.375rem' }} />
                    Send Test Email to admin@brightloop.com
                  </button>
                </div>
              )}
            </div>

            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setShowAuthModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
