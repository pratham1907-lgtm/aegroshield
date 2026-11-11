"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageCircle, X, Send, Phone, Trash2, ExternalLink, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';
import { auth } from '@/lib/firebase';

const LANGUAGE_NAMES: Record<string, string> = {
  'en': 'English',
  'hi': 'हिन्दी',
  'pa': 'ਪੰਜਾਬੀ',
  'hi-en': 'Hinglish',
  'te': 'తెలుగు',
  'ta': 'தமிழ்',
  'kn': 'ಕನ್ನಡ',
  'mr': 'मराठी',
  'gu': 'ગુજરાતી',
  'bn': 'বাংলা',
  'or': 'ଓଡ଼ିଆ',
  'ml': 'മലയാളം',
  'as': 'অসমীয়া',
  'ur': 'اردو',
};

const WELCOME_MESSAGES: Record<string, string> = {
  'en': "👋 Hello! I'm AegroShield AI Assistant.\n\nI can help you with:\n🌾 Crop disease, fertilizer & seed guidance\n📈 Today's live APMC Mandi rates\n🚜 Machinery rental (Tractors, Harvesters)\n👥 Hiring agricultural labour squads\n📞 24/7 Kisan Helpline & WhatsApp Support\n\nHow can I help you today?",
  'hi': "👋 नमस्ते! मैं AegroShield AI सहायक हूँ।\n\nमैं आपकी मदद कर सकता हूँ:\n🌾 फसल बीमारी, खाद और बीज की सही सलाह\n📈 आज के ताज़ा APMC मंडी भाव\n🚜 ट्रैक्टर व कृषि उपकरण किराया\n👥 खेत मजदूर दल खोजना\n📞 24/7 किसान हेल्पलाइन व व्हाट्सएप सहायता\n\nआज मैं आपकी क्या सहायता करूँ?",
  'pa': "👋 ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ AegroShield AI ਸਹਾਇਕ ਹਾਂ।\n\nਮੈਂ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ:\n🌾 ਫ਼ਸਲ ਬਿਮਾਰੀ, ਖਾਦ ਅਤੇ ਬੀਜ ਦੀ ਸਲਾਹ\n📈 ਅੱਜ ਦੇ ਤਾਜ਼ਾ ਮੰਡੀ ਭਾਅ\n🚜 ਟਰੈਕਟਰ ਅਤੇ ਮਸ਼ੀਨਰੀ ਕਿਰਾਇਆ\n👥 ਖੇਤ ਮਜ਼ਦੂਰ ਲੱਭਣਾ\n📞 24/7 ਕਿਸਾਨ ਹੈਲਪਲਾਈਨ ਅਤੇ ਵਟਸਐਪ ਸਹਾਇਤਾ\n\nਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰਾਂ?",
  'hi-en': "👋 Namaste! Main AegroShield AI Assistant hoon.\n\nMain aapki help kar sakta hoon:\n🌾 Fasal bimari, fertilizer aur seed guidance\n📈 Live APMC Mandi rates\n🚜 Tractor aur machinery rental\n👥 Khet majdoor squad booking\n📞 24/7 Kisan Helpline & WhatsApp Help\n\nAap kis cheez me jankari chahte hain?",
};

const INPUT_PLACEHOLDERS: Record<string, string> = {
  'en': 'Ask anything about crops, fertilizers, mandi...',
  'hi': 'फसल, खाद, दवाई या मंडी भाव के बारे में पूछें...',
  'pa': 'ਫ਼ਸਲ, ਖਾਦ ਜਾਂ ਮੰਡੀ ਭਾਅ ਬਾਰੇ ਪੁੱਛੋ...',
  'hi-en': 'Fasal, fertilizer, mandi bhav ke baare me poochhein...',
};

const QUICK_ACTIONS = [
  { label: '📞 Kisan Helpline', query: 'Kisan Helpline number aur contact details' },
  { label: '💬 WhatsApp Support', query: 'WhatsApp Helpline par support chahiye' },
  { label: '📈 Mandi Rates', query: 'Aaj ke taza mandi rates kya hain?' },
  { label: '🌾 Fasal Salah', query: 'Gehu aur dhaan me khad ki sahi matra kitni honi chahiye?' },
  { label: '🚜 Machinery', query: 'Tractor aur rotavator kiraye par kaise lein?' },
];

export interface ChatMessage {
  role: 'user' | 'agent';
  text: string;
  time: string;
  isHelpline?: boolean;
}

