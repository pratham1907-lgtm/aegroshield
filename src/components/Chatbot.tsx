"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageCircle, X, Send } from 'lucide-react';

const LANGUAGE_NAMES = {
  'en': 'English', 'hi': 'हिन्दी', 'pa': 'ਪੰਜਾਬੀ', 'hi-en': 'Hinglish', 'te': 'తెలుగు',
  'ta': 'தமிழ்', 'kn': 'ಕನ್ನಡ', 'mr': 'मराठी', 'gu': 'ગુજરાતી', 'bn': 'বাংলা',
  'or': 'ଓଡ଼ିଆ', 'ml': 'മലയാളം', 'as': 'অসমীয়া', 'ur': 'اردو', 'sd': 'سندھی'
};

const WELCOME_MESSAGES = {
  'en': "👋 Hello! I'm Aegroshield Assistant.\n\nI can help you with:\n🛡️ Crop disease prediction\n🚜 Machinery booking\n👥 Labour finding\n📈 Market prices\n🧪 Fertilizer & pesticide calculations\n\nWhat would you like help with?",
  'hi': "👋 नमस्ते! मैं Aegroshield सहायक हूँ।\n\nमैं आपकी मदद कर सकता हूँ:\n🛡️ फसल की बीमारी की भविष्यवाणी\n🚜 मशीन किराया\n👥 मजदूर खोजना\n📈 बाजार भाव\n🧪 खाद और कीटनाशक की गणना\n\nआप किसमें मदद चाहते हैं?",
  'pa': "👋 ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ Aegroshield ਸਹਾਇਕ ਹਾਂ।\n\nਮੈਂ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ:\n🛡️ ਫਸਲ ਦਾ ਰੋਗ ਪূਰਵ ਅਨੁਮਾਨ\n🚜 ਮਸ਼ੀਨ ਕਿਰਾਇਆ\n👥 ਮਜ਼ਦੂਰ ਢੂੰਢਣਾ\n📈 ਬਾਜ਼ਾਰ ਭਾਅ\n🧪 ਖਾਦ ਅਤੇ ਕੀਟਨਾਸ਼ਕ ਦੀ ਗਣਨਾ\n\nਤੁਸੀਂ ਕਿਸ ਵਿੱਚ ਮਦਦ ਚਾਹੁੰਦੇ ਹੋ?",
  'hi-en': "👋 Hey! Mein Aegroshield Assistant hoon.\n\nMain aapki madad kar sakta hoon:\n🛡️ Crop disease prediction\n🚜 Machinery booking\n👥 Majdoor dhundna\n📈 Market prices\n🧪 Fertilizer & pesticide calculation\n\nKya main aapki madad kar sakta hoon?"
};

const INPUT_PLACEHOLDERS = {
  'en': 'Type your question in English...', 
  'hi': 'अपना सवाल हिंदी में लिखें...',
  'pa': 'ਆਪਣਾ ਸਵਾਲ ਪੰਜਾਬੀ ਵਿਚ ਲਿਖੋ...', 
  'hi-en': 'Apna sawal Hindi ya English mein likho...'
};

type Message = {
  role: 'user' | 'agent';
  text: string;
  time: string;
};

export default function Chatbot() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load state on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('agrishield_language') || 'en';
    setLanguage(savedLang);
    const savedHistory = localStorage.getItem('agrishield_chat_history');
    if (savedHistory) {
      setMessages(JSON.parse(savedHistory));
    }
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const saveMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
    localStorage.setItem('agrishield_chat_history', JSON.stringify(newMessages));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userTime = formatTime();
    const newMsg: Message = { role: 'user', text: input.trim(), time: userTime };
    const updatedMessages = [...messages, newMsg];
    
    saveMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    let cropContext = 'Unknown';
    let districtContext = 'Unknown';
    try {
      const diagData = JSON.parse(sessionStorage.getItem('agriDiagnosisData') || '{}');
      if (diagData.liveData) {
        cropContext = diagData.liveData.crop || 'Unknown';
        districtContext = diagData.district || 'Unknown';
      }
    } catch (e) {}

    try {
      const historyPayload = updatedMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          context: {
            language: language,
            crop: cropContext,
            district: districtContext,
            currentPage: pathname
          }
        })
      });
      
      const data = await res.json();
      setIsLoading(false);
      
      if (data.success) {
        if (data.action?.type === 'navigate') {
          router.push(data.action.target);
        }
        const agentMsg: Message = { role: 'agent', text: data.message, time: formatTime() };
        saveMessages([...updatedMessages, agentMsg]);
      } else {
        saveMessages([...updatedMessages, { role: 'agent', text: 'Error connecting to server. Please try again later.', time: formatTime() }]);
      }
    } catch (e) {
      setIsLoading(false);
      saveMessages([...updatedMessages, { role: 'agent', text: 'Network error. Please check your connection.', time: formatTime() }]);
    }
  };

  return (
    <div id="chatbotWidget">
      {!isOpen && (
        <button id="chatToggle" className="chat-toggle" title="Chat with Aegroshield AI" aria-label="Open chat" onClick={() => setIsOpen(true)}>
          <MessageCircle size={28} color="white" />
        </button>
      )}

      {isOpen && (
        <div id="chatWindow" className="chat-window" style={{ display: 'flex' }}>
          <div className="chat-header">
            <span className="chat-title">🌱 Aegroshield Assistant</span>
            <select id="languageSelector" className="language-selector" value={language} onChange={handleLanguageChange} aria-label="Select language">
              {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
            <button id="closeChat" className="close-btn" aria-label="Close chat" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>
          
          <div id="messagesContainer" className="messages-container">
            <div className="welcome-message" id="welcomeMsg" style={{ whiteSpace: 'pre-wrap' }}>
              {(WELCOME_MESSAGES as any)[language] || WELCOME_MESSAGES['en']}
            </div>
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-text" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                <div className="timestamp">{msg.time}</div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message agent loading-indicator" id="loadingDots">
                <div className="message-text"><span>.</span><span>.</span><span>.</span></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="input-area">
            <input 
              type="text" 
              id="userInput" 
              className="user-input" 
              placeholder={(INPUT_PLACEHOLDERS as any)[language] || INPUT_PLACEHOLDERS['en']}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              autoComplete="off" 
            />
            <button id="sendButton" className="send-btn" onClick={handleSend}>
              <Send size={18} color="white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
