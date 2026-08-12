"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'hi-en';

interface LanguageContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
}

// ── Translation Dictionary ────────────────────────────────────────────────────
export const TRANSLATIONS: Record<string, Record<Language, string>> = {
  // ── Navbar ───────────────────────────────────────────────────
  'nav.home':        { en: 'Home',         hi: 'होम',       'hi-en': 'Home' },
  'nav.machinery':   { en: 'Machinery',    hi: 'मशीनरी',    'hi-en': 'Machinery' },
  'nav.labour':      { en: 'Labour',       hi: 'मजदूर',     'hi-en': 'Labour' },
  'nav.store':       { en: 'Store',        hi: 'स्टोर',     'hi-en': 'Store' },
  'nav.market':      { en: 'Market Price', hi: 'बाजार भाव', 'hi-en': 'Market Price' },
  'nav.calculator':  { en: 'Calculator',   hi: 'कैलकुलेटर', 'hi-en': 'Calculator' },
  'nav.signin':      { en: 'Sign In',      hi: 'लॉगिन करें', 'hi-en': 'Sign In' },

  // ── Marketplace Hero ──────────────────────────────────────────
  'mp.badge':        { en: '🛒 Local Agri-Marketplace', hi: '🛒 स्थानीय कृषि बाजार', 'hi-en': '🛒 Local Agri-Marketplace' },
  'mp.title1':       { en: 'Buy Essential', hi: 'खेतीबाड़ी की', 'hi-en': 'Buy Essential' },
  'mp.title2':       { en: 'Agri-Inputs', hi: 'जरूरी चीजें खरीदें', 'hi-en': 'Agri-Inputs' },
  'mp.subtitle':     {
    en: 'Fertilizers, pesticides, seeds & equipment — order directly from your nearest local store via WhatsApp.',
    hi: 'खाद, कीटनाशक, बीज और उपकरण — सीधे अपने नजदीकी दुकान से WhatsApp पर ऑर्डर करें।',
    'hi-en': 'Fertilizers, pesticides, seeds aur equipment — seedhe apne naazdiki dukaan se, WhatsApp par order karein.',
  },
  'mp.search':       { en: 'Search product, crop, or brand...', hi: 'उत्पाद, फसल या ब्रांड खोजें...', 'hi-en': 'Product, crop ya brand search karein...' },

  // ── Marketplace Filters ───────────────────────────────────────
  'mp.district.label':  { en: '📍 District', hi: '📍 जिला', 'hi-en': '📍 District' },
  'mp.district.all':    { en: 'All Districts (UP)', hi: 'सभी जिले (UP)', 'hi-en': 'All Districts (UP)' },

  // ── Marketplace Results ───────────────────────────────────────
  'mp.results':      { en: 'products found', hi: 'उत्पाद मिले', 'hi-en': 'products found' },
  'mp.results.in':   { en: 'in', hi: 'में', 'hi-en': 'in' },

  // ── Product Card ──────────────────────────────────────────────
  'mp.brand':        { en: 'Brand:', hi: 'ब्रांड:', 'hi-en': 'Brand:' },
  'mp.order.wa':     { en: 'Order on WhatsApp', hi: 'WhatsApp पर ऑर्डर करें', 'hi-en': 'WhatsApp pe Order Karo' },
  'mp.out_of_stock': { en: 'Out of Stock', hi: 'स्टॉक खत्म', 'hi-en': 'Out of Stock' },
  'mp.empty.title':  { en: 'No products found', hi: 'कोई उत्पाद नहीं मिला', 'hi-en': 'Koi product nahi mila' },
  'mp.empty.sub':    { en: 'Try selecting a different district or category.', hi: 'कोई और जिला या श्रेणी चुनें।', 'hi-en': 'Dusra district ya category chunein.' },

  // ── How it Works ──────────────────────────────────────────────
  'mp.how.title':    { en: 'Ordering is Simple!', hi: 'ऑर्डर करना है आसान!', 'hi-en': 'Order Karna Hai Aasaan!' },
  'mp.how.sub':      { en: 'Get your farming essentials in just 3 easy steps', hi: 'सिर्फ 3 आसान चरणों में अपनी जरूरत की चीजें पाएं', 'hi-en': 'Sirf 3 steps mein zaroori cheezein mangwayein' },
  'mp.how.1.title':  { en: 'Select District & Item', hi: 'जिला और वस्तु चुनें', 'hi-en': 'District & Item Chunein' },
  'mp.how.1.body':   { en: 'Choose your district and find what you need — fertilizer, seed, or pesticide.', hi: 'अपना जिला चुनें और जरूरत की चीज ढूंढें — खाद, बीज या कीटनाशक।', 'hi-en': 'Apna district select karein aur zarurat ki cheez dhundein.' },
  'mp.how.2.title':  { en: 'Tap "Order on WhatsApp"', hi: '"WhatsApp पर ऑर्डर करें" दबाएं', 'hi-en': '"Order on WhatsApp" Button Dabayein' },
  'mp.how.2.body':   { en: 'A ready-made order message is generated and sent directly to the local seller\'s WhatsApp.', hi: 'एक तैयार ऑर्डर संदेश सीधे दुकानदार के WhatsApp पर चला जाता है।', 'hi-en': 'Button dabate hi ready-made message seedha dukandaar ke WhatsApp par jaata hai.' },
  'mp.how.3.title':  { en: 'Delivery or Pickup', hi: 'डिलीवरी या पिकअप', 'hi-en': 'Delivery ya Pickup' },
  'mp.how.3.body':   { en: 'Talk to the seller, confirm the price, and get delivery at your farm or pick it up yourself.', hi: 'दुकानदार से बात करें, कीमत तय करें, और अपने खेत पर डिलीवरी या खुद ले आएं।', 'hi-en': 'Dukandaar se baat karo, price confirm karo, aur delivery ya khud pickup karo.' },

  // ── WhatsApp Message ──────────────────────────────────────────
  'mp.wa.greeting':  { en: 'Hello', hi: 'नमस्ते', 'hi-en': 'Namaste' },
  'mp.wa.want':      { en: 'I would like to order the following product:', hi: 'मुझे यह उत्पाद चाहिए:', 'hi-en': 'Mujhe ye product chahiye:' },
  'mp.wa.confirm':   { en: 'Please confirm availability and stock.', hi: 'कृपया उपलब्धता और स्टॉक की जानकारी दें।', 'hi-en': 'Kripya stock aur availability confirm karein.' },
};

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  // Load saved language from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aegroshield_lang') as Language | null;
      if (saved && ['en', 'hi', 'hi-en'].includes(saved)) {
        setLangState(saved);
      }
    } catch {}
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    try { localStorage.setItem('aegroshield_lang', l); } catch {}
  };

  const t = (key: string): string => {
    return TRANSLATIONS[key]?.[lang] ?? TRANSLATIONS[key]?.['en'] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
