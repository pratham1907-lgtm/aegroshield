"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerVendor, disableDemoMode } from '@/lib/ecommerce-service';
import { ALL_DISTRICTS } from '@/lib/marketplace-data';
import { Store, ShieldCheck, ArrowRight } from 'lucide-react';

export default function VendorRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    district: ALL_DISTRICTS[0],
    address: '',
    phone: '',
    license: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.ownerName || !formData.phone || !formData.license) {
      alert('Please fill in all required store details.');
      return;
    }

    disableDemoMode(); // Real registration always creates a clean real account!

    registerVendor({
      name: formData.name,
      ownerName: formData.ownerName,
      district: formData.district,
      address: formData.address || `${formData.district} Main Market`,
      phone: formData.phone.startsWith('91') ? formData.phone : '91' + formData.phone,
      license: formData.license,
    });

    alert('Store registered successfully in database! Opening clean Vendor Dashboard.');
    router.push('/vendor/dashboard');
  };

  return (
    <main className="vendor-auth-page">
      <div className="container" style={{ maxWidth: '540px', padding: '50px 20px' }}>
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon-circle">
              <Store size={28} color="var(--primary)" />
            </div>
            <h2>Register Agri-Store</h2>
            <p>Join Aegroshield as a local verified seller to reach thousands of farmers in your district.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Store / Shop Name *</label>
              <input
                type="text"
                placeholder="e.g. Kisan Seva Kendra"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Owner Name *</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Gupta"
                value={formData.ownerName}
                onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                required
              />
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>District *</label>
                <select
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                  className="mp-select"
                  style={{ width: '100%' }}
                >
                  {ALL_DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Phone / WhatsApp *</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Full Shop Address *</label>
              <input
                type="text"
                placeholder="e.g. Near Bus Stand, Meerut Road"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Fertilizer / Pesticide License Number *</label>
              <input
                type="text"
                placeholder="e.g. UP-AGR-2024-9988"
                value={formData.license}
                onChange={e => setFormData({ ...formData, license: e.target.value })}
                required
              />
              <span className="form-hint"><ShieldCheck size={14} /> License verification increases farmer trust.</span>
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '10px' }}>
              Complete Store Registration <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-footer">
            <p>Already registered?</p>
            <Link href="/login?role=vendor" className="auth-link">
              Login to Seller Account →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
