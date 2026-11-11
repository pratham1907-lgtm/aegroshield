"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'hi-en';

interface LanguageContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string, defaultText?: string) => string;
}

// ── Master Trilingual Translation Dictionary ──────────────────────────────────
export const TRANSLATIONS: Record<string, Record<Language, string>> = {
  // ── Navbar ───────────────────────────────────────────────────
  'nav.home':        { en: 'Home',         hi: 'होम',              'hi-en': 'Home' },
  'nav.store':       { en: 'Agri-Store',   hi: 'खाद-बीज स्टोर',    'hi-en': 'Agri-Store' },
  'nav.machinery':   { en: 'Machinery',    hi: 'मशीनरी किराया',   'hi-en': 'Machinery Rental' },
  'nav.labour':      { en: 'Farm Labour',  hi: 'खेत मजदूर',        'hi-en': 'Farm Labour' },
  'nav.market':      { en: 'Market Rates', hi: 'मंडी भाव',         'hi-en': 'Mandi Rates' },
  'nav.mandi':       { en: 'Mandi Rates',  hi: 'मंडी भाव',         'hi-en': 'Mandi Rates' },
  'nav.calculator':  { en: 'Calculator',   hi: 'कैलकुलेटर',        'hi-en': 'Calculator' },
  'nav.orders':      { en: 'Orders',       hi: 'मेरे ऑर्डर',       'hi-en': 'Mere Orders' },
  'nav.bookings':    { en: 'Bookings',     hi: 'मेरी बुकिंग',      'hi-en': 'Meri Bookings' },
  'nav.cart':        { en: 'Cart',         hi: 'कार्ट',            'hi-en': 'Cart' },
  'nav.signin':      { en: 'Sign In',      hi: 'लॉगिन करें',       'hi-en': 'Sign In' },
  'nav.logout':      { en: 'Logout',       hi: 'लॉगआउट',           'hi-en': 'Logout' },

  // ── Homepage Hero ─────────────────────────────────────────────
  'home.hero_tag': {
    en: 'Free for Every Indian Farmer 🇮🇳',
    hi: 'हर भारतीय किसान के लिए पूर्णतः निःशुल्क 🇮🇳',
    'hi-en': 'Free for Every Indian Farmer 🇮🇳',
  },
  'home.hero_title_1': {
    en: 'Smart Farming —',
    hi: 'स्मार्ट खेती —',
    'hi-en': 'Smart Farming —',
  },
  'home.hero_title_2': {
    en: 'All Tools in One Place',
    hi: 'सभी साधन एक ही स्थान पर',
    'hi-en': 'Saare Tools Ek Hi Jagah',
  },
  'home.hero_sub': {
    en: 'Order farm inputs, book machinery, find labour, check live mandi prices, and calculate inputs — completely free for Indian farmers.',
    hi: 'खाद-बीज ऑर्डर करें, ट्रैक्टर व मशीनरी बुक करें, मजदूर खोजें, ताज़ा मंडी भाव देखें और खाद-दवाई की सही मात्रा जानें — भारतीय किसानों के लिए 100% फ्री।',
    'hi-en': 'Farm inputs order karein, machinery book karein, labour dhundein, live mandi rates check karein aur fertilizer dose calculate karein — bilkul free.',
  },
  'home.btn_store': {
    en: '🛒 Explore Marketplace →',
    hi: '🛒 खाद-बीज बाजार देखें →',
    'hi-en': '🛒 Explore Marketplace →',
  },
  'home.btn_tools': {
    en: 'Explore All Tools ↓',
    hi: 'सभी सुविधाएं देखें ↓',
    'hi-en': 'Saare Tools Dekhein ↓',
  },
  'home.trust_text': {
    en: '50,000+ farmers already using Aegroshield across 18 states',
    hi: '18 राज्यों के 50,000+ से अधिक किसान AegroShield का उपयोग कर रहे हैं',
    'hi-en': '18 states ke 50,000+ farmers AegroShield use kar rahe hain',
  },
  'home.hub_title': {
    en: '🌾 Aegroshield Smart Hub',
    hi: '🌾 एग्रोशील्ड किसान सेवा केंद्र',
    'hi-en': '🌾 Aegroshield Smart Hub',
  },
  'home.hub_badge': {
    en: '5 Tools Included',
    hi: '5 सुविधाएं उपलब्ध',
    'hi-en': '5 Tools Included',
  },
  'home.hub_store_title': {
    en: 'Agri-Store',
    hi: 'खाद-बीज स्टोर',
    'hi-en': 'Local Agri-Store',
  },
  'home.hub_store_sub': {
    en: 'Local Marketplace',
    hi: 'स्थानीय बाजार',
    'hi-en': 'Local Marketplace',
  },
  'home.hub_store_desc': {
    en: 'Buy seeds, fertilizers & pesticides',
    hi: 'प्रमाणित बीज, खाद और कीटनाशक खरीदें',
    'hi-en': 'Seeds, fertilizers aur pesticides kharidein',
  },
  'home.hub_mach_title': {
    en: 'Rentals',
    hi: 'किराया सेवा',
    'hi-en': 'Rentals',
  },
  'home.hub_mach_sub': {
    en: 'Machinery Booking',
    hi: 'मशीनरी बुकिंग',
    'hi-en': 'Machinery Booking',
  },
  'home.hub_mach_desc': {
    en: 'Book tractors & harvesters nearby',
    hi: 'नजदीकी ट्रैक्टर व हार्वेस्टर बुक करें',
    'hi-en': 'Paas ke tractors aur harvesters rent par lein',
  },
  'home.hub_labour_title': {
    en: 'Hiring',
    hi: 'मजदूर भर्ती',
    'hi-en': 'Hiring',
  },
  'home.hub_labour_sub': {
    en: 'Farm Labour Board',
    hi: 'खेत मजदूर बोर्ड',
    'hi-en': 'Farm Labour Board',
  },
  'home.hub_labour_desc': {
    en: 'Hire skilled farm workers & teams',
    hi: 'कुशल खेत मजदूर व टीम खोजें',
    'hi-en': 'Skilled farm workers aur teams hire karein',
  },
  'home.hub_mandi_title': {
    en: 'Mandi Rates',
    hi: 'मंडी भाव',
    'hi-en': 'Mandi Rates',
  },
  'home.hub_mandi_sub': {
    en: 'Live Market Prices',
    hi: 'लाइव बाजार भाव',
    'hi-en': 'Live Market Prices',
  },
  'home.hub_mandi_desc': {
    en: 'Real-time crop prices & sell insights',
    hi: 'फसलों के ताज़ा भाव व बेचने की सलाह',
    'hi-en': 'Real-time crop rates aur hold/sell insights',
  },
  'home.badge_verified': {
    en: '✅ Verified Inputs & CHCs',
    hi: '✅ प्रमाणित कृषि उत्पाद व केंद्र',
    'hi-en': '✅ Verified Inputs & CHC Centers',
  },

  // ── Stats Banner ──────────────────────────────────────────────
  'home.stat_farmers_lbl': {
    en: 'Farmers Served',
    hi: 'लाभान्वित किसान',
    'hi-en': 'Farmers Served',
  },
  'home.stat_states_lbl': {
    en: 'States Covered',
    hi: 'शामिल राज्य',
    'hi-en': 'States Covered',
  },
  'home.stat_products_lbl': {
    en: 'Products Listed',
    hi: 'उपलब्ध उत्पाद',
    'hi-en': 'Products Listed',
  },
  'home.stat_tools_lbl': {
    en: 'Smart Tools',
    hi: 'स्मार्ट टूल्स',
    'hi-en': 'Smart Tools',
  },

  // ── Features Grid ─────────────────────────────────────────────
  'home.feat_badge': {
    en: '🌱 Platform Features',
    hi: '🌱 किसान सुविधाएं',
    'hi-en': '🌱 Platform Features',
  },
  'home.feat_title': {
    en: 'Everything a Farmer Needs',
    hi: 'किसान की हर ज़रूरत का संपूर्ण समाधान',
    'hi-en': 'Kisan Ki Har Zaroorat Ka Solution',
  },
  'home.feat_sub': {
    en: 'Built specifically for Indian agriculture — simple, fast, and works seamlessly in your local language.',
    hi: 'भारतीय कृषि के लिए विशेष रूप से निर्मित — सरल, तेज़ और आपकी अपनी भाषा में उपलब्ध।',
    'hi-en': 'Indian agriculture ke liye banaya gaya — aasaan, tez aur apni bhasha mein.',
  },

  // ── Marketplace / Store ───────────────────────────────────────
  'mp.badge':        { en: '🛒 Local Agri-Marketplace', hi: '🛒 स्थानीय कृषि बाजार', 'hi-en': '🛒 Local Agri-Marketplace' },
  'mp.title1':       { en: 'Buy Essential', hi: 'खेतीबाड़ी की', 'hi-en': 'Buy Essential' },
  'mp.title2':       { en: 'Agri-Inputs', hi: 'जरूरी चीजें खरीदें', 'hi-en': 'Agri-Inputs' },
  'mp.subtitle':     {
    en: 'Fertilizers, pesticides, seeds & equipment — order directly from your nearest verified local store with Cash on Delivery.',
    hi: 'खाद, कीटनाशक, बीज और उपकरण — कैश ऑन डिलीवरी के साथ सीधे अपने नजदीकी प्रमाणित स्टोर से ऑर्डर करें।',
    'hi-en': 'Fertilizers, pesticides, seeds aur equipment — seedhe apne naazdiki store se Cash on Delivery par mangwayein.',
  },
  'mp.search':       { en: 'Search product, crop, or brand...', hi: 'उत्पाद, फसल या ब्रांड खोजें...', 'hi-en': 'Product, crop ya brand search karein...' },
  'mp.district.label':  { en: '📍 District', hi: '📍 जिला', 'hi-en': '📍 District' },
  'mp.district.all':    { en: 'All Districts', hi: 'सभी जिले', 'hi-en': 'All Districts' },
  'mp.results':      { en: 'products found', hi: 'उत्पाद मिले', 'hi-en': 'products found' },
  'mp.results.in':   { en: 'in', hi: 'में', 'hi-en': 'in' },
  'mp.brand':        { en: 'Brand:', hi: 'ब्रांड:', 'hi-en': 'Brand:' },
  'mp.order.wa':     { en: 'Order on WhatsApp', hi: 'WhatsApp पर ऑर्डर करें', 'hi-en': 'WhatsApp par Order Karein' },
  'mp.add_to_cart':  { en: 'Add to Cart', hi: 'कार्ट में जोड़ें', 'hi-en': 'Cart me Jodein' },
  'mp.out_of_stock': { en: 'Out of Stock', hi: 'स्टॉक समाप्त', 'hi-en': 'Out of Stock' },
  'mp.in_stock':     { en: 'In Stock', hi: 'स्टॉक में उपलब्ध', 'hi-en': 'In Stock' },
  'mp.empty.title':  { en: 'No products found', hi: 'कोई उत्पाद नहीं मिला', 'hi-en': 'Koi product nahi mila' },
  'mp.empty.sub':    { en: 'Try selecting a different district or category.', hi: 'कृपया अन्य जिला या श्रेणी चुनकर देखें।', 'hi-en': 'Dusra district ya category select karein.' },

  // ── Machinery Page ────────────────────────────────────────────
  'mach.title':      { en: 'Tractor & Machinery Rentals', hi: 'ट्रैक्टर व कृषि यंत्र किराया', 'hi-en': 'Tractor & Machinery Rentals' },
  'mach.sub':        { en: 'Book tractors, harvesters, laser levelers, and rotavators from verified Custom Hiring Centres (CHCs).', hi: 'सत्यापित कस्टम हायरिंग केंद्रों (CHCs) से ट्रैक्टर, हार्वेस्टर, लेजर लेवलर और रोटावेटर बुक करें।', 'hi-en': 'Verified CHC centers se tractors, harvesters, laser levelers aur rotavators rent par book karein.' },
  'mach.book_now':   { en: 'Book Machinery', hi: 'उपकरण बुक करें', 'hi-en': 'Equipment Book Karein' },
  'mach.per_hour':   { en: '/ hour', hi: '/ घंटा', 'hi-en': '/ hour' },
  'mach.per_acre':   { en: '/ acre', hi: '/ एकड़', 'hi-en': '/ acre' },

  // ── Labour Page ───────────────────────────────────────────────
  'labour.title':    { en: 'Agricultural Labour Board', hi: 'कृषि मजदूर बोर्ड व दल', 'hi-en': 'Farm Labour Squad Board' },
  'labour.sub':      { en: 'Hire verified farming labour teams for harvesting, sowing, weeding, and spraying in your village.', hi: 'फसल कटाई, बुवाई, निराई-गुड़ाई व कीटनाशक छिड़काव के लिए अपने गांव में मजदूर दल खोजें।', 'hi-en': 'Fasal katai, buwai aur spray ke liye verified farm labour squads hire karein.' },
  'labour.hire_now': { en: 'Hire Labour Squad', hi: 'मजदूर दल बुक करें', 'hi-en': 'Labour Squad Book Karein' },

  // ── Mandi Rates Page ──────────────────────────────────────────
  'mandi.title':     { en: 'Live Mandi Prices & Analysis', hi: 'लाइव मंडी भाव व फसल परामर्श', 'hi-en': 'Live Mandi Rates & Sell Advisory' },
  'mandi.sub':       { en: 'Official real-time APMC mandi rates with AI price trend forecasting and Hold vs. Sell recommendations.', hi: 'आधिकारिक सरकारी APMC मंडी दरें, मूल्य रुझान और AI आधारित फसल बेचने या रोकने की सलाह।', 'hi-en': 'Official APMC mandi rates, price trend charts aur AI Hold vs. Sell guidance.' },
  'mandi.search_btn':{ en: 'Get Live Prices →', hi: 'लाइव भाव देखें →', 'hi-en': 'Live Prices Dekhein →' },
  'mandi.hold':      { en: 'HOLD CROP', hi: 'फसल रोकें (भाव बढ़ेंगे)', 'hi-en': 'HOLD (Bhav Badhenge)' },
  'mandi.sell':      { en: 'SELL NOW', hi: 'अभी बेचें (उच्चतम भाव)', 'hi-en': 'SELL NOW (Accha Bhav Hai)' },

  // ── Calculator Page ───────────────────────────────────────────
  'calc.title':      { en: 'Smart Input & Fertilizer Dose Calculator', hi: 'उर्वरक व कीटनाशक खुराक कैलकुलेटर', 'hi-en': 'Smart Fertilizer & Pesticide Calculator' },
  'calc.sub':        { en: 'Calculate exact Urea, DAP, MOP and pesticide dosage tailored to your crop and land size in Bigha or Acres.', hi: 'अपनी फसल और जमीन (बीघा/एकड़) के अनुसार यूरिया, डीएपी, पोटाश और कीटनाशक की सटीक मात्रा जानें।', 'hi-en': 'Apni fasal aur zameen ke hisaab se Urea, DAP, MOP aur spray ki exact matra calculate karein.' },
  'calc.btn':        { en: 'Calculate Doses', hi: 'खुराक की गणना करें', 'hi-en': 'Calculate Dose' },

  // ── Weather Widget ────────────────────────────────────────────
  'weather.title':    { en: 'Agro-Weather & Spray Advisory', hi: 'मौसम एवं कृषि छिड़काव परामर्श', 'hi-en': 'Agro-Weather & Spray Advisory' },
  'weather.sub':      { en: 'Live Weather & Spray Window', hi: 'ताज़ा मौसम व छिड़काव सुरक्षा', 'hi-en': 'Live Weather & Spray Window' },
  'weather.temp':     { en: 'Temperature', hi: 'तापमान', 'hi-en': 'Temperature' },
  'weather.humidity': { en: 'Humidity', hi: 'नमी', 'hi-en': 'Nami (Humidity)' },
  'weather.wind':     { en: 'Wind', hi: 'हवा की गति', 'hi-en': 'Hawa Speed' },
  'weather.rain':     { en: 'Rain Chance', hi: 'बारिश की संभावना', 'hi-en': 'Rain Chance' },
  'weather.gps':      { en: 'GPS', hi: 'जीपीएस', 'hi-en': 'GPS' },

  // ── AI Chatbot ────────────────────────────────────────────────
  'chat.launcher':    { en: '🌱 AI Sahayak & Helpline', hi: '🌱 AI सहायक व हेल्पलाइन', 'hi-en': '🌱 AI Sahayak & Helpline' },
  'chat.title':       { en: 'AegroShield AI Sahayak', hi: 'एग्रोशील्ड AI सहायक', 'hi-en': 'AegroShield AI Sahayak' },
  'chat.status':      { en: 'Online • 24/7 Farming Guidance', hi: 'ऑनलाइन • 24/7 कृषि परामर्श', 'hi-en': 'Online • 24/7 Kisan Guidance' },
  'chat.clear':       { en: 'Clear Chat', hi: 'चैट साफ करें', 'hi-en': 'Chat Clear Karein' },
  'chat.helpline':    { en: 'Helpline: 1800-180-1551', hi: 'हेल्पलाइन: 1800-180-1551', 'hi-en': 'Helpline: 1800-180-1551' },
  'chat.call':        { en: '📞 Call', hi: '📞 कॉल करें', 'hi-en': '📞 Call' },
  'chat.wa':          { en: '💬 WhatsApp', hi: '💬 व्हाट्सएप', 'hi-en': '💬 WhatsApp' },
  'chat.listening':   { en: '🎙️ Listening... speak clearly', hi: '🎙️ बोलिए... हम सुन रहे हैं', 'hi-en': '🎙️ Boliye... hum sun rahe hain' },
  'chat.stop':        { en: 'Stop ✕', hi: 'रोकें ✕', 'hi-en': 'Stop ✕' },
  'chat.voice_tip':   { en: 'Voice input (बोलकर पूछें)', hi: 'बोलकर पूछें', 'hi-en': 'Bolkar poochein' },
  'chat.placeholder': {
    en: 'Ask anything about crops, fertilizers, mandi...',
    hi: 'फसल, खाद, दवाई या मंडी भाव के बारे में पूछें...',
    'hi-en': 'Fasal, fertilizer, mandi bhav ke baare me poochhein...',
  },

  // ── Footer ────────────────────────────────────────────────────
  'footer.brand_desc': {
    en: 'Unified smart agriculture platform for Indian farmers. Providing verified inputs, on-demand machinery, farm labour, mandi prices, and crop advisory across India.',
    hi: 'भारतीय किसानों के लिए एकीकृत स्मार्ट कृषि मंच। प्रमाणित खाद-बीज, ट्रैक्टर किराया, कृषि मजदूर, ताज़ा मंडी भाव और फसल परामर्श एक ही स्थान पर।',
    'hi-en': 'Indian farmers ke liye smart agri OS. Verified fertilizers, seeds, machinery booking, labour, mandi rates aur AI advisory ek jagah.',
  },
  'footer.badge': {
    en: 'Government APMC Data & Verified Sellers',
    hi: 'सरकारी APMC आंकड़े व प्रमाणित विक्रेता',
    'hi-en': 'Govt APMC Data & Verified Sellers',
  },
  'footer.tools_head': {
    en: 'Farmer Tools',
    hi: 'किसान सेवाएं',
    'hi-en': 'Farmer Tools',
  },
  'footer.dealers_head': {
    en: 'For Agri-Dealers',
    hi: 'डीलर्स व विक्रेताओं के लिए',
    'hi-en': 'Agri-Dealers & Sellers',
  },
  'footer.support_head': {
    en: '24/7 Kisan Support',
    hi: '24/7 किसान सहायता',
    'hi-en': '24/7 Kisan Support',
  },
  'footer.helpline_lbl': {
    en: 'Toll-Free Kisan Helpline:',
    hi: 'टोल-फ्री किसान हेल्पलाइन:',
    'hi-en': 'Toll-Free Kisan Helpline:',
  },
  'footer.wa_lbl': {
    en: 'Official WhatsApp Desk:',
    hi: 'आधिकारिक व्हाट्सएप डेस्क:',
    'hi-en': 'Official WhatsApp Desk:',
  },
  'footer.timing_lbl': {
    en: 'Operating Hours: 8:00 AM – 8:00 PM (All 7 Days)',
    hi: 'समय: सुबह 8:00 से रात 8:00 (सभी 7 दिन)',
    'hi-en': 'Timings: 8:00 AM – 8:00 PM (Rozana)',
  },
  'footer.rights': {
    en: 'All rights reserved. Dedicated with pride to Indian Farmers 🇮🇳',
    hi: 'सर्वाधिकार सुरक्षित। भारतीय किसानों के सम्मान में समर्पित 🇮🇳',
    'hi-en': 'All rights reserved. Indian farmers ke liye banaya gaya 🇮🇳',
  },
};

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (key, fallback) => fallback || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  // Load saved language preference on mount and listen to cross-component sync events
  useEffect(() => {
    try {
      const saved = (localStorage.getItem('aegroshield_lang') ||
        localStorage.getItem('agrishield_language')) as Language | null;

      if (saved && ['en', 'hi', 'hi-en'].includes(saved)) {
        setLangState(saved);
      }
    } catch (e) {
      console.warn('[LanguageProvider] Error reading saved language:', e);
    }

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ lang: Language }>;
      if (customEvent.detail?.lang && ['en', 'hi', 'hi-en'].includes(customEvent.detail.lang)) {
        setLangState(customEvent.detail.lang);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if ((e.key === 'aegroshield_lang' || e.key === 'agrishield_language') && e.newValue) {
        if (['en', 'hi', 'hi-en'].includes(e.newValue)) {
          setLangState(e.newValue as Language);
        }
      }
    };

    window.addEventListener('aegroshield:lang-change', handleCustomEvent);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('aegroshield:lang-change', handleCustomEvent);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const setLang = (newLang: Language) => {
    if (!['en', 'hi', 'hi-en'].includes(newLang)) return;
    setLangState(newLang);

    try {
      localStorage.setItem('aegroshield_lang', newLang);
      localStorage.setItem('agrishield_language', newLang);
      // Dispatch custom event for real-time listener updates
      window.dispatchEvent(
        new CustomEvent('aegroshield:lang-change', { detail: { lang: newLang } })
      );
    } catch (e) {
      console.warn('[LanguageProvider] Failed to persist language:', e);
    }
  };

  const t = (key: string, fallback?: string): string => {
    const entry = TRANSLATIONS[key];
    if (!entry) return fallback || key;
    return entry[lang] ?? entry['en'] ?? fallback ?? key;
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
