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
        style={{ cursor: 'pointer', color: '#ffffff' }}
        className="nav-brand text-white font-bold text-xl cursor-pointer flex items-center gap-2"
      >
        🌿 Aegroshield
      </Link>
      <div className="nav-links flex items-center gap-2">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            style={{ cursor: 'pointer', color: '#ffffff' }}
            className={`text-white hover:text-white hover:bg-white/15 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              item.isActive ? 'active bg-white/25 text-white font-semibold' : ''
            }`}
          >
            {item.label}
          </Link>
        ))}

        {/* ── Cart Icon ── */}
        <Link
          href="/cart"
          style={{ cursor: 'pointer', color: '#ffffff' }}
          className={`nav-cart-btn text-white hover:text-white hover:bg-white/15 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
            pathname.startsWith('/cart') ? 'active bg-white/25 text-white font-semibold' : ''
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
            className="lang-select border border-white/40 text-white hover:bg-white/10 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer"
            style={{ cursor: 'pointer', color: '#ffffff', background: 'transparent', borderColor: 'rgba(255, 255, 255, 0.4)' }}
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
              className="cursor-pointer hover:bg-red-600 hover:border-red-500"
              title="Sign Out"
            >
              <LogOut size={15} color="#ffffff" /> Logout
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            style={{ cursor: 'pointer', color: '#ffffff' }}
            className="nav-btn-signin border border-white/40 text-white hover:bg-white/10 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer"
          >
            {t('nav.signin')}
          </Link>
        )}
      </div>
    </nav>
  );
}
