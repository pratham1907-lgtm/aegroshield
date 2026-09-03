"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db, signInWithGoogle } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Store } from "lucide-react";

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}

function getFirebaseErrorMessage(code: string, fallback: string): string {
  switch (code) {
    case "auth/user-not-found":
      return "No user found with this email address.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/invalid-credential":
      return "Invalid credentials. Please check your email and password.";
    case "auth/email-already-in-use":
      return "An account with this email address already exists.";
    case "auth/weak-password":
      return "Password should be at least 6 characters long.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many failed login attempts. Please try again later.";
    default:
      return fallback || "An authentication error occurred. Please try again.";
  }
}

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const secretKeyParam = searchParams.get("secret_key") || searchParams.get("key");

  const { user, isDemo, loginAsDemo } = useAuth();

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
    if (user && !isDemo) {
      router.push(farmerTarget);
    }
  }, [user, isDemo, router]);

  const showMessage = (text: string, type = "error") => setMsg({ text, type });
  const hideMessage = () => setMsg({ text: "", type: "error" });

  // ── FARMER / USER HANDLERS (Real Account -> STRICTLY /) ──
  const handleFarmerSignIn = async () => {
    hideMessage();
    if (!email || !password) return showMessage("Please fill in all fields.");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      showMessage("✅ Signed in! Opening Farmer Dashboard…", "success");
      setTimeout(() => router.push(farmerTarget), 500);
    } catch (err: any) {
      setLoading(false);
      showMessage(getFirebaseErrorMessage(err?.code, err?.message || "Failed to sign in."));
    }
  };

  const handleFarmerSignUp = async () => {
    hideMessage();
    if (!name || !email || !password) return showMessage("Please fill in all required fields.");
    if (password.length < 6) return showMessage("Password must be at least 6 characters.");
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name });
      
      // Save User Document in Firestore
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        name: name.trim(),
        email: email.trim(),
        phone: "",
        role: "farmer",
        isDemo: false,
        createdAt: serverTimestamp(),
      });

      showMessage("🎉 Account created in Firestore! Opening Farmer Dashboard…", "success");
      setTimeout(() => router.push(farmerTarget), 500);
    } catch (err: any) {
      setLoading(false);
      showMessage(getFirebaseErrorMessage(err?.code, err?.message || "Failed to create account."));
    }
  };

  // ── GOOGLE SIGN-IN / SIGN-UP HANDLER ──
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
          name: cred.user.displayName || cred.user.email?.split('@')[0] || "Farmer Account",
          email: cred.user.email || "",
          phone: cred.user.phoneNumber || "",
          role: "farmer",
          isDemo: false,
          createdAt: serverTimestamp(),
        });
      }

      showMessage("🎉 Signed in with Google! Opening Farmer Dashboard…", "success");
      setTimeout(() => router.push(farmerTarget), 500);
    } catch (err: any) {
      setLoading(false);
      if (err?.code === "auth/popup-closed-by-user") {
        showMessage("Google Sign-In window was closed. Please try again.");
      } else {
        showMessage(getFirebaseErrorMessage(err?.code, err?.message || "Failed to sign in with Google."));
      }
    }
  };

  // ── DEMO FAST LOGIN HANDLERS (EXPLICITLY ENABLES DEMO MODE WITH MOCK DATA) ──
  const triggerDemoFarmer = () => {
    loginAsDemo('farmer');
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

          {/* ── GOOGLE SIGN-IN / SIGN-UP BUTTON ── */}
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
            {tab === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', margin: '12px 0 16px', color: '#94a3b8', fontSize: '0.8rem' }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
            <span style={{ padding: '0 10px' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
          </div>

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
