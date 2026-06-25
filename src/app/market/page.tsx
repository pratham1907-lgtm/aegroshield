"use client";
import Link from "next/link";
export default function Page() {
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
          <option defaultValue="Wheat" selected>🌾 Wheat (गेहूँ)</option>
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
      🗓️ Showing prices for: <span id="todayDateLabel"></span>
      &nbsp;·&nbsp; Source: Agmarknet / eNAM
    </div>
  </div>

  {/*  ── Price Results ─────────────────────────────────────────  */}
  <div id="priceResults">

    {/*  Best Price Banner  */}
    <div className="best-price-banner">
      <div className="bp-left">
        <div className="bp-label">🏆 Best Nearby Price Today</div>
        <div className="bp-price">₹2,340 <small>/ quintal</small></div>
        <div className="bp-mandi">📍 Meerut Grain Market</div>
        <span className="bp-badge">✅ Highest nearby price · 4.2 km away</span>
      </div>
      <div className="bp-right">
        <div className="bp-stat">
          <strong>₹2,275</strong>
          Government MSP
        </div>
        <div className="bp-stat">
          <strong>+₹65 above MSP</strong>
          Premium today
        </div>
        <div className="bp-stat">
          <strong>▲ 2.3%</strong>
          vs. Yesterday
        </div>
      </div>
    </div>

    {/*  Mandi Comparison Cards  */}
    <div style={{"fontWeight":"800","fontSize":"1.05rem","color":"var(--gray-800)","marginBottom":"14px"}}>
      📊 Nearby Mandi Comparison — Wheat, Meerut District
    </div>
    <div className="mandi-grid">

      {/*  Meerut — Best  */}
      <div className="mandi-card best-mandi">
        <div className="mandi-card-head">
          <div>
            <div className="mandi-name">Meerut Grain Market</div>
            <div className="mandi-dist">📍 4.2 km away</div>
          </div>
          <div style={{"display":"flex","flexDirection":"column","gap":"6px","alignItems":"flex-end"}}>
            <span className="mandi-best-badge">★ BEST</span>
            <span className="trend-tag trend-up">▲ 2.3% from yesterday</span>
          </div>
        </div>
        <div className="price-row">
          <div className="price-box">
            <div className="price-box-val">₹2,180</div>
            <div className="price-box-lbl">Min</div>
          </div>
          <div className="price-divider"></div>
          <div className="price-box">
            <div className="price-box-val modal">₹2,340</div>
            <div className="price-box-lbl">Modal ★</div>
          </div>
          <div className="price-divider"></div>
          <div className="price-box">
            <div className="price-box-val">₹2,410</div>
            <div className="price-box-lbl">Max</div>
          </div>
        </div>
        <div style={{"fontSize":".8rem","color":"var(--gray-400)","marginTop":"6px"}}>
          🕐 Last arrival: Today 7:30 AM &nbsp;·&nbsp; Lots traded: 38
        </div>
      </div>

      {/*  Hapur  */}
      <div className="mandi-card">
        <div className="mandi-card-head">
          <div>
            <div className="mandi-name">Hapur Mandi</div>
            <div className="mandi-dist">📍 18 km away</div>
          </div>
          <span className="trend-tag trend-up">▲ 1.1% from yesterday</span>
        </div>
        <div className="price-row">
          <div className="price-box">
            <div className="price-box-val">₹2,100</div>
            <div className="price-box-lbl">Min</div>
          </div>
          <div className="price-divider"></div>
          <div className="price-box">
            <div className="price-box-val modal">₹2,240</div>
            <div className="price-box-lbl">Modal</div>
          </div>
          <div className="price-divider"></div>
          <div className="price-box">
            <div className="price-box-val">₹2,300</div>
            <div className="price-box-lbl">Max</div>
          </div>
        </div>
        <div style={{"fontSize":".8rem","color":"var(--gray-400)","marginTop":"6px"}}>
          🕐 Last arrival: Today 8:15 AM &nbsp;·&nbsp; Lots traded: 22
        </div>
      </div>

      {/*  Ghaziabad  */}
      <div className="mandi-card">
        <div className="mandi-card-head">
          <div>
            <div className="mandi-name">Ghaziabad APMC</div>
            <div className="mandi-dist">📍 32 km away</div>
          </div>
          <span className="trend-tag trend-down">▼ 0.8% from yesterday</span>
        </div>
        <div className="price-row">
          <div className="price-box">
            <div className="price-box-val">₹2,050</div>
            <div className="price-box-lbl">Min</div>
          </div>
          <div className="price-divider"></div>
          <div className="price-box">
            <div className="price-box-val modal">₹2,200</div>
            <div className="price-box-lbl">Modal</div>
          </div>
          <div className="price-divider"></div>
          <div className="price-box">
            <div className="price-box-val">₹2,280</div>
            <div className="price-box-lbl">Max</div>
          </div>
        </div>
        <div style={{"fontSize":".8rem","color":"var(--gray-400)","marginTop":"6px"}}>
          🕐 Last arrival: Today 9:00 AM &nbsp;·&nbsp; Lots traded: 14
        </div>
      </div>

      {/*  Bulandshahr  */}
      <div className="mandi-card">
        <div className="mandi-card-head">
          <div>
            <div className="mandi-name">Bulandshahr Mandi</div>
            <div className="mandi-dist">📍 47 km away</div>
          </div>
          <span className="trend-tag trend-up">▲ 1.8% from yesterday</span>
        </div>
        <div className="price-row">
          <div className="price-box">
            <div className="price-box-val">₹2,220</div>
            <div className="price-box-lbl">Min</div>
          </div>
          <div className="price-divider"></div>
          <div className="price-box">
            <div className="price-box-val modal">₹2,310</div>
            <div className="price-box-lbl">Modal</div>
          </div>
          <div className="price-divider"></div>
          <div className="price-box">
            <div className="price-box-val">₹2,380</div>
            <div className="price-box-lbl">Max</div>
          </div>
        </div>
        <div style={{"fontSize":".8rem","color":"var(--gray-400)","marginTop":"6px"}}>
          🕐 Last arrival: Today 7:45 AM &nbsp;·&nbsp; Lots traded: 29
        </div>
      </div>

    </div>{/*  .mandi-grid  */}

    {/*  Sell Suggestion Banner  */}
    <div id="sellSuggestion" className="suggest-sell">
      <div className="ss-icon">✅</div>
      <div className="ss-text">
        <div className="ss-title">Sell Now — Prices are above MSP and trending up</div>
        <div className="ss-sub">Best mandi: Meerut Grain Market (4.2 km away) · Modal ₹2,340/quintal · ₹65 above MSP · Prices forecast to dip slightly over next 3 days</div>
      </div>
    </div>

    {/*  ── 30-Day Price Chart ───────────────────────────────────  */}
    <div className="chart-section">
      <div className="chart-section-head">
        <div>
          <h2>📈 30-Day Price Trend — Wheat, Meerut</h2>
          <p>Daily modal prices at Meerut Grain Market · Last 30 days</p>
        </div>
        <div className="chart-legend">
          <div className="cl-row"><div className="cl-line"></div> Modal Price</div>
          <div className="cl-row"><div className="cl-dash"></div> MSP ₹2,275</div>
        </div>
      </div>

      <canvas id="priceChart" height="90"></canvas>

      <p className="chart-note">
        MSP = Minimum Support Price set by the Government of India for Wheat (Rabi 2025-26) ·
        Prices sourced from Agmarknet · Updated daily at 6 PM
      </p>
    </div>

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
