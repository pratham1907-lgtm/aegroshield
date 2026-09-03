"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Page() {
  const { user, userData, isDemo } = useAuth();
  const [liveMandiRates, setLiveMandiRates] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !isDemo) {
      setLoading(true);
      const fetchMandiRates = async () => {
        try {
          const snap1 = await getDocs(collection(db, 'mandi_rates'));
          const snap2 = await getDocs(collection(db, 'marketPrices'));
          const items: any[] = [];
          snap1.forEach(d => items.push({ id: d.id, ...d.data() }));
          snap2.forEach(d => items.push({ id: d.id, ...d.data() }));
          setLiveMandiRates(items);
        } catch (err) {
          console.warn("[Market] Error fetching Firestore mandi rates:", err);
          setLiveMandiRates([]);
        } finally {
          setLoading(false);
        }
      };
      fetchMandiRates();
    } else {
      setLiveMandiRates(null);
    }
  }, [user, isDemo]);

  const isRealAccount = Boolean(user && !isDemo);

  return (
    <main>
{/*  ── Navbar ────────────────────────────────────────────────  */}
  
  

{/*  ── Page Hero ─────────────────────────────────────────────  */}
<div className="page-hero">
  <div className="container">
    <div className="page-hero-badge">📈 Live Mandi Rates</div>
    <h1>Live Mandi Prices</h1>
    <p>Check today's prices across nearby mandis and decide when and where to sell</p>
  </div>

  <div className="hero-wave">
    <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
      <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.4,129.58,114.6,188.4,96.5,233.15,82.8,278.4,70.5,321.39,56.44Z" fill="#E8F3EC"></path>
    </svg>
  </div>
</div>
{/*  ── Main ──────────────────────────────────────────────────  */}
<main className="market-layout">

  {/*  Stats Strip  */}
  <div className="stats-strip">
    <div className="stat-card">
      <div className="stat-icon green">📊</div>
      <div><div className="stat-label">Mandis Tracked</div><div className="stat-value">2,840</div><div className="stat-sub">Across India</div></div>
    </div>
    <div className="stat-card">
      <div className="stat-icon amber">🔄</div>
      <div><div className="stat-label">Last Updated</div><div className="stat-value">2 min ago</div><div className="stat-sub">Live data</div></div>
    </div>
    <div className="stat-card">
      <div className="stat-icon blue">📦</div>
      <div><div className="stat-label">Crops Tracked</div><div className="stat-value">280+</div><div className="stat-sub">All varieties</div></div>
    </div>
    <div className="stat-card">
      <div className="stat-icon green">🎯</div>
      <div><div className="stat-label">Signal Accuracy</div><div className="stat-value">89%</div><div className="stat-sub">7-day forecast</div></div>
    </div>
  </div>

  {/*  ── Search Card ───────────────────────────────────────────  */}
  <div className="search-card">
    <h3>🔍 Search Mandi Prices</h3>
    <div className="search-row">
      <div className="form-group">
        <label className="form-label" htmlFor="priceCrop">Crop</label>
        <select className="form-control" id="priceCrop">
          <option defaultValue="Wheat">🌾 Wheat (गेहूँ)</option>
          <option defaultValue="Rice">🌾 Rice (चावल)</option>
          <option defaultValue="Tomato">🍅 Tomato (टमाटर)</option>
          <option defaultValue="Onion">🧅 Onion (प्याज)</option>
          <option defaultValue="Potato">🥔 Potato (आलू)</option>
          <option defaultValue="Cotton">🌿 Cotton (कपास)</option>
          <option defaultValue="Mustard">🌻 Mustard (सरसों)</option>
          <option defaultValue="Soybean">🫘 Soybean (सोयाबीन)</option>
          <option defaultValue="Maize">🌽 Maize (मक्का)</option>
          <option defaultValue="Chickpea">🫘 Chickpea (चना)</option>
          <option defaultValue="Sugarcane">🌿 Sugarcane (गन्ना)</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="priceState">State</label>
        <select className="form-control" id="priceState">
          <option defaultValue="" disabled>Select state…</option>
          <option>Andhra Pradesh</option><option>Arunachal Pradesh</option>
          <option>Assam</option><option>Bihar</option><option>Chhattisgarh</option>
          <option>Goa</option><option>Gujarat</option><option>Haryana</option>
          <option>Himachal Pradesh</option><option>Jharkhand</option>
          <option>Karnataka</option><option>Kerala</option>
          <option>Madhya Pradesh</option><option>Maharashtra</option>
          <option>Manipur</option><option>Meghalaya</option><option>Mizoram</option>
          <option>Nagaland</option><option>Odisha</option><option>Punjab</option>
          <option>Rajasthan</option><option>Sikkim</option><option>Tamil Nadu</option>
          <option>Telangana</option><option>Tripura</option>
          <option>Uttar Pradesh</option><option>Uttarakhand</option>
          <option>West Bengal</option><option>Delhi</option>
          <option>Jammu &amp; Kashmir</option><option>Ladakh</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="priceDistrict">District</label>
        <input type="text" className="form-control" id="priceDistrict" placeholder="Your district" defaultValue="Meerut" />
      </div>
      <div style={{"display":"flex","alignItems":"flex-end"}}>
        <button className="btn btn-primary" id="fetchPrices"
          style={{"whiteSpace":"nowrap","padding":"11px 24px"}}
          onClick={() => {}}>
          Get Live Prices →
        </button>
      </div>
    </div>
    <div className="today-label">
      🗓️ Showing prices for: <span id="todayDateLabel">Today</span>
      &nbsp;·&nbsp; Source: Agmarknet / eNAM
    </div>
  </div>

  {/*  ── Price Results ─────────────────────────────────────────  */}
  <div id="priceResults">
    {liveMandiRates && liveMandiRates.length > 0 ? (
      <div className="mandi-grid">
        {liveMandiRates.map((item, idx) => (
          <div key={item.id || idx} className="mandi-card">
            <div className="mandi-card-head">
              <div>
                <div className="mandi-name">{item.mandiName || item.marketName || 'Local Mandi'}</div>
                <div className="mandi-dist">📍 {item.district || 'District'}</div>
              </div>
              <span className="trend-tag trend-up">▲ Live Rate</span>
            </div>
            <div className="price-row">
              <div className="price-box">
                <div className="price-box-val">₹{item.minPrice || 2100}</div>
                <div className="price-box-lbl">Min</div>
              </div>
              <div className="price-divider"></div>
              <div className="price-box">
                <div className="price-box-val modal">₹{item.modalPrice || 2300}</div>
                <div className="price-box-lbl">Modal</div>
              </div>
              <div className="price-divider"></div>
              <div className="price-box">
                <div className="price-box-val">₹{item.maxPrice || 2450}</div>
                <div className="price-box-lbl">Max</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div style={{ padding: '48px 24px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1', margin: '20px 0' }}>
        <div style={{ fontSize: '2.8rem', marginBottom: '12px' }}>📈</div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>Live Mandi Rates Updating...</h3>
        <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: '440px', margin: '0 auto 16px' }}>
          No custom Mandi price submissions recorded for your district yet. Official Agmarknet & eNAM feeds refresh live.
        </p>
      </div>
    )}
  </div>{/*  #priceResults  */}

</main>

{/*  ── Footer ────────────────────────────────────────────────  */}
  <footer>
    <div className="container">
      <p style={{"fontSize":"16px","fontWeight":"600","marginBottom":"16px"}}>Aegroshield — Smart Farming Platform | Made for Indian Farmers 🇮🇳</p>
      <div className="footer-links">
        <a href="/">Home</a>
        <a href="/predict">Diagnose Crop</a>
        <a href="/machinery">Machinery</a>
        <a href="/labour">Labour</a>
        <a href="/market">Market Price</a>
        <a href="/calculator">Calculator</a>
      </div>
      <p className="footer-copy">&copy; 2026 Aegroshield. All rights reserved.</p>
    </div>
  </footer>




{/*  ── Firebase Analytics ──────────────────────────────────  */}





{/*  ── Aegroshield AI Chatbot Widget ──  */}
<div id="chatbotWidget">
  <button id="chatToggle" className="chat-toggle" title="Chat with Aegroshield AI" aria-label="Open chat">💬</button>
  <div id="chatWindow" className="chat-window">
    <div className="chat-header">
      <span className="chat-title">🌱 Aegroshield Assistant</span>
      <select id="languageSelector" className="language-selector" aria-label="Select language">
        <option defaultValue="en">English</option>
        <option defaultValue="hi">हिन्दी</option>
        <option defaultValue="pa">ਪੰਜਾਬੀ</option>
        <option defaultValue="hi-en">Hinglish</option>
        <option defaultValue="te">తెలుగు</option>
        <option defaultValue="ta">தமிழ்</option>
        <option defaultValue="kn">ಕನ್ನಡ</option>
        <option defaultValue="mr">मराठी</option>
        <option defaultValue="gu">ગુજરાતી</option>
        <option defaultValue="bn">বাংলা</option>
        <option defaultValue="or">ଓଡ଼ିଆ</option>
        <option defaultValue="ml">മലയാളം</option>
        <option defaultValue="as">অসমীয়া</option>
        <option defaultValue="ur">اردو</option>
        <option defaultValue="sd">سندھی</option>
      </select>
      <button id="closeChat" className="close-btn" aria-label="Close chat">✕</button>
    </div>
    <div id="messagesContainer" className="messages-container">
      <div className="welcome-message" id="welcomeMsg"></div>
    </div>
    <div className="input-area">
      <input type="text" id="userInput" className="user-input" placeholder="Type your question..." autoComplete="off" aria-label="Chat input" />
      <button id="sendButton" className="send-btn" aria-label="Send message">➤</button>
    </div>
  </div>
</div>



    </main>
  );
}
