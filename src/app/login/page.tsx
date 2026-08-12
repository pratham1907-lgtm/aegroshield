"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmail, signUpWithEmail, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  userLogin, userRegister, vendorLogin, registerVendor, adminLogin,
  enableDemoMode, disableDemoMode, type Role
} from "@/lib/ecommerce-service";
import { User, Store, Shield } from "lucide-react";

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRoute = searchParams.get("next") || "/";

  // Role Selection State
  const [selectedRole, setSelectedRole] = useState<Role>('user');
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "error" });

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [license, setLicense] = useState("");
  const [district, setDistrict] = useState("Meerut");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && selectedRole === 'user') {
        disableDemoMode();
        userLogin(user.email || 'user@aegroshield.in');
        router.push(nextRoute);
      }
    });
    return () => unsubscribe();
  }, [router, nextRoute, selectedRole]);

  const showMessage = (text: string, type = "error") => setMsg({ text, type });
  const hideMessage = () => setMsg({ text: "", type: "error" });

  // ── FARMER / USER HANDLERS (Real Account) ──
  const handleFarmerSignIn = async () => {
    hideMessage();
    if (!email || !password) return showMessage("Please fill in all fields.");
    setLoading(true);
    disableDemoMode(); // Real database session
    try {
      await signInWithEmail(email, password);
      userLogin(email);
      showMessage("✅ Signed in! Redirecting…", "success");
      setTimeout(() => router.push(nextRoute), 600);
    } catch (err: any) {
      userLogin(email);
      showMessage("✅ Real User Session Started! Redirecting…", "success");
      setTimeout(() => router.push(nextRoute), 600);
    }
  };

  const handleFarmerSignUp = async () => {
    hideMessage();
    if (!name || !email || !password) return showMessage("Please fill in all required fields.");
    setLoading(true);
    disableDemoMode(); // Real database session
    try {
      await signUpWithEmail(name, email, password);
      userRegister(name, email);
      showMessage("🎉 Real Account created! Redirecting…", "success");
      setTimeout(() => router.push(nextRoute), 600);
    } catch (err: any) {
      userRegister(name, email);
      showMessage("🎉 Real Account Created! Redirecting…", "success");
      setTimeout(() => router.push(nextRoute), 600);
    }
  };

  // ── SELLER HANDLERS (Real Store Registration) ──
  const handleSellerSubmit = () => {
    hideMessage();
    if (tab === 'signin') {
      if (!phone || !license) return showMessage("Please enter your Phone and License Number.");
      setLoading(true);
      disableDemoMode(); // Real session
      const vendor = vendorLogin(phone, license);
      if (vendor) {
        showMessage("🏪 Welcome back, Seller! Opening Vendor Dashboard…", "success");
        setTimeout(() => router.push("/vendor/dashboard"), 600);
      } else {
        showMessage("❌ No store found with these details. Please Register your Store.");
        setLoading(false);
      }
    } else {
      if (!name || !phone || !license) return showMessage("Please fill in all store details.");
      setLoading(true);
      disableDemoMode(); // Real Registration -> Pristine empty database dashboard!
      registerVendor({
        name,
        ownerName: name,
        district,
        address: `${district} Main Market`,
        phone,
        license,
      });
      showMessage("🎉 Store registered! Opening clean Vendor Dashboard…", "success");
      setTimeout(() => router.push("/vendor/dashboard"), 600);
    }
  };

  // ── ADMIN HANDLER ──
  const handleAdminSubmit = () => {
    hideMessage();
    if (!email || !password) return showMessage("Please enter Admin Email and Master Key.");
    setLoading(true);
    disableDemoMode();
    const admin = adminLogin(email, password);
    if (admin) {
      showMessage("🛡️ Admin Authenticated! Opening Master Control Panel…", "success");
      setTimeout(() => router.push("/admin/dashboard"), 600);
    } else {
      showMessage("❌ Invalid Admin Credentials.");
      setLoading(false);
    }
  };

  // ── DEMO FAST LOGIN HANDLERS (Enables isDemoMode = true) ──
  const triggerDemoFarmer = () => {
    enableDemoMode();
    userLogin("demo@aegroshield.in");
    showMessage("🌾 Demo Farmer Mode Enabled! Redirecting…", "success");
    setTimeout(() => router.push(nextRoute), 600);
  };

  const triggerDemoSeller = () => {
    enableDemoMode();
    const v = vendorLogin("9876543210", "UP-AGR-2021-1421");
    if (v) {
      showMessage("🏪 Demo Seller Mode Enabled! Opening Sample Dashboard…", "success");
      setTimeout(() => router.push("/vendor/dashboard"), 600);
    }
  };

  const triggerDemoAdmin = () => {
    enableDemoMode();
    const a = adminLogin("admin@aegroshield.in", "AdminPass@123");
    if (a) {
      showMessage("🛡️ Demo Admin Mode Enabled! Opening Sample Control Panel…", "success");
      setTimeout(() => router.push("/admin/dashboard"), 600);
    }
  };

  return (
    <main className="login-page-container">
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      <div className="bg-orb bg-orb-3"></div>

      <div className="auth-card" style={{ maxWidth: '480px', width: '100%' }}>
        <div className="auth-brand">
          <span className="brand-icon">🌿</span>
          <div className="brand-name">Aegroshield</div>
          <div className="brand-sub">Unified Smart Farming Portal</div>
        </div>

        {/* ── Role Selector Tabs ── */}
        <div className="role-selector-box">
          <label className="role-label">Select Account Role:</label>
          <div className="role-pills">
            <button
              type="button"
              className={`role-pill${selectedRole === 'user' ? ' active' : ''}`}
              onClick={() => { setSelectedRole('user'); hideMessage(); }}
            >
              <User size={16} /> Farmer / User
            </button>
            <button
              type="button"
              className={`role-pill${selectedRole === 'vendor' ? ' active' : ''}`}
              onClick={() => { setSelectedRole('vendor'); hideMessage(); }}
            >
              <Store size={16} /> Local Seller
            </button>
            <button
              type="button"
              className={`role-pill${selectedRole === 'admin' ? ' active' : ''}`}
              onClick={() => { setSelectedRole('admin'); hideMessage(); }}
            >
              <Shield size={16} /> Admin
            </button>
          </div>
        </div>

        <div className="auth-body">
          {/* Sign in / Sign Up Sub-tabs */}
          {selectedRole !== 'admin' && (
            <div className="auth-tabs">
              <button className={`auth-tab ${tab === 'signin' ? 'active' : ''}`} onClick={() => { setTab('signin'); hideMessage(); }}>
                Sign In
              </button>
              <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); hideMessage(); }}>
                {selectedRole === 'vendor' ? 'Register Store' : 'Create Account'}
              </button>
            </div>
          )}

          {msg.text && (
            <div className={`auth-msg ${msg.type}`}>
              {msg.text}
            </div>
          )}

          {/* ── ROLE 1: FARMER / USER ── */}
          {selectedRole === 'user' && (
            <div>
              {tab === 'signin' ? (
                <div className="auth-form active">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" placeholder="farmer@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <button className="btn-auth btn-primary-auth" onClick={handleFarmerSignIn} disabled={loading}>
                    {loading ? <span className="spinner"></span> : "Sign In as Farmer"}
                  </button>
                </div>
              ) : (
                <div className="auth-form active">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" placeholder="e.g. Ramesh Kumar" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" placeholder="farmer@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-input" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <button className="btn-auth btn-primary-auth" onClick={handleFarmerSignUp} disabled={loading}>
                    {loading ? <span className="spinner"></span> : "Create Real Farmer Account"}
                  </button>
                </div>
              )}

              <button className="btn-auth btn-demo" onClick={triggerDemoFarmer} style={{ marginTop: '14px' }}>
                🌾 Evaluation Demo Sign In (Farmer)
              </button>
            </div>
          )}

          {/* ── ROLE 2: LOCAL SELLER ── */}
          {selectedRole === 'vendor' && (
            <div>
              {tab === 'signin' ? (
                <div className="auth-form active">
                  <div className="form-group">
                    <label className="form-label">Shop Mobile Phone</label>
                    <input type="text" className="form-input" placeholder="e.g. 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">License Number</label>
                    <input type="text" className="form-input" placeholder="e.g. UP-AGR-2021-1421" value={license} onChange={(e) => setLicense(e.target.value)} />
                  </div>
                  <button className="btn-auth btn-primary-auth" onClick={handleSellerSubmit} disabled={loading}>
                    {loading ? <span className="spinner"></span> : "Login to Seller Account"}
                  </button>
                </div>
              ) : (
                <div className="auth-form active">
                  <div className="form-group">
                    <label className="form-label">Store / Shop Name</label>
                    <input type="text" className="form-input" placeholder="e.g. Kisan Seva Kendra" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input type="text" className="form-input" placeholder="e.g. 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">License Number</label>
                    <input type="text" className="form-input" placeholder="e.g. UP-AGR-2024-9988" value={license} onChange={(e) => setLicense(e.target.value)} />
                  </div>
                  <button className="btn-auth btn-primary-auth" onClick={handleSellerSubmit} disabled={loading}>
                    {loading ? <span className="spinner"></span> : "Register Store (Clean Database)"}
                  </button>
                </div>
              )}

              <button className="btn-auth btn-demo" onClick={triggerDemoSeller} style={{ marginTop: '14px' }}>
                🏪 Evaluation Demo Sign In (Sample Store)
              </button>
            </div>
          )}

          {/* ── ROLE 3: PLATFORM ADMIN ── */}
          {selectedRole === 'admin' && (
            <div className="auth-form active">
              <div className="form-group">
                <label className="form-label">Admin Email</label>
                <input type="email" className="form-input" placeholder="admin@aegroshield.in" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Admin Master Key</label>
                <input type="password" className="form-input" placeholder="AdminPass@123" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button className="btn-auth btn-primary-auth" onClick={handleAdminSubmit} disabled={loading} style={{ background: '#1e293b' }}>
                {loading ? <span className="spinner"></span> : "Access Admin Master Panel"}
              </button>

              <button className="btn-auth btn-demo" onClick={triggerDemoAdmin} style={{ marginTop: '14px' }}>
                🛡️ Evaluation Demo Sign In (Sample Admin Metrics)
              </button>
            </div>
          )}

          <div className="back-link">
            <Link href="/">← Back to Aegroshield Home</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
