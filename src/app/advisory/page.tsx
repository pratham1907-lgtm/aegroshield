"use client";
import Link from "next/link";
export default function Page() {
  return (
    <main>
{/*  ── Navbar ────────────────────────────────────────────────  */}
  
  

{/*  ── Page Hero ─────────────────────────────────────────────  */}
<div className="page-hero">
  <div className="container" style={{"display":"flex","alignItems":"center","justifyContent":"space-between","flexWrap":"wrap","gap":"16px"}}>
    <div>
      <div className="page-hero-badge">📋 Crop Advisory</div>
      <h1>Action Plan — HIGH Risk Wheat</h1>
      <p>Personalised advisory for Yellow Rust prevention. Available in English and Hindi.</p>
    </div>
    <button id="langToggle">🔤 हिंदी में देखें</button>
  </div>

  <div className="hero-wave">
    <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
      <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.4,129.58,114.6,188.4,96.5,233.15,82.8,278.4,70.5,321.39,56.44Z" fill="#E8F3EC"></path>
    </svg>
  </div>
</div>
{/*  ── Advisory ──────────────────────────────────────────────  */}
<main className="advisory-layout">

  {/*  Top Bar  */}
  <div className="advisory-top-bar">
    <div className="atb-left">
      <div className="atb-crop-icon">🌾</div>
      <div>
        <div className="atb-crop-name">Wheat (Triticum aestivum)</div>
        <div className="atb-crop-sub">📍 Meerut, Uttar Pradesh · Flowering Stage</div>
      </div>
    </div>
    <div className="atb-risk">
      <div className="badge badge-danger" style={{"fontSize":".85rem","padding":"6px 16px","marginBottom":"6px"}}>⚠️ HIGH RISK — Score 72/100</div>
      <div style={{"fontSize":".82rem","color":"var(--gray-400)"}}>Disease: Yellow Rust · Updated: Today</div>
    </div>
  </div>

  <div id="advisoryContainer" className="advisory-grid">

    {/*  Card 1: Immediate Action  */}
    <div className="advisory-card">
      <div className="advisory-card-header red-bg">
        <div className="advisory-icon red">🚨</div>
        <div>
          <div style={{"fontWeight":"800","color":"var(--danger)"}}>
            <span className="en-text">Immediate Action Required</span>
            <span className="hi-text">तत्काल कार्रवाई जरूरी</span>
          </div>
          <div style={{"fontSize":".8rem","color":"#6b2d18","marginTop":"3px"}}>
            <span className="en-text">Within 48 hours</span>
            <span className="hi-text">48 घंटे के भीतर</span>
          </div>
        </div>
        <span className="advisory-badge ab-urgent">URGENT</span>
      </div>
      <div className="advisory-card-body">
        <ul>
          <li>
            <span className="en-text">Apply <strong>Propiconazole 25% EC</strong> @ 0.1% solution (1 ml per litre of water) — spray thoroughly covering all leaves.</span>
            <span className="hi-text"><strong>प्रोपिकोनाजोल 25% EC</strong> @ 0.1% घोल (1 मिली प्रति लीटर पानी) — सभी पत्तियों पर अच्छी तरह छिड़काव करें।</span>
          </li>
          <li>
            <span className="en-text">Spray in the morning (6–9 AM) or evening (4–7 PM) — avoid hot afternoon sun.</span>
            <span className="hi-text">सुबह 6–9 बजे या शाम 4–7 बजे छिड़काव करें — दोपहर की धूप में न करें।</span>
          </li>
          <li>
            <span className="en-text">Repeat spray after 14 days if risk remains above 60.</span>
            <span className="hi-text">यदि जोखिम 60 से अधिक रहे तो 14 दिन बाद फिर छिड़काव करें।</span>
          </li>
          <li>
            <span className="en-text">Use minimum 200 litres of water per acre for uniform coverage.</span>
            <span className="hi-text">एकसमान छिड़काव के लिए प्रति एकड़ कम से कम 200 लीटर पानी का उपयोग करें।</span>
          </li>
        </ul>
        <div className="timing-pills">
          <span className="timing-pill active">🌅 6–9 AM</span>
          <span className="timing-pill">☀️ Avoid 10–3 PM</span>
          <span className="timing-pill active">🌆 4–7 PM</span>
        </div>
      </div>
    </div>

    {/*  Card 2: Fungicide Recommendations  */}
    <div className="advisory-card">
      <div className="advisory-card-header amber-bg">
        <div className="advisory-icon amber">🧪</div>
        <div>
          <div style={{"fontWeight":"800","color":"var(--amber)"}}>
            <span className="en-text">Recommended Fungicides</span>
            <span className="hi-text">अनुशंसित फफूंदनाशक</span>
          </div>
          <div style={{"fontSize":".8rem","color":"#7a5010","marginTop":"3px"}}>
            <span className="en-text">Registered for Yellow Rust in India</span>
            <span className="hi-text">भारत में पीला रतुआ के लिए पंजीकृत</span>
          </div>
        </div>
        <span className="advisory-badge ab-warn">ACTION</span>
      </div>
      <div className="advisory-card-body">
        <ul>
          <li>
            <span className="en-text"><strong>Propiconazole 25% EC</strong> — 1 ml/L water · Most effective · ₹480/L</span>
            <span className="hi-text"><strong>प्रोपिकोनाजोल 25% EC</strong> — 1 मिली/लीटर पानी · सबसे प्रभावी · ₹480/लीटर</span>
          </li>
          <li>
            <span className="en-text"><strong>Tebuconazole 25.9% EC</strong> — 1 ml/L water · Systemic action · ₹550/L</span>
            <span className="hi-text"><strong>टेबुकोनाजोल 25.9% EC</strong> — 1 मिली/लीटर पानी · प्रणालीगत क्रिया · ₹550/लीटर</span>
          </li>
          <li>
            <span className="en-text"><strong>Hexaconazole 5% SC</strong> — 2 ml/L water · Good residual · ₹320/L</span>
            <span className="hi-text"><strong>हेक्साकोनाजोल 5% SC</strong> — 2 मिली/लीटर पानी · अच्छा अवशिष्ट प्रभाव · ₹320/लीटर</span>
          </li>
          <li>
            <span className="en-text">Do NOT mix two fungicides of the same chemical group — resistance risk.</span>
            <span className="hi-text">एक ही रासायनिक समूह के दो फफूंदनाशकों को न मिलाएं — प्रतिरोध का खतरा।</span>
          </li>
        </ul>
      </div>
    </div>

    {/*  Card 3: Prevention & Field Management  */}
    <div className="advisory-card">
      <div className="advisory-card-header green-bg">
        <div className="advisory-icon green">🌱</div>
        <div>
          <div style={{"fontWeight":"800","color":"var(--primary)"}}>
            <span className="en-text">Prevention & Field Management</span>
            <span className="hi-text">रोकथाम और खेत प्रबंधन</span>
          </div>
          <div style={{"fontSize":".8rem","color":"#2a5009","marginTop":"3px"}}>
            <span className="en-text">Ongoing best practices</span>
            <span className="hi-text">चल रही सर्वोत्तम प्रथाएं</span>
          </div>
        </div>
        <span className="advisory-badge ab-safe">ONGOING</span>
      </div>
      <div className="advisory-card-body">
        <ul>
          <li>
            <span className="en-text">Improve field drainage to reduce surface moisture — avoid waterlogging near crop roots.</span>
            <span className="hi-text">सतह की नमी कम करने के लिए खेत की जल निकासी बेहतर करें — फसल की जड़ों के पास जलजमाव से बचें।</span>
          </li>
          <li>
            <span className="en-text">Avoid overhead irrigation — use furrow or drip irrigation to keep leaves dry.</span>
            <span className="hi-text">सिंचाई ऊपर से न करें — पत्तियों को सूखा रखने के लिए नाली या ड्रिप सिंचाई का उपयोग करें।</span>
          </li>
          <li>
            <span className="en-text">Remove and destroy infected plant material — do not compost diseased material.</span>
            <span className="hi-text">संक्रमित पौधे की सामग्री हटाएं और नष्ट करें — रोगग्रस्त सामग्री को कंपोस्ट न करें।</span>
          </li>
          <li>
            <span className="en-text">Plant resistant varieties next season: HD-3086, PBW-550, GW-322.</span>
            <span className="hi-text">अगले मौसम में प्रतिरोधी किस्में लगाएं: HD-3086, PBW-550, GW-322।</span>
          </li>
        </ul>
      </div>
    </div>

    {/*  Card 4: Weather Watch & Follow-up  */}
    <div className="advisory-card">
      <div className="advisory-card-header blue-bg">
        <div className="advisory-icon blue">📡</div>
        <div>
          <div style={{"fontWeight":"800","color":"#0066cc"}}>
            <span className="en-text">Weather Watch & Next Steps</span>
            <span className="hi-text">मौसम निगरानी और अगले कदम</span>
          </div>
          <div style={{"fontSize":".8rem","color":"#004499","marginTop":"3px"}}>
            <span className="en-text">Monitor & adjust</span>
            <span className="hi-text">निगरानी करें और समायोजन करें</span>
          </div>
        </div>
        <span className="advisory-badge" style={{"background":"#0066cc","color":"#fff"}}>MONITOR</span>
      </div>
      <div className="advisory-card-body">
        <ul>
          <li>
            <span className="en-text">Check your Aegroshield dashboard daily — risk score updates with live weather data.</span>
            <span className="hi-text">अपना Aegroshield डैशबोर्ड रोज देखें — जोखिम स्कोर लाइव मौसम डेटा से अपडेट होता है।</span>
          </li>
          <li>
            <span className="en-text">If humidity stays above 80% for 3+ consecutive days — re-spray is mandatory.</span>
            <span className="hi-text">यदि 3+ लगातार दिनों तक आर्द्रता 80% से अधिक रहे — पुनः छिड़काव अनिवार्य है।</span>
          </li>
          <li>
            <span className="en-text">Visit nearest KVK (Krishi Vigyan Kendra) if disease spreads to 20%+ of plants.</span>
            <span className="hi-text">यदि रोग 20%+ पौधों में फैल जाए तो नजदीकी KVK (कृषि विज्ञान केंद्र) जाएं।</span>
          </li>
          <li>
            <span className="en-text">File crop insurance claim via PM Fasal Bima if losses exceed 25% — deadline 72 hrs.</span>
            <span className="hi-text">यदि नुकसान 25% से अधिक हो तो PM फसल बीमा दावा दर्ज करें — समय सीमा 72 घंटे।</span>
          </li>
        </ul>
        <div className="timing-pills" style={{"marginTop":"14px"}}>
          <span className="timing-pill active">📱 Check Daily</span>
          <span className="timing-pill">🏢 KVK Helpline: 1800-180-1551</span>
        </div>
      </div>
    </div>

  </div>{/*  /#advisoryContainer  */}

  {/*  Print / Share Bar  */}
  <div className="print-bar">
    <div>
      <div style={{"fontWeight":"700","color":"var(--primary)"}}>📤 Share this advisory</div>
      <div style={{"fontSize":".85rem","color":"var(--gray-400)"}}>Download PDF or share via WhatsApp with other farmers</div>
    </div>
    <div style={{"display":"flex","gap":"12px","flexWrap":"wrap"}}>
      <a href="/dashboard" className="btn btn-outline">← Back to Dashboard</a>
      <button className="btn btn-mid" onClick={() => {}}>🖨️ Print / Save PDF</button>
      <a href="/predict" className="btn btn-primary">🔄 New Prediction</a>
    </div>
  </div>

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
