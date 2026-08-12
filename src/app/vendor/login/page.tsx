"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { vendorLogin } from '@/lib/ecommerce-service';
import { Store, ShieldCheck, ArrowRight } from 'lucide-react';

export default function VendorLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [license, setLicense] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !license) {
      setError('Please provide both Phone Number and License Number.');
      return;
    }

    const vendor = vendorLogin(phone, license);
    if (vendor) {
      router.push('/vendor/dashboard');
    } else {
      setError('Invalid Vendor credentials. Please check your details or register your store.');
    }
  };

  return (
    <main className="vendor-auth-page">
      <div className="container" style={{ maxWidth: '440px', padding: '60px 20px' }}>
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon-circle">
              <Store size={28} color="var(--primary)" />
            </div>
            <h2>Vendor Portal Login</h2>
            <p>Access your local store dashboard, manage inventory, and fulfill farmer orders.</p>
          </div>

          {error && <div className="auth-alert error">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Phone Number / Mobile</label>
              <input
                type="text"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Fertilizer / Pesticide License Number</label>
              <input
                type="text"
                placeholder="e.g. UP-AGR-2021-1421"
                value={license}
                onChange={e => setLicense(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full">
              Login to Dashboard <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have a registered store yet?</p>
            <Link href="/vendor/register" className="auth-link">
              Register Your Agri-Store →
            </Link>
          </div>

          {/* Quick Demo Hint */}
          <div className="demo-credentials-box">
            <div className="demo-title">
              <ShieldCheck size={16} /> Demo Store Credentials
            </div>
            <div className="demo-credentials">
              <div><strong>Phone:</strong> 9876543210</div>
              <div><strong>License:</strong> UP-AGR-2021-1421</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
