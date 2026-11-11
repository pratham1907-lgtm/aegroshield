"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageCircle, X, Send, Phone, Trash2, ExternalLink, ShieldCheck, Sparkles, HelpCircle, Mic, MicOff } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { useLanguage, type Language } from '@/lib/language-context';

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: 'en', label: '🇬🇧 English' },
  { value: 'hi', label: '🇮🇳 हिन्दी' },
  { value: 'hi-en', label: '🇮🇳 Hinglish' },
];

const WELCOME_MESSAGES: Record<Language, string> = {
  'en': "👋 Hello! I'm AegroShield AI Assistant.\n\nI can help you with:\n🌾 Crop diseases, fertilizer doses & seed selection\n📈 Today's live APMC Mandi rates\n🚜 Machinery rental (Tractors, Harvesters)\n👥 Hiring agricultural labour squads\n📞 24/7 Kisan Helpline & WhatsApp Support\n\nHow can I help you today?",
  'hi': "👋 नमस्ते! मैं AegroShield AI सहायक हूँ।\n\nमैं आपकी सहायता कर सकता हूँ:\n🌾 फसल रोग, खाद (यूरिया/डीएपी) और प्रमाणित बीज\n📈 आज के ताज़ा सरकारी APMC मंडी भाव\n🚜 ट्रैक्टर व कृषि यंत्र किराया बुकिंग\n👥 बुवाई व कटाई हेतु खेत मजदूर दल\n📞 24/7 किसान हेल्पलाइन व व्हाट्सएप सहायता\n\nआज आपकी क्या सहायता करूँ?",
  'hi-en': "👋 Namaste! Main AegroShield AI Assistant hoon.\n\nMain aapki help kar sakta hoon:\n🌾 Fasal bimari, fertilizer aur certified seed guidance\n📈 Live APMC Mandi rates\n🚜 Tractor aur machinery rental booking\n👥 Khet majdoor squad booking\n📞 24/7 Kisan Helpline & WhatsApp Help\n\nAap kis cheez me jankari chahte hain?",
};

const INPUT_PLACEHOLDERS: Record<Language, string> = {
  'en': 'Ask anything about crops, fertilizers, mandi...',
  'hi': 'फसल, खाद, दवाई या मंडी भाव के बारे में पूछें...',
  'hi-en': 'Fasal, fertilizer, mandi bhav ke baare me poochhein...',
};

const QUICK_ACTIONS: Record<Language, Array<{ label: string; query: string }>> = {
  'en': [
    { label: '📞 Kisan Helpline', query: 'Kisan Helpline number and contact details' },
    { label: '💬 WhatsApp Support', query: 'Connect with WhatsApp agricultural desk' },
    { label: '📈 Mandi Rates', query: 'What are today live APMC mandi rates?' },
    { label: '🌾 Crop Advisory', query: 'What is the recommended fertilizer dose for wheat and paddy?' },
    { label: '🚜 Machinery', query: 'How can I rent a tractor and rotavator near me?' },
  ],
  'hi': [
    { label: '📞 किसान हेल्पलाइन', query: 'किसान हेल्पलाइन नंबर और संपर्क विवरण चाहिए' },
    { label: '💬 व्हाट्सएप सहायता', query: 'व्हाट्सएप कृषि डेस्क से संपर्क करें' },
    { label: '📈 आज के मंडी भाव', query: 'आज के ताज़ा APMC मंडी भाव क्या हैं?' },
    { label: '🌾 फसल व खाद सलाह', query: 'गेहूँ और धान में यूरिया और डीएपी की सही मात्रा कितनी होनी चाहिए?' },
    { label: '🚜 ट्रैक्टर किराया', query: 'ट्रैक्टर और रोटावेटर किराए पर कैसे बुक करें?' },
  ],
  'hi-en': [
    { label: '📞 Kisan Helpline', query: 'Kisan Helpline number aur contact details' },
    { label: '💬 WhatsApp Support', query: 'WhatsApp Helpline par support chahiye' },
    { label: '📈 Mandi Rates', query: 'Aaj ke taza mandi rates kya hain?' },
    { label: '🌾 Fasal Salah', query: 'Gehu aur dhaan me khad ki sahi matra kitni honi chahiye?' },
    { label: '🚜 Machinery', query: 'Tractor aur rotavator kiraye par kaise lein?' },
  ],
};

export interface ChatMessage {
  role: 'user' | 'agent';
  text: string;
  time: string;
  isHelpline?: boolean;
}