export default function Chatbot() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('hi-en');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history and language preference from localStorage on mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('agrishield_language') || localStorage.getItem('aegroshield_lang') || 'hi-en';
      setLanguage(savedLang);

      const savedHistory =
        localStorage.getItem('aegroshield_chat_history_v2') ||
        localStorage.getItem('agrishield_chat_history');

      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (e) {
      console.warn('[Chatbot] Error reading history from localStorage:', e);
    }
  }, []);

  // Auto-scroll to latest message on update or open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isLoading, isOpen]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    localStorage.setItem('agrishield_language', newLang);
  };

  const formatTime = () => {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  };

  const saveMessages = (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    try {
      localStorage.setItem('aegroshield_chat_history_v2', JSON.stringify(newMessages));
      localStorage.setItem('agrishield_chat_history', JSON.stringify(newMessages));
    } catch (e) {
      console.warn('[Chatbot] Failed to save history:', e);
    }
  };

  const handleClearHistory = () => {
    if (messages.length === 0) return;
    const confirmClear = window.confirm('Kya aap chat history saaf karna chahte hain? (Clear conversation history?)');
    if (!confirmClear) return;
    setMessages([]);
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
      qLower.includes('whatsapp')
    ) {
      setTimeout(() => {
        setIsLoading(false);
        const helplineCard: ChatMessage = {
          role: 'agent',
          text: `📞 **24/7 Kisan Sahayata Helpline & WhatsApp Desk**\n\n• **Toll-Free Helpline**: 1800-180-1551 (Kisan Call Centre)\n• **Official WhatsApp**: +91 98765 43210\n• **Direct Phone**: +91 99999 99999\n• **Operating Hours**: 8:00 AM – 8:00 PM (All 7 Days)\n\nAap niche diye gaye button se seedhe Call ya WhatsApp kar sakte hain.`,
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
            language: language,
            crop: 'All Crops',
            district: 'Local District',
            currentPage: pathname,
          },
        }),
      });

      const data = await res.json().catch(() => null);
      setIsLoading(false);

      if (data?.success && data.message) {
        if (data.action?.type === 'navigate') {
          router.push(data.action.target);
        }
        const agentMsg: ChatMessage = { role: 'agent', text: data.message, time: formatTime() };
        saveMessages([...updatedMessages, agentMsg]);
      } else {
        const fallbackText =
          data?.error ||
          'Kisan Sahayak filhal offline hai. Kisi bhi fasal ya mandi jankari ke liye kripya Kisan Helpline: 1800-180-1551 par sampark karein.';
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
      saveMessages([
        ...updatedMessages,
        {
          role: 'agent',
          text: 'Network sambandh me samasya aayi. Kripya apna internet connection check karein ya Toll-Free Helpline: 1800-180-1551 par call karein.',
          time: formatTime(),
        },
      ]);
    }
  };

  const WHATSAPP_URL = `https://wa.me/919999999999?text=${encodeURIComponent(
    'Namaste AegroShield Team! Mujhe fasal advisory, mandi rate ya order ke baare me jankari chahiye.'
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
          title="AegroShield AI & Kisan Helpline"
          aria-label="Open AI Chat & Kisan Helpline"
        >
          <span style={{ fontSize: '1.2rem' }}>🌱</span>
          <span>AI Sahayak &amp; Helpline</span>
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

      {/* ── Expanded Chat Window ── */}
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
                  AegroShield Assistant
                </strong>
                <span style={{ fontSize: '0.72rem', color: '#bbf7d0' }}>
                  AI Sahayak • Online
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                id="languageSelector"
                className="language-selector"
                value={language}
                onChange={handleLanguageChange}
                aria-label="Select language"
                style={{
                  backgroundColor: '#166534',
                  color: '#ffffff',
                  border: '1px solid #22c55e',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  padding: '3px 6px',
                  cursor: 'pointer',
                }}
              >
                {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                  <option key={code} value={code} style={{ background: '#166534', color: '#fff' }}>
                    {name}
                  </option>
                ))}
              </select>

              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  title="Clear conversation history (चैट साफ़ करें)"
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
                aria-label="Close chat"
                onClick={() => setIsOpen(false)}
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
                <X size={20} />
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
              <span>Helpline: <strong>1800-180-1551</strong></span>
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
                📞 Call
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
                💬 WhatsApp
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
            {/* Show Welcome Message ONLY when no history exists */}
            {messages.length === 0 && (
              <div
                className="welcome-message"
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '14px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.86rem',
                  lineHeight: 1.5,
                  color: '#1e293b',
                  whiteSpace: 'pre-wrap',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                {WELCOME_MESSAGES[language] || WELCOME_MESSAGES['hi-en']}
              </div>
            )}

            {/* Persistent Conversation History */}
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '100%',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '10px 14px',
                      borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      backgroundColor: isUser ? '#15803d' : '#ffffff',
                      color: isUser ? '#ffffff' : '#0f172a',
                      fontSize: '0.86rem',
                      lineHeight: 1.5,
                      border: isUser ? 'none' : '1px solid #e2e8f0',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.text}

                    {/* Rich Interactive Card if Helpline query */}
                    {msg.isHelpline && (
                      <div
                        style={{
                          marginTop: '10px',
                          paddingTop: '10px',
                          borderTop: '1px solid #cbd5e1',
                          display: 'flex',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <a
                          href="tel:18001801551"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: '#15803d',
                            color: '#ffffff',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          <Phone size={12} /> Call 1800-180-1551
                        </a>
                        <a
                          href={WHATSAPP_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: '#25D366',
                            color: '#ffffff',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          💬 Open WhatsApp
                        </a>
                      </div>
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: '0.68rem',
                      color: '#94a3b8',
                      marginTop: '3px',
                      padding: '0 4px',
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
                <span>AI soch raha hai...</span>
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
            {QUICK_ACTIONS.map(action => (
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

          {/* User Input Bar */}
          <div
            className="input-area"
            style={{
              padding: '10px 12px',
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <input
              type="text"
              id="userInput"
              className="user-input"
              placeholder={INPUT_PLACEHOLDERS[language] || INPUT_PLACEHOLDERS['hi-en']}
              value={input}
              maxLength={1000}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              autoComplete="off"
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.86rem',
                outline: 'none',
              }}
            />
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
