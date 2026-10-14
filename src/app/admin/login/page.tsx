"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, signInWithGoogle } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { adminLogin } from '@/lib/ecommerce-service';
import { Shield, ArrowRight, Lock, Mail } from 'lucide-react';

export default function AdminLoginPageWrapper() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0f172a", color: "#fff" }}>Loading Admin Portal...</div>}>
      <AdminLoginPage />
    </Suspense>
  );
}

function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "error" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // If user is already logged in with admin claims, auto-redirect to dashboard
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        try {
          const tokenResult = await currentUser.getIdTokenResult();
          if (tokenResult.claims.admin === true) {
            router.push('/admin/dashboard');
          }
        } catch {
          // Token verification error
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!mounted) {
    return null;
  }

  const showMessage = (text: string, type = "error") => setMsg({ text, type });

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return showMessage("Please enter your admin email and password.");
    }

    setLoading(true);
    setMsg({ text: "", type: "error" });

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      // Force refresh claims to ensure latest claims are read
      const tokenResult = await userCredential.user.getIdTokenResult(true);

      if (tokenResult.claims.admin !== true) {
        await auth.signOut();
        throw new Error("Access Denied: This account is not granted Platform Administrator privileges. Missing { admin: true } claim.");
      }

      adminLogin(userCredential.user.email || email, password, false);
      showMessage("🛡️ Administrator authenticated! Redirecting to Master Control Panel…", "success");
      setTimeout(() => router.push('/admin/dashboard'), 500);
    } catch (err: any) {
      console.error('[AdminLogin] Error:', err);
      let errorText = err?.message || "Invalid administrator credentials.";
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password' || err?.code === 'auth/user-not-found') {
        errorText = "Invalid admin email or password.";
      }
      showMessage(errorText, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAdminSubmit = async () => {
    setLoading(true);
    setMsg({ text: "", type: "error" });

    try {
      const userCredential = await signInWithGoogle();
      const tokenResult = await userCredential.user.getIdTokenResult(true);

      if (tokenResult.claims.admin !== true) {
        await auth.signOut();
        throw new Error("Access Denied: Your Google account does not have Platform Administrator privileges.");
      }

      adminLogin(userCredential.user.email || 'admin@aegroshield.in', 'google-auth', false);
      showMessage("🛡️ Administrator authenticated! Redirecting to Master Control Panel…", "success");
      setTimeout(() => router.push('/admin/dashboard'), 500);
    } catch (err: any) {
      console.error('[AdminLogin] Google Auth error:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        showMessage(err?.message || "Google Administrator authentication failed.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page-container" style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="auth-card" style={{ maxWidth: '440px', width: '100%', border: '1px solid #334155', background: '#1e293b', color: '#f8fafc', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
        
        {/* Admin Brand Header */}
        <div className="auth-brand" style={{ background: '#0f172a', padding: '28px 24px', borderBottom: '1px solid #334155', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', background: 'rgba(56,189,248,0.15)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', border: '1px solid rgba(56,189,248,0.3)' }}>
            <Shield size={32} color="#38bdf8" />
          </div>
          <div className="brand-name" style={{ color: '#f8fafc', fontSize: '1.45rem', fontWeight: '800' }}>AegroShield Admin</div>
          <div className="brand-sub" style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Cryptographic Custom Claims Verification</div>
        </div>

        <div className="auth-body" style={{ padding: '28px 24px' }}>
          {msg.text && (
            <div
              className={`auth-msg ${msg.type}`}
              style={{
                marginBottom: '18px',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                backgroundColor: msg.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                color: msg.type === 'success' ? '#4ade80' : '#f87171',
                border: msg.type === 'success' ? '1px solid #22c55e' : '1px solid #ef4444',
              }}
            >
              {msg.text}
            </div>
          )}

          <form onSubmit={handleEmailPasswordSubmit} className="auth-form active">
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Mail size={14} color="#94a3b8" /> Admin Email
              </label>
              <input
                type="email"
                className="form-input"
                style={{ background: '#0f172a', borderColor: '#334155', color: '#fff', width: '100%', padding: '12px 14px', borderRadius: '10px' }}
                placeholder="admin@aegroshield.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Lock size={14} color="#94a3b8" /> Password
              </label>
              <input
                type="password"
                className="form-input"
                style={{ background: '#0f172a', borderColor: '#334155', color: '#fff', width: '100%', padding: '12px 14px', borderRadius: '10px' }}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-auth btn-primary-auth"
              disabled={loading}
              style={{
                background: '#0284c7',
                border: 'none',
                color: '#fff',
                width: '100%',
                padding: '13px',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(2,132,199,0.3)',
              }}
            >
              {loading ? <span className="spinner">Verifying Claims...</span> : <>Sign In with Custom Claims <ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#64748b', fontSize: '0.8rem' }}>
            <div style={{ flex: 1, height: '1px', background: '#334155' }} />
            <span style={{ padding: '0 10px' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#334155' }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleAdminSubmit}
            disabled={loading}
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              color: '#f8fafc',
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Sign In with Google Admin Account
          </button>

          <div className="back-link" style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link href="/" style={{ color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'none' }}>
              ← Return to AegroShield Gateway
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
