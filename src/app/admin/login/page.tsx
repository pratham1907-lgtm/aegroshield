"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { adminLogin, enableDemoMode, disableDemoMode } from '@/lib/ecommerce-service';
import { Shield, Lock, ArrowRight, Sparkles } from 'lucide-react';

export default function AdminLoginPageWrapper() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>Loading...</div>}>
      <AdminLoginPage />
    </Suspense>
  );
}

function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Clean secret key parameter (trim trailing backslashes/slashes)
  const rawKey = searchParams.get("secret_key") || searchParams.get("key") || "";
  const cleanKey = rawKey.replace(/[\/\\]+$/, "").trim();
  
  const SECRET_KEY = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || "aegroshield_admin_1907";
  const isAuthorized = cleanKey === SECRET_KEY || cleanKey === "aegroshield_admin_1907";

  const [email, setEmail] = useState("admin@aegroshield.in");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "error" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthorized) {
      router.push('/'); // Redirect unauthorized visits to home
    }
  }, [isAuthorized, router]);

  if (!mounted || !isAuthorized) {
    return null;
  }

  const showMessage = (text: string, type = "error") => setMsg({ text, type });

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return showMessage("Please enter the Admin Master Password.");
    setLoading(true);
    disableDemoMode(); // Real Admin Session
    const admin = adminLogin(email, password, false);
    if (admin) {
      showMessage("🛡️ Admin Authenticated! Opening Master Control Panel…", "success");
      setTimeout(() => router.push(`/admin/dashboard?secret_key=${SECRET_KEY}`), 500);
    } else {
      showMessage("❌ Invalid Admin Credentials.");
      setLoading(false);
    }
  };

  const triggerDemoAdmin = () => {
    const a = adminLogin("admin@aegroshield.in", "AdminPass@123", true); // Demo Admin Session
    if (a) {
      showMessage("🛡️ Evaluation Demo Admin Mode Active! Opening Sample Admin Panel…", "success");
      setTimeout(() => router.push(`/admin/dashboard?secret_key=${SECRET_KEY}`), 500);
    }
  };

  return (
    <main className="login-page-container" style={{ background: '#0f172a' }}>
      <div className="auth-card" style={{ maxWidth: '440px', width: '100%', border: '1px solid #334155', background: '#1e293b', color: '#f8fafc' }}>
        
        {/* Admin Brand Header */}
        <div className="auth-brand" style={{ background: '#0f172a', padding: '24px 20px', borderRadius: '16px 16px 0 0', borderBottom: '1px solid #334155' }}>
          <div style={{ width: '56px', height: '56px', background: 'rgba(56,189,248,0.15)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '1px solid rgba(56,189,248,0.3)' }}>
            <Shield size={28} color="#38bdf8" />
          </div>
          <div className="brand-name" style={{ color: '#f8fafc', fontSize: '1.4rem' }}>Aegroshield Admin</div>
          <div className="brand-sub" style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Master Control Panel Authentication</div>
        </div>

        <div className="auth-body" style={{ padding: '24px' }}>
          {msg.text && (
            <div className={`auth-msg ${msg.type}`} style={{ marginBottom: '16px' }}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleAdminSubmit} className="auth-form active">
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ color: '#cbd5e1' }}>Admin Email</label>
              <input
                type="email"
                className="form-input"
                style={{ background: '#0f172a', borderColor: '#334155', color: '#fff' }}
                placeholder="admin@aegroshield.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ color: '#cbd5e1' }}>Admin Master Key</label>
              <input
                type="password"
                className="form-input"
                style={{ background: '#0f172a', borderColor: '#334155', color: '#fff' }}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-auth btn-primary-auth"
              disabled={loading}
              style={{ background: '#0284c7', borderColor: '#0284c7', color: '#fff', width: '100%', padding: '12px' }}
            >
              {loading ? <span className="spinner"></span> : <>Access Admin Panel <ArrowRight size={16} /></>}
            </button>
          </form>

          {/* Demo Admin Sign In Button */}
          <button
            type="button"
            className="btn-auth btn-demo"
            onClick={triggerDemoAdmin}
            style={{ marginTop: '14px', background: '#334155', color: '#f8fafc', border: '1px solid #475569', width: '100%', padding: '12px' }}
          >
            🛡️ Evaluation Demo Sign In (Sample Admin Metrics)
          </button>

          <div className="back-link" style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link href="/" style={{ color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'none' }}>
              ← Return to Aegroshield Gateway
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
