"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmail, signUpWithEmail, signInWithGoogle, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRoute = searchParams.get("next") || "/";

  const [tab, setTab] = useState("signin");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "error" });
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push(nextRoute);
      }
    });
    return () => unsubscribe();
  }, [router, nextRoute]);

  const showMessage = (text: string, type = "error") => setMsg({ text, type });
  const hideMessage = () => setMsg({ text: "", type: "error" });

  const friendlyError = (err: any) => {
    const code = err.code || err.message || String(err);
    const map: Record<string, string> = {
      'auth/user-not-found': '❌ No account found with this email.',
      'auth/wrong-password': '❌ Incorrect password. Please try again.',
      'auth/invalid-credential': '❌ Incorrect email or password.',
      'auth/email-already-in-use': '⚠️ This email is already registered. Try signing in.',
      'auth/weak-password': '⚠️ Password must be at least 6 characters.',
      'auth/invalid-email': '⚠️ Please enter a valid email address.',
      'auth/too-many-requests': '🔒 Too many attempts. Please wait a moment.',
      'auth/network-request-failed': '🌐 Network error. Check your connection.',
      'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    };
    return map[code] || ('⚠️ Error: ' + code);
  };

  const startLocalSession = (userEmail: string, userName?: string) => {
    localStorage.setItem('aegro_mock_user', JSON.stringify({
      email: userEmail,
      displayName: userName || userEmail.split('@')[0],
      uid: 'mock-' + Date.now()
    }));
    setTimeout(() => router.push(nextRoute), 800);
  };

  const handleSignIn = async () => {
    hideMessage();
    if (!email || !password) return showMessage("Please fill in all fields.");
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      showMessage("✅ Signed in! Redirecting…", "success");
    } catch (err: any) {
      if (String(err).includes('configuration-not-found') || String(err).includes('network-request-failed')) {
        showMessage("✅ Offline/Mock Session Started. Redirecting…", "success");
        startLocalSession(email);
      } else {
        showMessage(friendlyError(err));
        setLoading(false);
      }
    }
  };

  const handleSignUp = async () => {
    hideMessage();
    if (!name || !email || !password) return showMessage("Please fill in all fields.");
    if (password !== confirmPassword) return showMessage("Passwords do not match.");
    if (password.length < 6) return showMessage("Password must be at least 6 characters.");
    
    setLoading(true);
    try {
      await signUpWithEmail(name, email, password);
      showMessage("🎉 Account created! Redirecting…", "success");
    } catch (err: any) {
      if (String(err).includes('configuration-not-found') || String(err).includes('network-request-failed')) {
        showMessage("🎉 Offline/Mock Account Created! Redirecting…", "success");
        startLocalSession(email, name);
      } else {
        showMessage(friendlyError(err));
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    hideMessage();
    try {
      await signInWithGoogle();
    } catch (err) {
      showMessage(friendlyError(err));
    }
  };

  const handleDemoLogin = async () => {
    hideMessage();
    setEmail("demo@aegroshield.in");
    setPassword("Agri@1234");
    setLoading(true);
    try {
      await signInWithEmail("demo@aegroshield.in", "Agri@1234");
      showMessage("✅ Demo account loaded! Redirecting…", "success");
    } catch (err: any) {
      if (String(err).includes('configuration-not-found') || String(err).includes('network-request-failed')) {
        showMessage("🌾 Offline Demo Session Started! Redirecting…", "success");
        startLocalSession("demo@aegroshield.in", "Demo Farmer");
        return;
      }
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          await signUpWithEmail("Demo Farmer", "demo@aegroshield.in", "Agri@1234");
          showMessage("🌾 Demo account created & signed in! Redirecting…", "success");
        } catch (e2) {
          if (String(e2).includes('configuration-not-found')) {
             showMessage("🌾 Offline Demo Session Started! Redirecting…", "success");
             startLocalSession("demo@aegroshield.in", "Demo Farmer");
          } else {
             showMessage(friendlyError(e2));
             setLoading(false);
          }
        }
      } else {
        showMessage(friendlyError(err));
        setLoading(false);
      }
    }
  };

  return (
    <main className="login-page-container">
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      <div className="bg-orb bg-orb-3"></div>

      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-icon">🌿</span>
          <div className="brand-name">Aegroshield</div>
          <div className="brand-sub">Smart Farming Platform for Indian Farmers</div>
        </div>

        <div className="auth-body">
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'signin' ? 'active' : ''}`} onClick={() => { setTab('signin'); hideMessage(); }}>Sign In</button>
            <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); hideMessage(); }}>Sign Up</button>
          </div>

          <div className={`auth-msg ${msg.type}`} style={{ display: msg.text ? 'block' : 'none' }}>
            {msg.text}
          </div>

          {/* SIGN IN FORM */}
          <div className={`auth-form ${tab === 'signin' ? 'active' : ''}`}>
            <div className="demo-badge">
              <span>🌾</span>
              <div>
                <strong>Try the Demo Account</strong>
                Email: <b>demo@aegroshield.in</b> &nbsp;|&nbsp; Password: <b>Agri@1234</b>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="pw-wrap">
                <input type={showPw ? "text" : "password"} className="form-input" placeholder="Your password" style={{ paddingRight: "46px" }} value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button className="btn-auth btn-primary-auth" onClick={handleSignIn} disabled={loading}>
              {loading ? <span className="spinner"></span> : "Sign In to Aegroshield"}
            </button>

            <div className="divider">or</div>

            <button className="btn-auth btn-google" onClick={handleGoogleSignIn}>
              <svg className="google-svg" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 12 24 12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.5 6.5 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.4 35.4 26.8 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 39.5 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.5l6.2 5.2C37 37.3 44 32 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
              Continue with Google
            </button>

            <button className="btn-auth btn-demo" onClick={handleDemoLogin}>
              🌾 Try Demo Account
            </button>
          </div>

          {/* SIGN UP FORM */}
          <div className={`auth-form ${tab === 'signup' ? 'active' : ''}`}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" placeholder="e.g. Ramesh Kumar" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="pw-wrap">
                <input type={showPw ? "text" : "password"} className="form-input" placeholder="Min 6 characters" style={{ paddingRight: "46px" }} value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="pw-wrap">
                <input type={showConfirmPw ? "text" : "password"} className="form-input" placeholder="Repeat password" style={{ paddingRight: "46px" }} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                <button type="button" className="pw-toggle" onClick={() => setShowConfirmPw(!showConfirmPw)}>
                  {showConfirmPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button className="btn-auth btn-primary-auth" onClick={handleSignUp} disabled={loading}>
              {loading ? <span className="spinner"></span> : "Create My Account"}
            </button>

            <div className="divider">or</div>

            <button className="btn-auth btn-google" onClick={handleGoogleSignIn}>
              <svg className="google-svg" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 12 24 12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.5 6.5 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.4 35.4 26.8 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 39.5 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.5l6.2 5.2C37 37.3 44 32 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
              Sign Up with Google
            </button>
          </div>

          <div className="back-link">
            <Link href="/">← Back to Aegroshield Home</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
