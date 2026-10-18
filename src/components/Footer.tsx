"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Mail } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname() || '';

  // Hide footer on admin & dedicated vendor dashboard backends
  const isDashboardRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/seller/dashboard') ||
    pathname.startsWith('/vendor/dashboard');

  if (isDashboardRoute) {
    return null;
  }

  return (
    <footer
      style={{
        background: '#1b4332',
        color: '#e2e8f0',
        paddingTop: '56px',
        paddingBottom: '32px',
        borderTop: '4px solid #2d6a4f',
        marginTop: '60px',
      }}
    >
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Top Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '40px',
            marginBottom: '48px',
            textAlign: 'left',
          }}
        >
          {/* Col 1: Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.6rem' }}>🌾</span>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>
                AegroShield
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '16px' }}>
              Unified smart agriculture platform for Indian farmers. Providing verified inputs, on-demand machinery, farm labour, mandi prices, and crop advisory across India.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.1)',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                color: '#86efac',
              }}
            >
              <ShieldCheck size={16} /> Pan-India Verified Network 🇮🇳
            </div>
          </div>

          {/* Col 2: Farming Tools */}
          <div>
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '16px',
                borderBottom: '2px solid #52b788',
                paddingBottom: '6px',
                display: 'inline-block',
              }}
            >
              Farmer Tools
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <li>
                <Link href="/store" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                  🛒 Local Agri-Store
                </Link>
              </li>
              <li>
                <Link href="/machinery" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                  🚜 Machinery Rentals (CHC)
                </Link>
              </li>
              <li>
                <Link href="/labour" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                  👥 Farm Labour Board
                </Link>
              </li>
              <li>
                <Link href="/market" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                  📈 Live Mandi Prices
                </Link>
              </li>
              <li>
                <Link href="/calculator" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                  🧮 Smart Input Calculator
                </Link>
              </li>
              <li>
                <Link href="/advisory" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                  📋 Crop Advisory
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: For Sellers & Partners */}
          <div>
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '16px',
                borderBottom: '2px solid #52b788',
                paddingBottom: '6px',
                display: 'inline-block',
              }}
            >
              Sellers &amp; Partners
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <li>
                <Link href="/seller/register" style={{ color: '#fed7aa', fontWeight: '600', textDecoration: 'none' }}>
                  🏬 Register Store as Seller
                </Link>
              </li>
              <li>
                <Link href="/vendor/login" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                  🔑 Seller Portal Login
                </Link>
              </li>
              <li>
                <Link href="/login" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                  👤 Farmer Account Login
                </Link>
              </li>
              <li>
                <Link href="/cart" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                  🛍️ Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Compliance */}
          <div>
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '16px',
                borderBottom: '2px solid #52b788',
                paddingBottom: '6px',
                display: 'inline-block',
              }}
            >
              Legal &amp; Compliance
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <li>
                <Link href="/privacy" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: 600 }}>
                  🔒 Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: 600 }}>
                  📄 Terms of Use
                </Link>
              </li>
              <li>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.4', display: 'block' }}>
                  ⚖️ Insecticides Act (1968) &amp; IT Act (2000) Compliant
                </span>
              </li>
              <li style={{ marginTop: '6px' }}>
                <a
                  href="mailto:support@aegroshield.app"
                  style={{
                    color: '#86efac',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.88rem',
                  }}
                >
                  <Mail size={14} /> support@aegroshield.app
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory & Safety Notice Banner */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.25)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '32px',
            fontSize: '0.82rem',
            color: '#cbd5e1',
            lineHeight: '1.6',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <strong>Disclaimer &amp; Compliance:</strong> AegroShield is a digital platform connecting farmers with verified agri-retailers, custom hiring centres (CHCs), and labour teams. Sellers of agrochemicals must possess valid licenses under the Insecticides Act, 1968 and Fertiliser (Control) Order. AI crop advisory is for informational decision support; please consult local KVK experts for critical field treatments.
        </div>

        {/* Bottom Bar: Copyright & Direct Links */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '0.85rem',
            color: '#94a3b8',
          }}
        >
          <div>
            &copy; 2026 AegroShield Technologies Pvt. Ltd. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/privacy" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              Terms of Use
            </Link>
            <span>•</span>
            <a href="mailto:support@aegroshield.app" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              Grievance Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
