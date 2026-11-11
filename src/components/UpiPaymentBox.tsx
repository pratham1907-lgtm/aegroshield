"use client";

import { useState } from 'react';
import { QrCode, Copy, Check, ExternalLink, ShieldCheck, Smartphone } from 'lucide-react';

interface UpiPaymentBoxProps {
  amount: number;
  orderId?: string;
  payeeVpa?: string;
  payeeName?: string;
  compact?: boolean;
}

export default function UpiPaymentBox({
  amount,
  orderId = 'NEW',
  payeeVpa = 'aegroshield@icici',
  payeeName = 'AegroShield Agri Hub',
  compact = false,
}: UpiPaymentBoxProps) {
  const [copied, setCopied] = useState(false);

  const cleanAmount = Math.max(1, Math.round(amount));
  const note = `AegroShield Order ${orderId.slice(0, 8)}`;
  const upiString = `upi://pay?pa=${payeeVpa}&pn=${encodeURIComponent(payeeName)}&am=${cleanAmount}&cu=INR&tn=${encodeURIComponent(note)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(upiString)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(payeeVpa);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      style={{
        backgroundColor: '#f0fdf4',
        border: '1.5px solid #86efac',
        borderRadius: '14px',
        padding: compact ? '14px' : '20px',
        marginTop: '12px',
        textAlign: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
        <QrCode size={20} color="#15803d" />
        <strong style={{ color: '#166534', fontSize: '0.98rem' }}>
          Instant UPI Payment (Google Pay / PhonePe / Paytm)
        </strong>
      </div>

      <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: '#334155' }}>
        Scan QR code below with any UPI application to pay ₹{cleanAmount.toLocaleString('en-IN')}.
      </p>

      {/* QR Code Container */}
      <div
        style={{
          display: 'inline-block',
          padding: '10px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #bbf7d0',
          boxShadow: '0 4px 12px rgba(22, 101, 52, 0.08)',
          marginBottom: '12px',
        }}
      >
        <img
          src={qrUrl}
          alt={`UPI QR Code for ₹${cleanAmount}`}
          width={180}
          height={180}
          style={{ display: 'block', borderRadius: '6px' }}
        />
      </div>

      {/* App badges */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
        {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map(app => (
          <span
            key={app}
            style={{
              fontSize: '0.74rem',
              fontWeight: 600,
              backgroundColor: '#ffffff',
              color: '#166534',
              border: '1px solid #bbf7d0',
              padding: '2px 8px',
              borderRadius: '6px',
            }}
          >
            {app}
          </span>
        ))}
      </div>

      {/* VPA copy bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '6px 12px',
          maxWidth: '320px',
          margin: '0 auto 12px',
        }}
      >
        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>UPI ID:</span>
        <code style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>{payeeVpa}</code>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            background: copied ? '#dcfce7' : '#f1f5f9',
            border: 'none',
            borderRadius: '6px',
            padding: '4px 8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            color: copied ? '#15803d' : '#475569',
            fontWeight: 600,
          }}
        >
          {copied ? <Check size={14} color="#15803d" /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Mobile Pay Link button */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <a
          href={upiString}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#15803d',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.84rem',
            fontWeight: 600,
            textDecoration: 'none',
            boxShadow: '0 2px 6px rgba(21, 128, 61, 0.25)',
          }}
        >
          <Smartphone size={16} /> Pay via Installed App
        </a>
      </div>

      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <ShieldCheck size={14} color="#16a34a" />
        <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 500 }}>
          Direct NPCI Secured Gateway • Zero Transaction Fees
        </span>
      </div>
    </div>
  );
}
