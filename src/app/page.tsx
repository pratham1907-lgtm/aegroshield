import Link from "next/link";
export default function Home() {
  return (
    <main>

{/*  ── Hero ─────────────────────────────────────────────────────── */}
<section className="hero">
  <div className="hero-inner">
    <div>
      <div className="hero-tag"><span></span> Free for Every Indian Farmer 🇮🇳</div>
      <h1>Smart Farming —<br /><em>All Tools in</em><br />One Place</h1>
      <p className="hero-sub">
        Machinery booking, labour finding, agri-marketplace, live mandi prices, and input calculators — completely free for every Indian farmer.
      </p>
      <div className="hero-actions">
        <a href="/marketplace" className="btn btn-primary btn-lg">
          🛒 Shop Agri-Inputs →
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

    {/*  ── Hero visual: Marketplace card ── */}
    <div className="hero-visual">
      <a href="/marketplace" className="hero-card-main pipeline-card" style={{"display":"flex","flexDirection":"column","gap":"16px","cursor":"pointer","color":"inherit","textDecoration":"none","maxWidth":"420px","width":"100%"}}>
        <div style={{"fontWeight":"800","color":"var(--primary)","fontSize":"1.1rem","borderBottom":"1.5px solid var(--gray-100)","paddingBottom":"10px","marginBottom":"4px","display":"flex","alignItems":"center","gap":"8px"}}>
          <span>🛒 Local Agri-Store</span>
          <span className="badge" style={{"fontSize":"0.72rem","padding":"4px 8px","borderRadius":"6px","marginLeft":"auto","display":"flex","alignItems":"center","gap":"4px","background":"var(--gray-50)","color":"var(--gray-800)","border":"1px solid var(--gray-200)","textTransform":"none","letterSpacing":"normal"}}>
            WhatsApp Order
          </span>
        </div>

        <div className="pipeline-step">
          <div className="step-icon-box green">
            <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          <div className="step-content">
            <div className="step-label">Step 1</div>
            <h4 className="step-title">Select Your Area</h4>
            <p className="step-desc">Choose your district to see products from nearby stores.</p>
          </div>
          <div className="step-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
        </div>

        <div className="pipeline-step">
          <div className="step-icon-box green">
            <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <div className="step-content">
            <div className="step-label">Step 2</div>
            <h4 className="step-title">Choose Your Product</h4>
            <p className="step-desc">Fertilizer, pesticide, seed or equipment — it&#39;s all here.</p>
          </div>
          <div className="step-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
        </div>

        <div className="pipeline-step highlighted">
          <div className="step-icon-box orange">
            <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.92 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          <div className="step-content">
            <div className="step-label orange">Step 3</div>
            <h4 className="step-title">Order on WhatsApp!</h4>
            <p className="step-desc">One tap sends a pre-filled order message directly to the seller&#39;s WhatsApp.</p>
          </div>
          <div className="step-arrow orange">
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
        </div>
      </a>
      <div className="hero-badge-float hbf-1">✅ 26+ Local Vendors</div>
    </div>
  </div>
</section>

{/*  ── Stats Banner ─────────────────────────────────────────────── */}
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
    <div className="sb-num">26+</div>
    <div className="sb-lbl">Products Listed</div>
  </div>
  <div className="sb-item">
    <div className="sb-num">5</div>
    <div className="sb-lbl">Smart Tools</div>
  </div>
</div>

{/*  ── Marketplace Banner Section ────────────────────────────────── */}
<section className="marketplace-banner-section">
  <div className="container">
    <div className="mbs-inner">
      <div className="mbs-content">
        <p className="page-hero-badge" style={{"background":"#fff7e6","color":"#d97706","display":"inline-flex","marginBottom":"14px"}}>
          🛒 NEW — Local Agri-Marketplace
        </p>
        <h2 className="section-title">Buy Agri-Inputs —<br />Directly from Your Local Store</h2>
        <p className="section-sub" style={{"marginBottom":"28px"}}>
          Order fertilizers, seeds, pesticides and equipment from trusted sellers in your district — all via WhatsApp!
        </p>
        <div style={{"display":"flex","gap":"12px","flexWrap":"wrap"}}>
          <a href="/marketplace" className="btn btn-primary">🛒 Open Marketplace →</a>
          <a href="/marketplace?cat=Fertilizer" className="btn btn-outline">🌱 Fertilizers</a>
          <a href="/marketplace?cat=Seed" className="btn btn-outline">🌾 Seeds</a>
          <a href="/marketplace?cat=Pesticide" className="btn btn-outline">🧪 Pesticides</a>
        </div>
      </div>
      <div className="mbs-cards">
        <div className="mbs-card"><span className="mbs-icon">🌱</span><span>Urea</span><span className="mbs-price">₹266 / bag</span></div>
        <div className="mbs-card"><span className="mbs-icon">🌱</span><span>DAP</span><span className="mbs-price">₹1350 / bag</span></div>
        <div className="mbs-card"><span className="mbs-icon">🌾</span><span>Wheat Seeds HD-2967</span><span className="mbs-price">₹70 / kg</span></div>
        <div className="mbs-card"><span className="mbs-icon">🧪</span><span>Neem Oil</span><span className="mbs-price">₹250 / L</span></div>
        <div className="mbs-card"><span className="mbs-icon">⚙️</span><span>Sprayer (16L)</span><span className="mbs-price">₹1200</span></div>
        <div className="mbs-card mbs-card-cta"><a href="/marketplace">View All →</a></div>
      </div>
    </div>
  </div>
</section>

{/*  ── Features Grid ────────────────────────────────────────────── */}
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
      <a href="/marketplace" className="feature-card">
        <div className="feature-icon-circle">🛒</div>
        <h3>Agri-Marketplace</h3>
        <p>Buy fertilizers, pesticides, seeds and equipment from trusted local vendors via WhatsApp.</p>
        <span className="fc-arrow">Shop Now →</span>
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

{/*  ── Footer ───────────────────────────────────────────────────── */}
  <footer>
    <div className="container">
      <p style={{"fontSize":"16px","fontWeight":"600","marginBottom":"16px"}}>Aegroshield — Smart Farming Platform | Made for Indian Farmers 🇮🇳</p>
      <div className="footer-links">
        <a href="/">Home</a>
        <a href="/marketplace">Store</a>
        <a href="/machinery">Machinery</a>
        <a href="/labour">Labour</a>
        <a href="/market">Market Price</a>
        <a href="/calculator">Calculator</a>
      </div>
      <p className="footer-copy">&copy; 2026 Aegroshield. All rights reserved.</p>
    </div>
  </footer>

    </main>
  );
}
