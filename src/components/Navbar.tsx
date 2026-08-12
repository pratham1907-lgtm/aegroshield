"use client";

import Link from 'next/link';
import { useLanguage, type Language } from '@/lib/language-context';

const LANG_LABELS: Record<Language, string> = {
  en: '🇬🇧 EN',
  hi: '🇮🇳 हिं',
  'hi-en': '🇮🇳 HG',
};

const LANG_OPTIONS: { value: Language; label: string }[] = [
  { value: 'en',    label: '🇬🇧 English' },
  { value: 'hi',    label: '🇮🇳 हिन्दी' },
  { value: 'hi-en', label: '🇮🇳 Hinglish' },
];

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();

  return (
    <nav className="navbar">
      <Link href="/" className="nav-brand">🌿 Aegroshield</Link>
      <div className="nav-links">
        <Link href="/">{t('nav.home')}</Link>
        <Link href="/machinery">{t('nav.machinery')}</Link>
        <Link href="/labour">{t('nav.labour')}</Link>
        <Link href="/marketplace">{t('nav.store')}</Link>
        <Link href="/market">{t('nav.market')}</Link>
        <Link href="/calculator">{t('nav.calculator')}</Link>

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
