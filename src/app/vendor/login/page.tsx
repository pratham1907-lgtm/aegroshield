"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { vendorLogin, registerVendor, disableDemoMode, enableDemoMode } from '@/lib/ecommerce-service';
import { ALL_DISTRICTS } from '@/lib/marketplace-data';
import { Store, ShieldCheck, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

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

  // Login Form State
  const [phone, setPhone] = useState('');
  const [license, setLicense] = useState('');

  // Register Form State
  const [regData, setRegData] = useState({
    name: '',
    ownerName: '',
    district: ALL_DISTRICTS[0],
    address: '',
    phone: '',
    license: '',
  });

  const showMessage = (text: string, type = "error") => setMsg({ text, type });
  const hideMessage = () => setMsg({ text: "", type: "error" });

  // ── SELLER LOGIN HANDLER ──
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    hideMessage();
    if (!phone || !license) return showMessage("Please enter your Phone and License Number.");
    setLoading(true);
    disableDemoMode(); // Real Seller Session
    const vendor = vendorLogin(phone, license, false);
    if (vendor) {
      showMessage("🏪 Welcome back, Seller! Opening Vendor Dashboard…", "success");
      setTimeout(() => router.push("/vendor/dashboard"), 500);
    } else {
      showMessage("❌ No store found with these details. Please Register your Store below.");
      setLoading(false);
    }
  };

  // ── SELLER STORE REGISTRATION (SIGN UP) HANDLER ──
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    hideMessage();
    if (!regData.name || !regData.ownerName || !regData.phone || !regData.license) {
      return showMessage("Please fill in all required store details.");
    }
    setLoading(true);
    disableDemoMode(); // Real Registration -> Clean pristine database store!

    registerVendor({
      name: regData.name,
      ownerName: regData.ownerName,
      district: regData.district,
      address: regData.address || `${regData.district} Main Market`,
      phone: regData.phone.startsWith('91') ? regData.phone : '91' + regData.phone,
      license: regData.license,
    });

    showMessage("🎉 Store registered in database! Opening clean Vendor Dashboard…", "success");
    setTimeout(() => router.push("/vendor/dashboard"), 500);
  };

  // ── DEMO SELLER SIGN IN ──
  const triggerDemoSeller = () => {
    const v = vendorLogin("9876543210", "UP-AGR-2021-1421", true); // Demo Seller (isDemo = true)
    if (v) {
      showMessage("🏪 Evaluation Demo Mode Active! Opening Sample Vendor Dashboard…", "success");
      setTimeout(() => router.push("/vendor/dashboard"), 500);
    }
  };

  return (
    <main className="login-page-container">
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      <div className="bg-orb bg-orb-3"></div>

      <div className="auth-card" style={{ maxWidth: '520px', width: '100%' }}>
        
        {/* Brand Header */}
        <div className="auth-brand">
          <div style={{ width: '56px', height: '56px', background: 'rgba(234,88,12,0.12)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '1px solid rgba(234,88,12,0.3)' }}>
            <Store size={28} color="#ea580c" />
          </div>
          <div className="brand-name" style={{ color: 'var(--text-dark)' }}>Agri-Seller Portal</div>
          <div className="brand-sub">Local Dealer Storefront & Order Management</div>
        </div>

        <div className="auth-body">
          {/* Sub-tabs: Sign In vs Register Store */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === 'signin' ? 'active' : ''}`}
              onClick={() => { setTab('signin'); hideMessage(); }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
              onClick={() => { setTab('signup'); hideMessage(); }}
            >
              Register New Store
            </button>
          </div>

          {msg.text && (
            <div className={`auth-msg ${msg.type}`}>
              {msg.text}
            </div>
          )}

          {/* ── TAB 1: SELLER SIGN IN ── */}
          {tab === 'signin' && (
            <div>
              <form onSubmit={handleLoginSubmit} className="auth-form active">
                <div className="form-group">
                  <label className="form-label">Shop Mobile Phone *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">License Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. UP-AGR-2021-1421"
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-auth btn-primary-auth"
                  disabled={loading}
                  style={{ background: '#ea580c', borderColor: '#ea580c' }}
                >
                  {loading ? <span className="spinner"></span> : <>Login to Seller Dashboard <ArrowRight size={18} /></>}
                </button>
              </form>

              {/* Evaluation Demo Seller Sign In */}
              <button
                type="button"
                className="btn-auth btn-demo"
                onClick={triggerDemoSeller}
                style={{ marginTop: '14px' }}
              >
                🏪 Evaluation Demo Sign In (Sample Store)
              </button>
            </div>
          )}

          {/* ── TAB 2: REGISTER NEW STORE (SIGN UP) ── */}
          {tab === 'signup' && (
            <div>
              <form onSubmit={handleRegisterSubmit} className="auth-form active">
                <div className="form-group">
                  <label className="form-label">Store / Shop Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Kisan Seva Kendra"
                    value={regData.name}
                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Owner Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ramesh Gupta"
                    value={regData.ownerName}
                    onChange={(e) => setRegData({ ...regData, ownerName: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">District *</label>
                    <select
                      value={regData.district}
                      onChange={(e) => setRegData({ ...regData, district: e.target.value })}
                      className="form-input"
                      style={{ cursor: 'pointer' }}
                    >
                      {ALL_DISTRICTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Phone *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 9876543210"
                      value={regData.phone}
                      onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Shop Address *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Near Bus Stand, Meerut Road"
                    value={regData.address}
                    onChange={(e) => setRegData({ ...regData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fertilizer / Pesticide License *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. UP-AGR-2024-9988"
                    value={regData.license}
                    onChange={(e) => setRegData({ ...regData, license: e.target.value })}
                    required
                  />
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={14} color="#22c55e" /> License verification grants verified platform status.
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-auth btn-primary-auth"
                  disabled={loading}
                  style={{ background: '#ea580c', borderColor: '#ea580c', marginTop: '10px' }}
                >
                  {loading ? <span className="spinner"></span> : <>Complete Store Registration <ArrowRight size={18} /></>}
                </button>
              </form>
            </div>
          )}

          <div className="back-link" style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link href="/" style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'none' }}>
              ← Return to Aegroshield Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
