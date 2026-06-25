import Link from "next/link";
export default function Home() {
  return (
    <main>
{/*  */}
<section className="hero">
  <div className="hero-inner">
    {/*  */}
    <div>
      <div className="hero-tag"><span></span> Free for Every Indian Farmer 🇮🇳</div>
      <h1>Smart Farming —<br /><em>All Tools in</em><br />One Place</h1>
      <p className="hero-sub">
        Disease risk prediction, machinery booking, labour finding, live mandi prices, and input calculators — completely free for every Indian farmer.
      </p>
      <div className="hero-actions">
        <a href="/predict" className="btn btn-primary btn-lg">
          🌿 Check Crop Disease Risk →
        </a>
        <a href="#features" className="btn btn-outline btn-lg">Explore Tools</a>
      </div>
      <div className="hero-trust">
        <div className="trust-avatars">
          <span>रा</span><span>सु</span><span>मो</span><span>गी</span><span>+</span>
        </div>
        <p className="trust-text"><strong>50,000+ farmers</strong> already using Aegroshield across 18 states</p>
      </div>
    </div>
    
    {/*  */}
    <div className="hero-visual">
      <a href="/predict" className="hero-card-main pipeline-card" style={{"display":"flex","flexDirection":"column","gap":"16px","cursor":"pointer","color":"inherit","textDecoration":"none","maxWidth":"420px","width":"100%"}}>
        <div style={{"fontWeight":"800","color":"var(--primary)","fontSize":"1.1rem","borderBottom":"1.5px solid var(--gray-100)","paddingBottom":"10px","marginBottom":"4px","display":"flex","alignItems":"center","gap":"8px"}}>
          <span>🌿 AI Live Diagnosis</span>
          <span className="badge" style={{"fontSize":"0.72rem","padding":"4px 8px","borderRadius":"6px","marginLeft":"auto","display":"flex","alignItems":"center","gap":"4px","background":"var(--gray-50)","color":"var(--gray-800)","border":"1px solid var(--gray-200)","textTransform":"none","letterSpacing":"normal"}}>
            🌤️ 31°C • 84% Humid
          </span>
        </div>

        {/*  */}
        <div className="pipeline-step">
          <div className="step-icon-box green">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
          </div>
          <div className="step-content">
            <div className="step-label">Step 1</div>
            <h4 className="step-title">Snap Leaf Image</h4>
            <p className="step-desc">Upload a photo of the infected crop leaf from your field.</p>
          </div>
          <div className="step-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
        </div>

        {/*  */}
        <div className="pipeline-step">
          <div className="step-icon-box green">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3"/><path d="M15 1v3"/><path d="M9 20v3"/><path d="M15 20v3"/><path d="M20 9h3"/><path d="M20 15h3"/><path d="M1 9h3"/><path d="M1 15h3"/></svg>
          </div>
          <div className="step-content">
            <div className="step-label">Step 2</div>
            <h4 className="step-title">AI Hybrid Analysis</h4>
            <p className="step-desc">Computer Vision scans patterns while blending live weather data.</p>
          </div>
          <div className="step-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
        </div>

        {/*  */}
        <div className="pipeline-step highlighted">
          <div className="step-icon-box orange">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div className="step-content">
            <div className="step-label orange">Step 3</div>
            <h4 className="step-title">Instant Advisory Shield</h4>
            <p className="step-desc">Receive verified scientific treatment plans to save your crops.</p>
          </div>
          <div className="step-arrow orange">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
        </div>
      </a>
      <div className="hero-badge-float hbf-1">✅ 94% Accuracy</div>
    </div>
  </div>
</section>

{/*  */}
<div className="stats-banner">
  <div className="sb-item">
    <div className="sb-num">50K+</div>
    <div className="sb-lbl">Farmers Served</div>
  </div>
  <div className="sb-item">
    <div className="sb-num">18</div>
    <div className="sb-lbl">States Covered</div>
  </div>
  <div className="sb-item">
    <div className="sb-num">9</div>
    <div className="sb-lbl">Major Crops</div>
  </div>
  <div className="sb-item">
    <div className="sb-num">94%</div>
    <div className="sb-lbl">Prediction Accuracy</div>
  </div>
</div>

{/*  */}
<section className="features-section" id="features">
  <div className="container">
    <div style={{"textAlign":"center","marginBottom":"0"}}>
      <p className="page-hero-badge" style={{"background":"#e8f5d6","color":"var(--primary)","display":"inline-flex","marginBottom":"14px"}}>
        🌱 Platform Features
      </p>
      <h2 className="section-title" style={{"textAlign":"center"}}>Everything a Farmer Needs</h2>
      <p className="section-sub" style={{"textAlign":"center","maxWidth":"540px","margin":"0 auto 48px"}}>
        Five powerful tools, one simple platform — designed for the Indian farmer.
      </p>
    </div>
    <div className="features-grid">
      <a href="/predict" className="feature-card">
        <div className="feature-icon-circle">🌿</div>
        <h3>Crop Disease Diagnosis</h3>
        <p>Predict crop disease before symptoms appear using weather data and AI models.</p>
        <span className="fc-arrow">Predict Now →</span>
      </a>
      <a href="/machinery" className="feature-card">
        <div className="feature-icon-circle">🚜</div>
        <h3>Machinery Booking</h3>
        <p>Book tractors and harvesters from nearby Custom Hiring Centres (CHCs).</p>
        <span className="fc-arrow">Browse Equipment →</span>
      </a>
      <a href="/labour" className="feature-card">
        <div className="feature-icon-circle">👥</div>
        <h3>Labour Board</h3>
        <p>Find available farm workers in your area — post or respond to job listings.</p>
        <span className="fc-arrow">Find Workers →</span>
      </a>
      <a href="/market" className="feature-card">
        <div className="feature-icon-circle">📈</div>
        <h3>Market Prices</h3>
        <p>Live mandi rates with intelligent sell or wait recommendation for your crop.</p>
        <span className="fc-arrow">Check Rates →</span>
      </a>
      <a href="/calculator" className="feature-card">
        <div className="feature-icon-circle">🧪</div>
        <h3>Input Calculator</h3>
        <p>Get the correct pesticide and fertilizer dose calculated for your exact field size.</p>
        <span className="fc-arrow">Calculate →</span>
      </a>
    </div>
  </div>
</section>

{/*  */}
<section className="how-section" style={{"background":"linear-gradient(180deg, #edf5e2 0%, var(--bg) 100%)"}}>
  <div className="container">
    <p className="page-hero-badge" style={{"background":"#e8f5d6","color":"var(--primary)","display":"inline-flex","marginBottom":"14px"}}>
      ⚙️ How It Works
    </p>
    <h2 className="section-title">Get Your Diagnosis & Risk Matrix in 4 Easy Steps</h2>
    <p className="section-sub">Just upload a leaf picture, select your location, and get instant recommendations.</p>
    <div className="steps-grid">
      <div className="step-card">
        <div className="step-num">1</div>
        <h4>Upload Crop Photo</h4>
        <p>Snap a leaf photo using your phone camera or upload a saved image.</p>
      </div>
      <div className="step-card">
        <div className="step-num">2</div>
        <h4>Select Location</h4>
        <p>Enter your State and District so we can pull localized climate data.</p>
      </div>
      <div className="step-card">
        <div className="step-num">3</div>
        <h4>AI Diagnosis Run</h4>
        <p>Our AI scans leaf lesions and correlates local humidity/temp parameters.</p>
      </div>
      <div className="step-card">
        <div className="step-num">4</div>
        <h4>Take Treatment Action</h4>
        <p>Calculate exact pesticide dosages and view advisory in English/Hindi.</p>
      </div>
    </div>
    <div style={{"textAlign":"center","marginTop":"48px"}}>
      <a href="/predict" className="btn btn-primary btn-lg">🌿 Start Your Disease Check →</a>
    </div>
  </div>
</section>

{/*  */}
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






{/*  */}
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
