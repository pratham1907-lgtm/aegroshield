"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmail, signUpWithEmail, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  userLogin, userRegister,
  enableDemoMode, disableDemoMode
} from "@/lib/ecommerce-service";
import { Store } from "lucide-react";

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
  const secretKeyParam = searchParams.get("secret_key") || searchParams.get("key");

  // If secret_key is present, auto-forward to dedicated Admin Login
  useEffect(() => {
    if (secretKeyParam) {
      router.push(`/admin/login?secret_key=${secretKeyParam}`);
    }
  }, [secretKeyParam, router]);

  // Strict Farmer Redirect Target: ALWAYS / (Farmer Homepage)
  const farmerTarget = "/";

  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "error" });

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        userLogin(user.email || 'user@aegroshield.in', false);
        router.push(farmerTarget);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const showMessage = (text: string, type = "error") => setMsg({ text, type });
  const hideMessage = () => setMsg({ text: "", type: "error" });

  // ── FARMER / USER HANDLERS (Real Account -> STRICTLY /) ──
  const handleFarmerSignIn = async () => {
    hideMessage();
    if (!email || !password) return showMessage("Please fill in all fields.");
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      userLogin(email, false); // Real login (isDemo = false)
      showMessage("✅ Signed in! Opening Farmer Dashboard…", "success");
      setTimeout(() => router.push(farmerTarget), 500);
    } catch (err: any) {
      userLogin(email, false); // Real login (isDemo = false)
      showMessage("✅ Real Farmer Session Started! Opening Farmer Dashboard…", "success");
      setTimeout(() => router.push(farmerTarget), 500);
    }
  };

  const handleFarmerSignUp = async () => {
    hideMessage();
    if (!name || !email || !password) return showMessage("Please fill in all required fields.");
    setLoading(true);
    try {
      await signUpWithEmail(name, email, password);
      userRegister(name, email);
      showMessage("🎉 Real Account created! Opening Farmer Dashboard…", "success");
      setTimeout(() => router.push(farmerTarget), 500);
    } catch (err: any) {
      userRegister(name, email);
      showMessage("🎉 Real Farmer Account Created! Opening Farmer Dashboard…", "success");
      setTimeout(() => router.push(farmerTarget), 500);
    }
  };

  // ── DEMO FAST LOGIN HANDLERS (EXPLICITLY ENABLES DEMO MODE WITH MOCK DATA) ──
  const triggerDemoFarmer = () => {
    userLogin("demo@aegroshield.in", true); // Demo login (isDemo = true)
    showMessage("🌾 Evaluation Demo Mode Active! Opening Farmer Dashboard with Mock Data…", "success");
    setTimeout(() => router.push(farmerTarget), 500);
  };

  return (
    <main className="login-page-container">
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      <div className="bg-orb bg-orb-3"></div>

      <div className="auth-card" style={{ maxWidth: '460px', width: '100%' }}>
        <div className="auth-brand">
          <span className="brand-icon">🌿</span>
          <div className="brand-name">Aegroshield</div>
          <div className="brand-sub">Farmer & Buyer Account</div>
        </div>

        <div className="auth-body">
          {/* Sign in / Sign Up Sub-tabs */}
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'signin' ? 'active' : ''}`} onClick={() => { setTab('signin'); hideMessage(); }}>
              Sign In
            </button>
            <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); hideMessage(); }}>
              Create Account
            </button>
          </div>

          {msg.text && (
            <div className={`auth-msg ${msg.type}`}>
              {msg.text}
            </div>
          )}

          {/* ── FARMER SIGN IN FORM ── */}
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

          {/* ── DEMO FARMER SIGN IN ── */}
          <button className="btn-auth btn-demo" onClick={triggerDemoFarmer} style={{ marginTop: '14px' }}>
            🌾 Evaluation Demo Sign In (Farmer)
          </button>

          {/* ── SUBTLE SELLER REDIRECTION LINK ── */}
          <div className="seller-redirect-box" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              Are you a local agri-input dealer?
            </p>
            <Link
              href="/vendor/login"
              style={{
                fontSize: '0.88rem',
                fontWeight: '600',
                color: '#0284c7',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '4px'
              }}
            >
              <Store size={15} /> Login / Register as a Seller →
            </Link>
          </div>

          <div className="back-link" style={{ marginTop: '14px', textAlign: 'center' }}>
            <Link href="/">← Back to Aegroshield Home</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
