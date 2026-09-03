"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage, type Language } from '@/lib/language-context';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBag, User, LogOut } from 'lucide-react';

const LANG_OPTIONS: { value: Language; label: string }[] = [
  { value: 'en',    label: '🇬🇧 English' },
  { value: 'hi',    label: '🇮🇳 हिन्दी' },
  { value: 'hi-en', label: '🇮🇳 Hinglish' },
];

export default function Navbar() {
  const rawPathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const { cartCount } = useCart();
  const { user, userData, isDemo, logout } = useAuth();

  const pathname = rawPathname || '';

  // Render Navbar on Root (/) and Farmer/User App pages ONLY!
  const isFarmerRoute =
    pathname === '/' ||
    pathname.startsWith('/farmer') ||
    pathname.startsWith('/marketplace') ||
    pathname.startsWith('/machinery') ||
    pathname.startsWith('/labour') ||
    pathname.startsWith('/market') ||
    pathname.startsWith('/calculator') ||
    pathname.startsWith('/cart') ||
    pathname.startsWith('/store');

  // Hide on login, vendor dashboard/login/register, and admin pages
  if (!isFarmerRoute || pathname === '/login' || pathname.startsWith('/vendor') || pathname.startsWith('/admin')) {
    return null;
  }

  const isLoggedIn = Boolean(user || isDemo || userData);
  const displayName = userData?.name || user?.displayName || (userData?.email ? userData.email.split('@')[0] : 'Farmer');

  return (
    <nav className="navbar">
      <Link href="/" className="nav-brand">🌿 Aegroshield</Link>
      <div className="nav-links">
        <Link href="/">{t('nav.home')}</Link>
        <Link href="/marketplace">{t('nav.store')}</Link>
        <Link href="/machinery">{t('nav.machinery')}</Link>
        <Link href="/labour">{t('nav.labour')}</Link>
        <Link href="/market">{t('nav.market')}</Link>
        <Link href="/calculator">{t('nav.calculator')}</Link>

        {/* ── Cart Icon ── */}
        <Link href="/cart" className="nav-cart-btn" title="View Cart">
          <ShoppingBag size={18} />
          <span>Cart</span>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>

        {/* ── Language Toggle ── */}
        <div className="lang-toggle-wrap">
          <select
            className="lang-select"
            value={lang}
            onChange={e => setLang(e.target.value as Language)}
            aria-label="Select language"
            title="Change Language"
          >
            {LANG_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* ── User Auth State ── */}
        {isLoggedIn ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#14532d',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                padding: '6px 12px',
                borderRadius: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #dcfce7',
              }}
            >
              <User size={15} color="#16a34a" />
              {displayName}
              {isDemo && <span style={{ fontSize: '0.7rem', background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '10px', fontWeight: 'bold' }}>Demo</span>}
            </span>
            <button
              onClick={() => logout()}
              style={{
                background: 'rgba(255, 255, 255, 0.18)',
                border: '1px solid rgba(255, 255, 255, 0.45)',
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backdropFilter: 'blur(4px)',
                transition: 'all 0.2s ease',
              }}
              className="hover:bg-red-600 hover:border-red-500"
              title="Sign Out"
            >
              <LogOut size={15} color="#ffffff" /> Logout
            </button>
          </div>
        ) : (
          <Link href="/login" className="nav-btn-signin">{t('nav.signin')}</Link>
        )}
      </div>
    </nav>
  );
}

