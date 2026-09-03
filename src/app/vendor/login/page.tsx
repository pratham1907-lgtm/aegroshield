"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { auth, db, signInWithGoogle } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { vendorLogin, registerVendor } from '@/lib/ecommerce-service';
import { ALL_DISTRICTS } from '@/lib/marketplace-data';
import { Store, ShieldCheck, ArrowRight, User } from 'lucide-react';

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

  const { loginAsDemo } = useAuth();

  const [tab, setTab] = useState<'signin' | 'signup'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "error" });

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [license, setLicense] = useState('');

  // Register Form State
  const [regData, setRegData] = useState({
    name: '',
    ownerName: '',
    email: '',
    password: '',
    district: ALL_DISTRICTS[0],
    address: '',
    phone: '',
    license: '',
  });

  const showMessage = (text: string, type = "error") => setMsg({ text, type });
  const hideMessage = () => setMsg({ text: "", type: "error" });

  // ── SELLER LOGIN HANDLER ──
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    hideMessage();
    setLoading(true);

    if (email && password) {
      try {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        showMessage("🏪 Welcome back, Seller! Opening Vendor Dashboard…", "success");
        setTimeout(() => router.push("/vendor/dashboard"), 500);
        return;
      } catch (err: any) {
        console.warn("Firebase seller login failed, falling back to local search:", err);
      }
    }

    if (phone || license) {
      const vendor = vendorLogin(phone, license, false);
      if (vendor) {
        showMessage("🏪 Welcome back, Seller! Opening Vendor Dashboard…", "success");
        setTimeout(() => router.push("/vendor/dashboard"), 500);
        return;
      }
    }

    setLoading(false);
    showMessage("❌ Invalid credentials or no store found. Please check your login info or register a new store.");
  };

  // ── SELLER STORE REGISTRATION (SIGN UP) HANDLER ──
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    hideMessage();
    if (!regData.name || !regData.ownerName || !regData.email || !regData.password || !regData.phone || !regData.license) {
      return showMessage("Please fill in all required store details including email & password.");
    }
    if (regData.password.length < 6) {
      return showMessage("Password must be at least 6 characters.");
    }
    setLoading(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, regData.email.trim(), regData.password);
      await updateProfile(cred.user, { displayName: regData.ownerName });

      const cleanPhone = regData.phone.startsWith('91') ? regData.phone : '91' + regData.phone;

      // Save User Doc
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        name: regData.ownerName.trim(),
        storeName: regData.name.trim(),
        email: regData.email.trim(),
        phone: cleanPhone,
        district: regData.district,
        address: regData.address || `${regData.district} Main Market`,
        license: regData.license.trim(),
        role: 'vendor',
        isDemo: false,
        createdAt: serverTimestamp(),
      });

      // Save Vendor Doc
      await setDoc(doc(db, "vendors", cred.user.uid), {
        id: cred.user.uid,
        name: regData.name.trim(),
        ownerName: regData.ownerName.trim(),
        email: regData.email.trim(),
        phone: cleanPhone,
        district: regData.district,
        address: regData.address || `${regData.district} Main Market`,
        license: regData.license.trim(),
        rating: 5.0,
        verified: true,
        accreditationStatus: 'Verified',
        isDemo: false,
        createdAt: serverTimestamp(),
      });

      // Also register in local service for backward compatibility
      registerVendor({
        name: regData.name,
        ownerName: regData.ownerName,
        district: regData.district,
        address: regData.address || `${regData.district} Main Market`,
        phone: cleanPhone,
        license: regData.license,
      });

      showMessage("🎉 Store registered in Firestore! Opening clean Vendor Dashboard…", "success");
      setTimeout(() => router.push("/vendor/dashboard"), 500);
    } catch (err: any) {
      setLoading(false);
      if (err?.code === 'auth/email-already-in-use') {
        showMessage("An account with this email address already exists. Please Sign In.");
      } else {
        showMessage(err?.message || "Failed to register store.");
      }
    }
  };

  // ── GOOGLE VENDOR SIGN-IN HANDLER ──
  const handleGoogleSignIn = async () => {
    hideMessage();
    setLoading(true);
    try {
      const cred = await signInWithGoogle();
      const userRef = doc(db, "users", cred.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: cred.user.uid,
          name: cred.user.displayName || cred.user.email?.split('@')[0] || "Vendor Store Owner",
          email: cred.user.email || "",
          phone: cred.user.phoneNumber || "",
          role: "vendor",
          isDemo: false,
          createdAt: serverTimestamp(),
        });

        await setDoc(doc(db, "vendors", cred.user.uid), {
          id: cred.user.uid,
          name: cred.user.displayName ? `${cred.user.displayName}'s Agri Store` : "Agri Dealer Store",
          ownerName: cred.user.displayName || "Store Owner",
          email: cred.user.email || "",
          phone: cred.user.phoneNumber || "",
          district: ALL_DISTRICTS[0],
          address: "Main Market",
          license: "VERIFIED-GOOGLE-AUTH",
          rating: 5.0,
          verified: true,
          accreditationStatus: 'Verified',
          isDemo: false,
          createdAt: serverTimestamp(),
        });
      }

      showMessage("🎉 Signed in with Google! Opening Vendor Dashboard…", "success");
      setTimeout(() => router.push("/vendor/dashboard"), 500);
    } catch (err: any) {
      setLoading(false);
      if (err?.code === "auth/popup-closed-by-user") {
        showMessage("Google Sign-In window was closed. Please try again.");
      } else {
        showMessage(err?.message || "Failed to sign in with Google.");
      }
    }
  };

  // ── DEMO SELLER SIGN IN ──
  const triggerDemoSeller = () => {
    loginAsDemo('vendor');
    vendorLogin("9876543210", "UP-AGR-2021-1421", true);
    showMessage("🏪 Evaluation Demo Mode Active! Opening Sample Vendor Dashboard…", "success");
    setTimeout(() => router.push("/vendor/dashboard"), 500);
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

          {/* ── GOOGLE SELLER SIGN-IN / REGISTER BUTTON ── */}
          <button
            type="button"
            className="btn-auth btn-google"
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: '#ffffff',
              color: '#374151',
              border: '1px solid #cbd5e1',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              padding: '11px 16px',
              borderRadius: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              marginBottom: '16px',
              fontSize: '0.92rem',
              transition: 'all 0.2s ease',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            {tab === 'signin' ? 'Sign in with Google' : 'Register Store with Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', margin: '12px 0 16px', color: '#94a3b8', fontSize: '0.8rem' }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
            <span style={{ padding: '0 10px' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
          </div>


          {/* ── TAB 1: SELLER SIGN IN ── */}
          {tab === 'signin' && (
            <div>
              <form onSubmit={handleLoginSubmit} className="auth-form active">
                <div className="form-group">
                  <label className="form-label">Account Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="seller@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', margin: '4px 0 12px' }}>
                  — OR login with registered details —
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Mobile Phone</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">License Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. UP-AGR-2021-1421"
                      value={license}
                      onChange={(e) => setLicense(e.target.value)}
                    />
                  </div>
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
                    <label className="form-label">Account Email *</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="seller@example.com"
                      value={regData.email}
                      onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Min 6 chars"
                      value={regData.password}
                      onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                      required
                    />
                  </div>
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


          {/* ── REDIRECTION LINK TO FARMER LOGIN PAGE ── */}
          <div className="farmer-redirect-box" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              Are you a farmer or buyer?
            </p>
            <Link
              href="/login"
              style={{
                fontSize: '0.88rem',
                fontWeight: '600',
                color: '#16a34a',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '4px'
              }}
            >
              <User size={15} /> Login / Sign Up as a Farmer →
            </Link>
          </div>

          <div className="back-link" style={{ marginTop: '14px', textAlign: 'center' }}>
            <Link href="/" style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'none' }}>
              ← Return to Aegroshield Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
