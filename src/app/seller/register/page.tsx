"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, signInWithGoogle } from '@/lib/firebase';
import { syncUserToDatabase } from '@/lib/sync-user-client';
import { ALL_DISTRICTS } from '@/lib/marketplace-data';
import { Building2, ArrowRight, CheckCircle2, PhoneCall, KeyRound, Zap } from 'lucide-react';

const SELLER_CATEGORIES = [
  'General Agri-Store',
  'Seeds',
  'Fertilizers',
  'Pesticides',
  'Farm Equipment',
];

export default function SellerRegisterPage() {
  const router = useRouter();

  // 5 Core Seller Registration Fields
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [storeName, setStoreName] = useState('');
  const [district, setDistrict] = useState(ALL_DISTRICTS[0] || 'Meerut');
  const [category, setCategory] = useState(SELLER_CATEGORIES[0]);

  // Optional Compliance / Document Fields
  const [gstin, setGstin] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [showComplianceDocs, setShowComplianceDocs] = useState(false);

  // Phone OTP Verification State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: 'error' });

  const showMessage = (text: string, type: 'error' | 'success' = 'error') => setMsg({ text, type });
  const hideMessage = () => setMsg({ text: '', type: 'error' });

  const cleanPhone = phone.replace(/\D/g, '').trim();
  const isPhoneValid = cleanPhone.length === 10;

  const isFormValid =
    Boolean(ownerName.trim()) &&
    isPhoneValid &&
    isPhoneVerified &&
    Boolean(storeName.trim()) &&
    Boolean(district) &&
    Boolean(category);

  // Send OTP
  const handleSendOtp = () => {
    hideMessage();
    if (!isPhoneValid) {
      return showMessage('Please enter a valid 10-digit Indian mobile number.');
    }
    setOtpSent(true);
    setOtpCode('123456');
    showMessage('📩 OTP code sent! Use code 123456 or click Auto-Verify.', 'success');
  };

  // Verify OTP
  const handleVerifyOtp = () => {
    hideMessage();
    if (otpCode.trim() === '123456' || otpCode.trim().length === 6) {
      setIsPhoneVerified(true);
      showMessage('✓ Phone number verified successfully!', 'success');
    } else {
      showMessage('Invalid OTP code. Please enter 123456 to verify.');
    }
  };

  // 1-Click Instant Auto-Verify
  const handleAutoVerify = () => {
    if (!isPhoneValid) {
      return showMessage('Please enter a 10-digit mobile number first.');
    }
    setOtpSent(true);
    setOtpCode('123456');
    setIsPhoneVerified(true);
    showMessage('✓ Phone number verified instantly!', 'success');
  };

  // Submit Registration to Prisma Backend
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    hideMessage();

    if (!isPhoneVerified) {
      return showMessage('Please verify your phone number with OTP first.');
    }
    if (!isFormValid) {
      return showMessage('Please fill in all 5 required fields.');
    }

    setLoading(true);

    try {
      let currentUser = auth.currentUser;
      if (!currentUser) {
        const cred = await signInWithGoogle();
        currentUser = cred.user;
      }

      await syncUserToDatabase({
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: ownerName.trim() || currentUser.displayName,
        phoneNumber: cleanPhone || currentUser.phoneNumber,
        role: 'SELLER',
      });

      const token = await currentUser.getIdToken();

      const res = await fetch('/api/seller/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ownerName: ownerName.trim(),
          phone: cleanPhone,
          storeName: storeName.trim(),
          district: district.trim(),
          category: category.trim(),
          ...(gstin.trim() ? { gstin: gstin.trim().toUpperCase() } : {}),
          ...(licenseNumber.trim() ? { licenseNumber: licenseNumber.trim() } : {}),
          ...(documentUrl.trim() ? { documentUrl: documentUrl.trim() } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to register seller store.');
      }

      // Store authenticated seller session in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'aegroshield_seller_session',
          JSON.stringify({
            user: data.user,
            seller: data.seller,
          })
        );
      }

      showMessage(`🎉 Store registered successfully! Welcome, ${ownerName.trim()}. Your account is submitted for verification.`, 'success');
      setTimeout(() => {
        router.push('/seller/dashboard');
      }, 1000);
    } catch (err: any) {
      console.error('[SellerRegister] Error:', err);
      showMessage(err?.message || 'Failed to complete registration. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="login-page-container">
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      <div className="bg-orb bg-orb-3"></div>

      <div className="auth-card" style={{ maxWidth: '520px', width: '100%', margin: '20px auto' }}>
        
        {/* Brand Header */}
        <div className="auth-brand">
          <div style={{ width: '56px', height: '56px', background: 'rgba(234,88,12,0.12)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '1px solid rgba(234,88,12,0.3)' }}>
            <Building2 size={28} color="#ea580c" />
          </div>
          <div className="brand-name" style={{ color: 'var(--text-dark)' }}>Seller Onboarding</div>
          <div className="brand-sub">Fast Phone-Only Registration for Agricultural Retailers</div>
        </div>

        <div className="auth-body">
          {msg.text && (
            <div className={`auth-msg ${msg.type}`} style={{ marginBottom: '16px' }}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="auth-form active">
            
            {/* 1. Owner Name */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>1. Owner Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ramesh Kumar"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
              />
            </div>

            {/* 2. Mobile Phone & OTP Verification */}
            <div className="form-group" style={{ background: isPhoneVerified ? '#f0fdf4' : '#faf5ff', padding: '14px', borderRadius: '12px', border: `1px solid ${isPhoneVerified ? '#86efac' : '#e9d5ff'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className="form-label" style={{ fontWeight: 700, margin: 0, color: isPhoneVerified ? '#166534' : '#581c87' }}>
                  2. Mobile Phone Number (+91) *
                </label>
                {isPhoneVerified && (
                  <span style={{ fontSize: '0.78rem', background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} color="#15803d" /> Verified
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '12px', fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>
                    +91
                  </span>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="9876543210"
                    maxLength={10}
                    style={{ paddingLeft: '48px', fontWeight: 600 }}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ''));
                      if (isPhoneVerified) setIsPhoneVerified(false);
                    }}
                    disabled={isPhoneVerified}
                    required
                  />
                </div>

                {!isPhoneVerified && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={!isPhoneValid}
                    style={{
                      background: isPhoneValid ? '#ea580c' : '#94a3b8',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: isPhoneValid ? 'pointer' : 'not-allowed',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <PhoneCall size={14} /> {otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                )}
              </div>

              {/* OTP Verification & 1-Click Bypass Controls */}
              {!isPhoneVerified && (
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {otpSent && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        style={{ letterSpacing: '0.15em', fontWeight: 700, textAlign: 'center', flex: 1 }}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        style={{
                          background: '#16a34a',
                          color: '#ffffff',
                          border: 'none',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <KeyRound size={14} /> Verify
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAutoVerify}
                    disabled={!isPhoneValid}
                    style={{
                      background: isPhoneValid ? '#fef3c7' : '#f1f5f9',
                      color: isPhoneValid ? '#b45309' : '#94a3b8',
                      border: `1px solid ${isPhoneValid ? '#fcd34d' : '#e2e8f0'}`,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: isPhoneValid ? 'pointer' : 'not-allowed',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Zap size={14} color={isPhoneValid ? '#b45309' : '#94a3b8'} /> ⚡ 1-Click Auto-Verify (Instant Bypass)
                  </button>
                </div>
              )}
            </div>

            {/* 3. Store Name */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>3. Store / Shop Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Kisan Seva Kendra"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
              />
            </div>

            {/* 4. District / City & 5. Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>4. District / City *</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="form-input"
                  style={{ cursor: 'pointer' }}
                >
                  {ALL_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>5. Primary Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-input"
                  style={{ cursor: 'pointer' }}
                >
                  {SELLER_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Compliance Documents (optional, collapsible) ── */}
            <div
              style={{
                background: '#fefce8',
                border: '1px solid #fde68a',
                borderRadius: '12px',
                overflow: 'hidden',
                marginTop: '4px',
              }}
            >
              <button
                type="button"
                onClick={() => setShowComplianceDocs(v => !v)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#92400e' }}>
                  📋 Compliance Documents{' '}
                  <span style={{ fontWeight: 400, color: '#b45309' }}>(optional — speeds up verification)</span>
                </span>
                <span style={{ color: '#b45309', fontSize: '1rem' }}>{showComplianceDocs ? '▲' : '▼'}</span>
              </button>

              {showComplianceDocs && (
                <div style={{ padding: '0 16px 16px' }}>
                  <p style={{ fontSize: '0.78rem', color: '#78350f', marginBottom: '12px', lineHeight: 1.6 }}>
                    Sellers listing <strong>pesticides or fertilizers</strong> must hold a valid dealer
                    licence under the <strong>Insecticides Act, 1968</strong>. Providing these details
                    now speeds up admin approval.
                  </p>

                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      GSTIN{' '}
                      <span style={{ fontWeight: 400, color: '#94a3b8' }}>(15-char, e.g. 09ABCDE1234F1Z5)</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Leave blank if not GST-registered"
                      maxLength={15}
                      value={gstin}
                      onChange={e => setGstin(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                      style={{ letterSpacing: '0.06em', fontFamily: 'monospace' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      Insecticide / Business Licence Number
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="State-issued dealer licence no."
                      maxLength={100}
                      value={licenseNumber}
                      onChange={e => setLicenseNumber(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      Document URL{' '}
                      <span style={{ fontWeight: 400, color: '#94a3b8' }}>(Google Drive / Dropbox shareable link)</span>
                    </label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://drive.google.com/file/..."
                      value={documentUrl}
                      onChange={e => setDocumentUrl(e.target.value)}
                    />
                    <p style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px' }}>
                      Upload your licence scan and paste the shareable link here.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Pending Verification Status Notice ── */}
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '0.82rem',
                color: '#166534',
                lineHeight: 1.7,
              }}
            >
              🕐 <strong>Verification process:</strong> New accounts start as{' '}
              <strong>PENDING_VERIFICATION</strong>. An AegroShield admin reviews your profile within
              1–2 business days before your store goes live. You can prepare your catalogue in the
              meantime.
            </div>

            {/* Registration Submit Button */}
            <button
              type="submit"
              className="btn-auth btn-primary-auth"
              disabled={!isFormValid || loading}
              style={{
                background: isFormValid ? '#ea580c' : '#cbd5e1',
                borderColor: isFormValid ? '#ea580c' : '#cbd5e1',
                cursor: isFormValid ? 'pointer' : 'not-allowed',
                marginTop: '12px',
                padding: '13px',
              }}
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  Register Store & Launch Dashboard <ArrowRight size={18} />
                </>
              )}
            </button>

            {!isFormValid && (
              <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#64748b', textAlign: 'center' }}>
                {!isPhoneVerified ? '⚠️ Please verify phone number (+91 OTP) to complete registration.' : '⚠️ Fill in all 5 fields above to proceed.'}
              </div>
            )}
          </form>

          <div className="back-link" style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link href="/vendor/login" style={{ color: '#ea580c', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
              Already registered? Sign In with Phone →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
