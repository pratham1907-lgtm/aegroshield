"use client";

import { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    district: '',
    category: 'ORDER_HELP',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      alert('Kripya sabhi anivarya fields (Naam, Phone, Sandesh) bharein.');
      return;
    }

    setLoading(true);
    // Simulate query submission & feedback
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '80px' }}>
      {/* ── Page Banner ── */}
      <section style={{ background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)', color: '#fff', padding: '48px 20px 60px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.84rem', fontWeight: 600, marginBottom: '16px' }}>
            🌾 24x7 Kisan Sahayata Kendra • Farmer Helpdesk
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            Sampark Karein • Contact &amp; Support
          </h1>
          <p style={{ color: '#dcfce7', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto', lineHeight: 1.5 }}>
            Fasal advisory, store order, khad-beej licence, ya machinery booking se juda koi bhi sawal ho—humari team aapki madad ke liye tayaar hai.
          </p>
        </div>
      </section>

      {/* ── Main Layout ── */}
      <section style={{ maxWidth: '1000px', margin: '-32px auto 0', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* Left Column: Direct Contacts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Quick WhatsApp Support Card */}
            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '26px', border: '1.5px solid #bbf7d0', boxShadow: '0 6px 20px rgba(34,197,94,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageCircle size={26} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#14532d' }}>
                    Instant WhatsApp Support
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#16a34a', margin: '2px 0 0', fontWeight: 600 }}>
                    Fastest Response (5–10 mins)
                  </p>
                </div>
              </div>
              <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 16px' }}>
                Directly WhatsApp par message karein. Order ID ya photo bhej kar turant sahayata prapt karein.
              </p>
              <a
                href={`https://wa.me/919999999999?text=${encodeURIComponent('Namaste AegroShield, mujhe sahayata chahiye.')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#25D366',
                  color: '#ffffff',
                  padding: '11px 18px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(37,211,102,0.25)',
                }}
              >
                <MessageCircle size={18} /> Open WhatsApp Chat
              </a>
            </div>

            {/* Helpline Card */}
            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
                📞 Helpline &amp; Office Details
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <Phone size={18} color="#15803d" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>Toll-Free Helpline</div>
                    <a href="tel:+919999999999" style={{ color: '#15803d', fontWeight: 700, textDecoration: 'none' }}>
                      +91 99999 99999
                    </a>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Mon–Sat, 8:00 AM – 8:00 PM IST</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <Mail size={18} color="#15803d" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>Email Support</div>
                    <a href="mailto:support@aegroshield.com" style={{ color: '#15803d', textDecoration: 'none' }}>
                      support@aegroshield.com
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <MapPin size={18} color="#15803d" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>Operational Headquarters</div>
                    <div>AegroShield Technologies Pvt. Ltd.</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Agri-Tech Innovation Hub, Meerut, Uttar Pradesh, 250001</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <ShieldCheck size={18} color="#15803d" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>Grievance Officer</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Per Rule 5(9) of Consumer Protection (E-Commerce) Rules, 2020:
                      <br />
                      <strong>Email:</strong> grievance@aegroshield.com
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Query Submission Form */}
          <div style={{ background: '#ffffff', borderRadius: '18px', padding: '30px', border: '1px solid #e2e8f0', boxShadow: '0 6px 20px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
              Sandesh Bhejein • Submit a Support Request
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.86rem', margin: '0 0 20px' }}>
              Apna sawal niche darj karein. Humari customer care team 24 ghante ke bheetar aapko call ya SMS karegi.
            </p>

            {submitted ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
                <CheckCircle2 size={42} color="#16a34a" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontWeight: 700, color: '#15803d', margin: '0 0 6px' }}>
                  Aapka Sandesh Prapt Hua!
                </h4>
                <p style={{ color: '#475569', fontSize: '0.88rem', margin: '0 0 16px' }}>
                  Aapka ticket darj kar liya gaya hai. Humare representative aapse jaldi hi sampark karenge.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', phone: '', district: '', category: 'ORDER_HELP', message: '' });
                  }}
                  style={{
                    background: '#15803d',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                  }}
                >
                  Doosra Sawal Puchein
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Aapka Naam / Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit number"
                      maxLength={10}
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Zila / District
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Meerut"
                      value={formData.district}
                      onChange={e => setFormData({ ...formData, district: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Sawal Ka Vishay / Topic *
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#fff' }}
                  >
                    <option value="ORDER_HELP">🛒 Marketplace Order &amp; Delivery</option>
                    <option value="AGRONOMY_ADVICE">🌱 Fasal Rog &amp; Dawa (Crop Advisory)</option>
                    <option value="MACHINERY_BOOKING">🚜 Tractor / Machinery Booking</option>
                    <option value="LABOUR_BOOKING">👥 Farm Labour Support</option>
                    <option value="SELLER_ACCREDITATION">🏪 Dukan Registration &amp; Licence</option>
                    <option value="OTHER">❓ Anya Sawal (Other Question)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Apna Sandesh / Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Apna sawal ya samasya vistar se likhein..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: '#15803d',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '6px',
                  }}
                >
                  <Send size={16} />
                  {loading ? 'Submitting…' : 'Submit Support Request →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
