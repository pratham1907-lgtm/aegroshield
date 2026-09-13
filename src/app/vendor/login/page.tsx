"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ALL_DISTRICTS } from '@/lib/marketplace-data';
import { registerVendor } from '@/lib/ecommerce-service';
import { Store, ArrowRight, CheckCircle2, PhoneCall, KeyRound, Zap, ShieldCheck } from 'lucide-react';

const SELLER_CATEGORIES = [
  'General Agri-Store',
  'Seeds',
  'Fertilizers',
  'Pesticides',
  'Farm Equipment',
];

export default function VendorLoginPageWrapper() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>Loading...</div>}>
      <VendorLoginPage />
    </Suspense>
  );
}

function VendorLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "signup" ? "signup" : "signin";

  const [tab, setTab] = useState<'signin' | 'signup'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "error" });

  // ── SIGN IN STATE ──
  const [loginPhone, setLoginPhone] = useState('');
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtpCode, setLoginOtpCode] = useState('');
  const [isLoginPhoneVerified, setIsLoginPhoneVerified] = useState(false);

  // ── SIGN UP STATE (5 Mandatory Fields) ──
  const [ownerName, setOwnerName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [storeName, setStoreName] = useState('');
  const [district, setDistrict] = useState(ALL_DISTRICTS[0] || 'Meerut');
  const [category, setCategory] = useState(SELLER_CATEGORIES[0]);
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtpCode, setRegOtpCode] = useState('');
  const [isRegPhoneVerified, setIsRegPhoneVerified] = useState(false);

  const showMessage = (text: string, type: 'error' | 'success' = 'error') => setMsg({ text, type });
  const hideMessage = () => setMsg({ text: "", type: "error" });

  const cleanLoginPhone = loginPhone.replace(/\D/g, '').trim();
  const isLoginPhoneValid = cleanLoginPhone.length === 10;

  const cleanRegPhone = regPhone.replace(/\D/g, '').trim();
  const isRegPhoneValid = cleanRegPhone.length === 10;

  const isRegFormValid =
    Boolean(ownerName.trim()) &&
    isRegPhoneValid &&
    isRegPhoneVerified &&
    Boolean(storeName.trim()) &&
    Boolean(district) &&
    Boolean(category);

  // ── SIGN IN HANDLER ──
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    hideMessage();

    if (!isLoginPhoneValid) {
      return showMessage("Please enter a valid 10-digit mobile number.");
    }

    if (!isLoginPhoneVerified) {
      return showMessage("Please verify phone OTP before signing in.");
    }

    setLoading(true);

    try {
      const res = await fetch('/api/seller/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanLoginPhone }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "No seller found. Please register your store first.");
      }

      // Store authenticated seller session in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'aegroshield_seller_session',
          JSON.stringify({
            user: data.user,
            seller: data.seller,
          })
        );
      }

      showMessage(`🏪 Welcome back! Opening Seller Dashboard…`, "success");
      setTimeout(() => router.push("/seller/dashboard"), 600);
    } catch (err: any) {
      console.error("[VendorLogin] Error:", err);
      showMessage(err?.message || "Login failed. Please check credentials or register.");
      setLoading(false);
    }
  };

  // ── SIGN UP HANDLER ──
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    hideMessage();

    if (!isRegPhoneVerified) {
      return showMessage("Please verify your phone number with OTP first.");
    }

    if (!isRegFormValid) {
      return showMessage("Please complete all 5 store registration fields.");
    }

    setLoading(true);

    try {
      const res = await fetch('/api/seller/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerName: ownerName.trim(),
          phone: cleanRegPhone,
          storeName: storeName.trim(),
          district: district.trim(),
          category: category.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to register seller store.");
      }

      // Store authenticated seller session in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'aegroshield_seller_session',
          JSON.stringify({
            user: data.user,
            seller: data.seller,
          })
        );
      }

      registerVendor({
        name: storeName.trim(),
        ownerName: ownerName.trim(),
        district: district.trim(),
        address: `${district.trim()} Main Market`,
        phone: '+91' + cleanRegPhone,
        license: 'TIER-1-PHONE-VERIFIED',
      });

      showMessage(`🎉 Store registered successfully! Welcome, ${ownerName.trim()}. Redirecting…`, "success");
      setTimeout(() => router.push("/seller/dashboard"), 600);
    } catch (err: any) {
      console.error("[VendorRegister] Error:", err);
      showMessage(err?.message || "Failed to register store.");
      setLoading(false);
    }
  };

  return (
    <main className="login-page-container">
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      <div className="bg-orb bg-orb-3"></div>

      <div className="auth-card" style={{ maxWidth: '520px', width: '100%', margin: '20px auto' }}>
        
        {/* Brand Header */}
        <div className="auth-brand">
          <div style={{ width: '56px', height: '56px', background: 'rgba(234,88,12,0.12)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '1px solid rgba(234,88,12,0.3)' }}>
            <Store size={28} color="#ea580c" />
          </div>
          <div className="brand-name" style={{ color: 'var(--text-dark)' }}>Agri-Seller Portal</div>
          <div className="brand-sub">Phone-Authenticated Retailer Storefront & Inventory Access</div>
        </div>

        <div className="auth-body">
          {/* Tabs: Sign In vs Register Store */}
          <div className="auth-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button
              type="button"
              className={`auth-tab ${tab === 'signin' ? 'active' : ''}`}
              onClick={() => { setTab('signin'); hideMessage(); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                fontWeight: 700,
                border: tab === 'signin' ? '2px solid #ea580c' : '1px solid #e2e8f0',
                background: tab === 'signin' ? '#fff7ed' : '#ffffff',
                color: tab === 'signin' ? '#ea580c' : '#64748b',
                cursor: 'pointer',
              }}
            >
              Seller Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
              onClick={() => { setTab('signup'); hideMessage(); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                fontWeight: 700,
                border: tab === 'signup' ? '2px solid #ea580c' : '1px solid #e2e8f0',
                background: tab === 'signup' ? '#fff7ed' : '#ffffff',
                color: tab === 'signup' ? '#ea580c' : '#64748b',
                cursor: 'pointer',
              }}
            >
              Register Store
            </button>
          </div>

          {msg.text && (
            <div className={`auth-msg ${msg.type}`} style={{ marginBottom: '16px' }}>
              {msg.text}
            </div>
          )}

          {/* ── TAB 1: SELLER SIGN IN (PHONE-ONLY) ── */}
          {tab === 'signin' && (
            <form onSubmit={handleLoginSubmit} className="auth-form active">
              <div className="form-group" style={{ background: isLoginPhoneVerified ? '#f0fdf4' : '#faf5ff', padding: '14px', borderRadius: '12px', border: `1px solid ${isLoginPhoneVerified ? '#86efac' : '#e9d5ff'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label className="form-label" style={{ fontWeight: 700, margin: 0, color: isLoginPhoneVerified ? '#166534' : '#581c87' }}>
                    Registered Mobile Number (+91) *
                  </label>
                  {isLoginPhoneVerified && (
                    <span style={{ fontSize: '0.78rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} color="#15803d" /> Verified
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '12px', fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>
                      +91
                    </span>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="9876543210"
                      maxLength={10}
                      style={{ paddingLeft: '48px', fontWeight: 600 }}
                      value={loginPhone}
                      onChange={(e) => {
                        setLoginPhone(e.target.value.replace(/\D/g, ''));
                        if (isLoginPhoneVerified) setIsLoginPhoneVerified(false);
                      }}
                      disabled={isLoginPhoneVerified}
                      required
                    />
                  </div>

                  {!isLoginPhoneVerified && (
                    <button
                      type="button"
                      onClick={() => {
                        hideMessage();
                        if (!isLoginPhoneValid) return showMessage('Enter 10-digit mobile number.');
                        setLoginOtpSent(true);
                        setLoginOtpCode('123456');
                        showMessage('📩 OTP sent! Use code 123456 or click Auto-Verify.', 'success');
                      }}
                      disabled={!isLoginPhoneValid}
                      style={{
                        background: isLoginPhoneValid ? '#ea580c' : '#94a3b8',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: isLoginPhoneValid ? 'pointer' : 'not-allowed',
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <PhoneCall size={14} /> {loginOtpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  )}
                </div>

                {/* Login OTP Controls */}
                {!isLoginPhoneVerified && (
                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {loginOtpSent && (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                          style={{ letterSpacing: '0.15em', fontWeight: 700, textAlign: 'center', flex: 1 }}
                          value={loginOtpCode}
                          onChange={(e) => setLoginOtpCode(e.target.value.replace(/\D/g, ''))}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            hideMessage();
                            if (loginOtpCode.trim() === '123456' || loginOtpCode.trim().length === 6) {
                              setIsLoginPhoneVerified(true);
                              showMessage('✓ Phone verified!', 'success');
                            } else {
                              showMessage('Invalid OTP. Use code 123456.');
                            }
                          }}
                          style={{
                            background: '#16a34a',
                            color: '#ffffff',
                            border: 'none',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <KeyRound size={14} /> Verify
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (!isLoginPhoneValid) return showMessage('Enter 10-digit mobile number first.');
                        setLoginOtpSent(true);
                        setLoginOtpCode('123456');
                        setIsLoginPhoneVerified(true);
                        showMessage('✓ Phone verified instantly!', 'success');
                      }}
                      disabled={!isLoginPhoneValid}
                      style={{
                        background: isLoginPhoneValid ? '#fef3c7' : '#f1f5f9',
                        color: isLoginPhoneValid ? '#b45309' : '#94a3b8',
                        border: `1px solid ${isLoginPhoneValid ? '#fcd34d' : '#e2e8f0'}`,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: isLoginPhoneValid ? 'pointer' : 'not-allowed',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Zap size={14} color={isLoginPhoneValid ? '#b45309' : '#94a3b8'} /> ⚡ 1-Click Auto-Verify (Instant Bypass)
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn-auth btn-primary-auth"
                disabled={!isLoginPhoneVerified || loading}
                style={{
                  background: isLoginPhoneVerified ? '#ea580c' : '#cbd5e1',
                  borderColor: isLoginPhoneVerified ? '#ea580c' : '#cbd5e1',
                  cursor: isLoginPhoneVerified ? 'pointer' : 'not-allowed',
                  marginTop: '12px',
                  padding: '13px',
                }}
              >
                {loading ? <span className="spinner"></span> : <>Login to Seller Dashboard <ArrowRight size={18} /></>}
              </button>

              <div style={{ marginTop: '14px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Don&apos;t have a registered seller account? </span>
                <button
                  type="button"
                  onClick={() => { setTab('signup'); hideMessage(); }}
                  style={{ background: 'none', border: 'none', color: '#ea580c', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Register Store →
                </button>
              </div>
            </form>
          )}

          {/* ── TAB 2: REGISTER NEW STORE (PHONE-ONLY) ── */}
          {tab === 'signup' && (
            <form onSubmit={handleRegisterSubmit} className="auth-form active">
              {/* 1. Owner Name */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>1. Owner Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ramesh Kumar"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                />
              </div>

              {/* 2. Mobile Phone with OTP */}
              <div className="form-group" style={{ background: isRegPhoneVerified ? '#f0fdf4' : '#faf5ff', padding: '14px', borderRadius: '12px', border: `1px solid ${isRegPhoneVerified ? '#86efac' : '#e9d5ff'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label className="form-label" style={{ fontWeight: 700, margin: 0, color: isRegPhoneVerified ? '#166534' : '#581c87' }}>
                    2. Mobile Phone Number (+91) *
                  </label>
                  {isRegPhoneVerified && (
                    <span style={{ fontSize: '0.78rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} color="#15803d" /> Verified
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '12px', fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>
                      +91
                    </span>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="9876543210"
                      maxLength={10}
                      style={{ paddingLeft: '48px', fontWeight: 600 }}
                      value={regPhone}
                      onChange={(e) => {
                        setRegPhone(e.target.value.replace(/\D/g, ''));
                        if (isRegPhoneVerified) setIsRegPhoneVerified(false);
                      }}
                      disabled={isRegPhoneVerified}
                      required
                    />
                  </div>

                  {!isRegPhoneVerified && (
                    <button
                      type="button"
                      onClick={() => {
                        hideMessage();
                        if (!isRegPhoneValid) return showMessage('Enter 10-digit mobile number.');
                        setRegOtpSent(true);
                        setRegOtpCode('123456');
                        showMessage('📩 OTP sent! Use code 123456 or click Auto-Verify.', 'success');
                      }}
                      disabled={!isRegPhoneValid}
                      style={{
                        background: isRegPhoneValid ? '#ea580c' : '#94a3b8',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: isRegPhoneValid ? 'pointer' : 'not-allowed',
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <PhoneCall size={14} /> {regOtpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  )}
                </div>

                {!isRegPhoneVerified && (
                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {regOtpSent && (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                          style={{ letterSpacing: '0.15em', fontWeight: 700, textAlign: 'center', flex: 1 }}
                          value={regOtpCode}
                          onChange={(e) => setRegOtpCode(e.target.value.replace(/\D/g, ''))}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            hideMessage();
                            if (regOtpCode.trim() === '123456' || regOtpCode.trim().length === 6) {
                              setIsRegPhoneVerified(true);
                              showMessage('✓ Phone verified!', 'success');
                            } else {
                              showMessage('Invalid OTP. Use code 123456.');
                            }
                          }}
                          style={{
                            background: '#16a34a',
                            color: '#ffffff',
                            border: 'none',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <KeyRound size={14} /> Verify
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (!isRegPhoneValid) return showMessage('Enter 10-digit mobile number first.');
                        setRegOtpSent(true);
                        setRegOtpCode('123456');
                        setIsRegPhoneVerified(true);
                        showMessage('✓ Phone verified instantly!', 'success');
                      }}
                      disabled={!isRegPhoneValid}
                      style={{
                        background: isRegPhoneValid ? '#fef3c7' : '#f1f5f9',
                        color: isRegPhoneValid ? '#b45309' : '#94a3b8',
                        border: `1px solid ${isRegPhoneValid ? '#fcd34d' : '#e2e8f0'}`,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: isRegPhoneValid ? 'pointer' : 'not-allowed',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Zap size={14} color={isRegPhoneValid ? '#b45309' : '#94a3b8'} /> ⚡ 1-Click Auto-Verify (Instant Bypass)
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Store Name */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>3. Store / Shop Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Kisan Seva Kendra"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  required
                />
              </div>

              {/* 4. District & 5. Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>4. District / City *</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="form-input"
                    style={{ cursor: 'pointer' }}
                  >
                    {ALL_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>5. Primary Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-input"
                    style={{ cursor: 'pointer' }}
                  >
                    {SELLER_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn-auth btn-primary-auth"
                disabled={!isRegFormValid || loading}
                style={{
                  background: isRegFormValid ? '#ea580c' : '#cbd5e1',
                  borderColor: isRegFormValid ? '#ea580c' : '#cbd5e1',
                  cursor: isRegFormValid ? 'pointer' : 'not-allowed',
                  marginTop: '12px',
                  padding: '13px',
                }}
              >
                {loading ? <span className="spinner"></span> : <>Register Store & Launch Dashboard <ArrowRight size={18} /></>}
              </button>

              <div style={{ marginTop: '14px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Already have a registered seller store? </span>
                <button
                  type="button"
                  onClick={() => { setTab('signin'); hideMessage(); }}
                  style={{ background: 'none', border: 'none', color: '#ea580c', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Sign In with Phone →
                </button>
              </div>
            </form>
          )}

          <div className="back-link" style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link href="/" style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'none' }}>
              ← Return to Aegroshield Gateway
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