export default function Chatbot() {
  const router = useRouter();
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Toggle voice recognition (Web Speech API)
  const toggleVoiceInput = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        lang === 'hi'
          ? 'आपके ब्राउज़र में वॉयस रिकॉग्निशन उपलब्ध नहीं है। कृपया Chrome या Edge का उपयोग करें।'
          : 'Voice recognition is supported on Chrome, Edge & Android browsers. Please use a supported browser.'
      );
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'en' ? 'en-IN' : 'hi-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript || '';
        if (transcript) {
          setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = (err: any) => {
        console.warn('[Chatbot] Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('[Chatbot] Speech recognition initialization failed:', e);
      setIsListening(false);
    }
  };

  // On mount: purge any old/legacy error history from localStorage so chat starts fresh
  useEffect(() => {
    try {
      localStorage.removeItem('aegroshield_chat_history_v2');
      localStorage.removeItem('agrishield_chat_history');
    } catch (e) {}
  }, []);

  // Automatic cleanup whenever chat window is closed
  const handleCloseChat = () => {
    setIsOpen(false);
    // Delete conversation history automatically upon closing the chat
    setMessages([]);
    setInput('');
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    try {
      localStorage.removeItem('aegroshield_chat_history_v2');
      localStorage.removeItem('agrishield_chat_history');
    } catch (e) {}
  };

  // Auto-scroll to latest message on update or open, and handle Escape key to close
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleCloseChat();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [messages, isLoading, isOpen]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as Language;
    setLang(newLang);
  };

  const formatTime = () => {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  };

  // Keep messages in state during the active chat session (cleared upon close)
  const saveMessages = (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
  };

  const handleClearHistory = () => {
    setMessages([]);
    setInput('');
    try {
      localStorage.removeItem('aegroshield_chat_history_v2');
      localStorage.removeItem('agrishield_chat_history');
    } catch (e) {}
  };

  const handleSend = async (customQuery?: string) => {
    const rawText = (customQuery !== undefined ? customQuery : input).trim();
    if (!rawText) return;

    const cleanText = rawText.slice(0, 1000);
    const userTime = formatTime();
    const newMsg: ChatMessage = { role: 'user', text: cleanText, time: userTime };
    const updatedMessages = [...messages, newMsg];

    saveMessages(updatedMessages);
    if (!customQuery) setInput('');
    setIsLoading(true);

    // Direct match for Helpline queries
    const qLower = cleanText.toLowerCase();
    if (
      qLower.includes('helpline') ||
      qLower.includes('kisan helpline') ||
      qLower.includes('call') ||
      qLower.includes('contact') ||
      qLower.includes('whatsapp') ||
      qLower.includes('हेल्पलाइन') ||
      qLower.includes('कॉल')
    ) {
      setTimeout(() => {
        setIsLoading(false);
        const helplineCardText =
          lang === 'hi'
            ? `📞 **24/7 किसान सहायता हेल्पलाइन व व्हाट्सएप सेवा**\n\n• **टोल-फ्री किसान कॉल सेंटर**: 1800-180-1551\n• **आधिकारिक व्हाट्सएप डेस्क**: +91 98765 43210\n• **कार्य समय**: सुबह 8:00 से रात 8:00 (सभी 7 दिन)\n\nआप ऊपर दिए गए बटन से सीधे कॉल या व्हाट्सएप कर सकते हैं।`
            : lang === 'en'
            ? `📞 **24/7 Kisan Support Helpline & WhatsApp Desk**\n\n• **Toll-Free Helpline**: 1800-180-1551 (Kisan Call Centre)\n• **Official WhatsApp Helpdesk**: +91 98765 43210\n• **Operating Hours**: 8:00 AM – 8:00 PM (Monday to Sunday)\n\nYou can call or WhatsApp our official support desk directly using the buttons above.`
            : `📞 **24/7 Kisan Sahayata Helpline & WhatsApp Desk**\n\n• **Toll-Free Helpline**: 1800-180-1551 (Kisan Call Centre)\n• **Official WhatsApp Helpdesk**: +91 98765 43210\n• **Operating Hours**: 8:00 AM – 8:00 PM (Somvaar se Ravivaar)\n\nAap upar diye gaye buttons se seedhe Call ya WhatsApp kar sakte hain.`;

        const helplineCard: ChatMessage = {
          role: 'agent',
          text: helplineCardText,
          isHelpline: true,
          time: formatTime(),
        };
        saveMessages([...updatedMessages, helplineCard]);
      }, 350);
      return;
    }

    try {
      let token: string | undefined;
      try {
        token = await auth.currentUser?.getIdToken();
      } catch (authErr) {
        // guest mode
      }

      // Keep recent 10 messages for context
      const recentMessages = updatedMessages.slice(-10);
      const historyPayload = recentMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text.slice(0, 1000) }],
      }));

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: historyPayload,
          context: {
            language: lang,
            crop: 'All Crops',
            district: 'Local District',
            currentPage: pathname,
          },
        }),
      });

      const data = await res.json().catch(() => null);
      setIsLoading(false);

      if (data?.success && data.message) {
        const agentMsg: ChatMessage = {
          role: 'agent',
          text: data.message,
          time: formatTime(),
        };

        if (data.action?.type === 'navigate' && data.action.target) {
          router.push(data.action.target);
        }

        saveMessages([...updatedMessages, agentMsg]);
      } else {
        const fallbackText =
          data?.error ||
          (lang === 'hi'
            ? 'किसान सहायक फिलहाल ऑफलाइन है। किसी भी फसल या मंडी जानकारी हेतु टोल-फ्री किसान हेल्पलाइन 1800-180-1551 पर संपर्क करें।'
            : lang === 'en'
            ? 'Kisan Assistant is currently offline. For immediate farming or mandi guidance, please call Toll-Free Helpline: 1800-180-1551.'
            : 'Kisan Sahayak filhal offline hai. Kisi bhi fasal ya mandi jankari ke liye kripya Kisan Helpline: 1800-180-1551 par sampark karein.');

        saveMessages([
          ...updatedMessages,
          {
            role: 'agent',
            text: fallbackText,
            time: formatTime(),
          },
        ]);
      }
    } catch (e) {
      setIsLoading(false);
      const netErrorText =
        lang === 'hi'
          ? 'नेटवर्क संपर्क में समस्या आई। कृपया अपना इंटरनेट कनेक्शन जांचें या किसान हेल्पलाइन 1800-180-1551 पर कॉल करें।'
          : lang === 'en'
          ? 'Network connection issue. Please check your internet connection or call Toll-Free Helpline: 1800-180-1551.'
          : 'Network sambandh me samasya aayi. Kripya internet connection check karein ya Helpline: 1800-180-1551 par call karein.';

      saveMessages([
        ...updatedMessages,
        {
          role: 'agent',
          text: netErrorText,
          time: formatTime(),
        },
      ]);
    }
  };

  const WHATSAPP_URL = `https://wa.me/919876543210?text=${encodeURIComponent(
    lang === 'hi'
      ? 'नमस्ते AegroShield टीम! मुझे फसल परामर्श, खाद-बीज या मंडी भाव के बारे में सहायता चाहिए।'
      : lang === 'en'
      ? 'Hello AegroShield Team! I need assistance regarding crop advisory, farm inputs, or mandi rates.'
      : 'Namaste AegroShield Team! Mujhe fasal advisory, mandi rate ya order ke baare me jankari chahiye.'
  )}`;

  return (
    <div id="chatbotWidget" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {/* ── Single Unified Floating Launcher ── */}
      {!isOpen && (
        <button
          id="chatToggle"
          className="chat-toggle-pill"
          onClick={() => setIsOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 20px',
            borderRadius: '30px',
            background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
            boxShadow: '0 6px 20px rgba(21, 128, 61, 0.45)',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.9rem',
            transition: 'all 0.2s ease',
          }}
          title={t('chat.launcher')}
          aria-label={t('chat.launcher')}
        >
          <span style={{ fontSize: '1.2rem' }}>🌱</span>
          <span>{t('chat.launcher')}</span>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#4ade80',
              boxShadow: '0 0 6px #4ade80',
              display: 'inline-block',
            }}
          />
        </button>
      )}

      {/* ── Chat Window ── */}
      {isOpen && (
        <div
          id="chatWindow"
          className="chat-window open"
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '380px',
            maxWidth: '92vw',
            height: '590px',
            maxHeight: '85vh',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.22)',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
          }}
        >
          {/* Header Bar */}
          <div
            className="chat-header"
            style={{
              backgroundColor: '#15803d',
              color: '#ffffff',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem' }}>🌱</span>
              <div>
                <strong style={{ fontSize: '0.92rem', display: 'block', lineHeight: 1.2 }}>
                  {t('chat.title')}
                </strong>
                <span style={{ fontSize: '0.72rem', color: '#bbf7d0' }}>
                  {t('chat.status')}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Synchronized Platform Language Selector */}
              <select
                id="languageSelector"
                className="language-selector"
                value={lang}
                onChange={handleLanguageChange}
                aria-label="Select platform language"
                title="Change Platform Language"
                style={{
                  backgroundColor: '#166534',
                  color: '#ffffff',
                  border: '1px solid #22c55e',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  padding: '3px 6px',
                  cursor: 'pointer',
                  outline: 'none',
                  fontWeight: 600,
                }}
              >
                {LANGUAGE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value} style={{ background: '#166534', color: '#fff' }}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  title={t('chat.clear')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#bbf7d0',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Trash2 size={16} />
                </button>
              )}

              <button
                id="closeChat"
                className="close-btn"
                onClick={handleCloseChat}
                title="Close chat"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Integrated Kisan Helpline Direct Action Strip */}
          <div
            style={{
              backgroundColor: '#ecfdf5',
              borderBottom: '1px solid #bbf7d0',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              fontSize: '0.78rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#065f46', fontWeight: 600 }}>
              <Phone size={14} color="#059669" />
              <span>{t('chat.helpline')}</span>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <a
                href="tel:18001801551"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#047857',
                  border: '1px solid #a7f3d0',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: '0.74rem',
                }}
              >
                {t('chat.call')}
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: '0.74rem',
                }}
              >
                {t('chat.wa')}
              </a>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div
            id="messagesContainer"
            className="messages-container"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: '#f8fafc',
            }}
          >
            {/* Contextual Welcome Message when history is empty */}
            {messages.length === 0 && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  maxWidth: '90%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  color: '#1e293b',
                  fontSize: '0.86rem',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-line',
                }}
              >
                {WELCOME_MESSAGES[lang] || WELCOME_MESSAGES['hi-en']}
              </div>
            )}

            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  style={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    backgroundColor: isUser ? '#15803d' : '#ffffff',
                    color: isUser ? '#ffffff' : '#1e293b',
                    fontSize: '0.86rem',
                    lineHeight: '1.45',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    border: isUser ? 'none' : '1px solid #e2e8f0',
                    wordBreak: 'break-word',
                  }}
                >
                  <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>

                  {/* If message is a dedicated helpline response, show quick trigger buttons */}
                  {msg.isHelpline && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                      <a
                        href="tel:18001801551"
                        style={{
                          backgroundColor: '#15803d',
                          color: '#ffffff',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Phone size={12} /> {t('chat.call')} 1800-180-1551
                      </a>
                      <a
                        href={WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          backgroundColor: '#25D366',
                          color: '#ffffff',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {t('chat.wa')}
                      </a>
                    </div>
                  )}

                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.68rem',
                      color: isUser ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                      marginTop: '4px',
                      textAlign: isUser ? 'right' : 'left',
                    }}
                  >
                    {msg.time}
                  </span>
                </div>
              );
            })}

            {isLoading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#ffffff',
                  padding: '8px 14px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  color: '#15803d',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={14} className="spin" />
                <span>{t('chat.thinking')}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div
            style={{
              padding: '6px 10px',
              backgroundColor: '#f1f5f9',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            {(QUICK_ACTIONS[lang] || QUICK_ACTIONS['hi-en']).map(action => (
              <button
                key={action.label}
                type="button"
                onClick={() => handleSend(action.query)}
                style={{
                  padding: '4px 9px',
                  borderRadius: '14px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Listening Indicator Banner */}
          {isListening && (
            <div
              style={{
                backgroundColor: '#fee2e2',
                borderTop: '1px solid #fca5a5',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                color: '#b91c1c',
                fontWeight: 700,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#dc2626',
                    display: 'inline-block',
                    animation: 'pulse 1s infinite',
                  }}
                />
                <span>{t('chat.listening')}</span>
              </div>
              <button
                type="button"
                onClick={toggleVoiceInput}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#b91c1c',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                {t('chat.stop')}
              </button>
            </div>
          )}

          {/* User Input Bar */}
          <div
            className="input-area"
            style={{
              padding: '10px 12px',
              backgroundColor: '#ffffff',
              borderTop: isListening ? 'none' : '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <input
              type="text"
              id="userInput"
              className="user-input"
              placeholder={
                isListening
                  ? t('chat.listening')
                  : INPUT_PLACEHOLDERS[lang] || INPUT_PLACEHOLDERS['hi-en']
              }
              value={input}
              maxLength={1000}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              autoComplete="off"
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                border: isListening ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                fontSize: '0.86rem',
                outline: 'none',
              }}
            />

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              title={isListening ? t('chat.stop') : t('chat.voice_tip')}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: isListening ? '#fee2e2' : '#f0fdf4',
                border: isListening ? '1.5px solid #dc2626' : '1px solid #86efac',
                color: isListening ? '#dc2626' : '#15803d',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
            >
              {isListening ? <MicOff size={17} /> : <Mic size={17} />}
            </button>

            <button
              id="sendButton"
              className="send-btn"
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: input.trim() ? '#15803d' : '#94a3b8',
                border: 'none',
                color: '#ffffff',
                cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background-color 0.15s ease',
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
