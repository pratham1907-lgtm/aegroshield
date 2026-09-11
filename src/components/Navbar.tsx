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

  const navItems = [
    { href: '/', label: t('nav.home'), isActive: pathname === '/' },
    { href: '/marketplace', label: t('nav.store'), isActive: pathname.startsWith('/marketplace') || pathname.startsWith('/store') },
    { href: '/machinery', label: t('nav.machinery'), isActive: pathname.startsWith('/machinery') },
    { href: '/labour', label: t('nav.labour'), isActive: pathname.startsWith('/labour') },
    { href: '/market', label: t('nav.market'), isActive: pathname.startsWith('/market') },
    { href: '/calculator', label: t('nav.calculator'), isActive: pathname.startsWith('/calculator') },
  ];

  return (
    <nav className="navbar">
      <Link
        href="/"
        style={{ cursor: 'pointer' }}
        className="nav-brand text-white font-bold text-xl cursor-pointer flex items-center gap-2"
      >
        🌿 Aegroshield
      </Link>
      <div className="nav-links flex items-center gap-2">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            style={{ cursor: 'pointer' }}
            className={`nav-item-link px-3.5 py-1.5 rounded-lg text-sm font-medium cursor-pointer flex items-center gap-1.5 ${
              item.isActive ? 'active' : ''
            }`}
          >
            {item.label}
          </Link>
        ))}

        {/* ── Cart Icon ── */}
        <Link
          href="/cart"
          style={{ cursor: 'pointer' }}
          className={`nav-cart-btn px-3.5 py-1.5 rounded-lg text-sm font-medium cursor-pointer flex items-center gap-1.5 ${
            pathname.startsWith('/cart') ? 'active' : ''
          }`}
          title="View Cart"
        >
          <ShoppingBag size={18} />
          <span>Cart</span>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>

        {/* ── Language Toggle ── */}
        <div className="lang-toggle-wrap">
          <select
            className="lang-select px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer"
            style={{ cursor: 'pointer' }}
            value={lang}
            onChange={e => setLang(e.target.value as Language)}
            aria-label="Select language"
            title="Change Language"
          >
            {LANG_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} style={{ color: '#0f172a', background: '#ffffff' }}>{opt.label}</option>
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
              style={{ cursor: 'pointer' }}
              className="nav-logout-btn cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={15} color="currentColor" /> Logout
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            style={{ cursor: 'pointer' }}
            className="nav-btn-signin px-3.5 py-1.5 rounded-lg text-sm font-medium cursor-pointer"
          >
            {t('nav.signin')}
          </Link>
        )}
      </div>
    </nav>
  );
}
