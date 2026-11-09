"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Phone, MessageCircle, X, Clock, HelpCircle } from 'lucide-react';

export default function WhatsAppSupport() {
  const [isOpen, setIsOpen] = useState(false);

  const HELPLINE_PHONE = '+919999999999';
  const WHATSAPP_LINK = `https://wa.me/919999999999?text=${encodeURIComponent(
    'Namaste AegroShield Team! Mujhe fasal advisory, mandi rate ya order ke baare me jankari chahiye.'
  )}`;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '88px',
        right: '20px',
        zIndex: 998,
        fontFamily: 'inherit',
      }}
    >
      {/* Floating Pill Trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '30px',
            padding: '10px 18px',
            boxShadow: '0 6px 20px rgba(37,211,102,0.35)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 700,
            fontSize: '0.86rem',
            transition: 'transform 0.15s ease',
          }}
          title="Kisan Helpline & WhatsApp Support"
          aria-label="Kisan Helpline & WhatsApp Support"
        >
          <span style={{ fontSize: '1.15rem' }}>💬</span>
          <span>Kisan Helpline</span>
        </button>
      )}

      {/* Popover Support Card */}
      {isOpen && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '290px',
            boxShadow: '0 12px 35px rgba(0,0,0,0.18)',
            border: '1px solid #dcfce7',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
              color: '#ffffff',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>🌾</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>AegroShield Helpdesk</div>
                <div style={{ fontSize: '0.72rem', color: '#bbf7d0' }}>Kisan Sahayata Kendra</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '4px',
              }}
              aria-label="Close Helpdesk popup"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '16px' }}>
            <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#475569', lineHeight: 1.45 }}>
              Aapko store order, fasal ki dawai ya machinery booking me koi samasya hai? Humse sidha sampark karein:
            </p>

            {/* Action 1: WhatsApp */}
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#25D366',
                color: '#ffffff',
                padding: '10px 14px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.86rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '10px',
                boxShadow: '0 2px 8px rgba(37,211,102,0.3)',
              }}
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
            </a>

            {/* Action 2: Direct Call */}
            <a
              href={`tel:${HELPLINE_PHONE}`}
              style={{
                background: '#f8fafc',
                color: '#15803d',
                border: '1px solid #bbf7d0',
                padding: '9px 14px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.84rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '12px',
              }}
            >
              <Phone size={15} />
              Call Helpline (+91 99999 99999)
            </a>

            {/* Timings */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#64748b',
                fontSize: '0.74rem',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '10px',
              }}
            >
              <Clock size={13} color="#94a3b8" />
              <span>Timings: Mon–Sat, 8:00 AM – 8:00 PM</span>
            </div>

            <div style={{ marginTop: '8px', textAlign: 'center' }}>
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                style={{
                  fontSize: '0.76rem',
                  color: '#15803d',
                  textDecoration: 'underline',
                  fontWeight: 600,
                }}
              >
                View Full Contact &amp; Grievance Redressal →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
