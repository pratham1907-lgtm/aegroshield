"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage, type Language } from '@/lib/language-context';
import { useCart } from '@/lib/cart-context';
import { ShoppingBag } from 'lucide-react';

const LANG_OPTIONS: { value: Language; label: string }[] = [
  { value: 'en',    label: '🇬🇧 English' },
  { value: 'hi',    label: '🇮🇳 हिन्दी' },
  { value: 'hi-en', label: '🇮🇳 Hinglish' },
];

export default function Navbar() {
  const rawPathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const { cartCount } = useCart();

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

        <Link href="/login" className="nav-btn-signin">{t('nav.signin')}</Link>
      </div>
    </nav>
  );
}
