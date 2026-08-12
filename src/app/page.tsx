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
        Machinery booking, labour finding, live mandi prices, and input calculators — completely free for every Indian farmer.
      </p>
      <div className="hero-actions">
        <a href="/machinery" className="btn btn-primary btn-lg">
          🚜 Book Machinery →
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

    {/*  ── Hero visual: feature highlights ── */}
    <div className="hero-visual">
      <a href="/machinery" className="hero-card-main pipeline-card" style={{"display":"flex","flexDirection":"column","gap":"16px","cursor":"pointer","color":"inherit","textDecoration":"none","maxWidth":"420px","width":"100%"}}>
        <div style={{"fontWeight":"800","color":"var(--primary)","fontSize":"1.1rem","borderBottom":"1.5px solid var(--gray-100)","paddingBottom":"10px","marginBottom":"4px","display":"flex","alignItems":"center","gap":"8px"}}>
          <span>🚜 Machinery Booking</span>
          <span className="badge" style={{"fontSize":"0.72rem","padding":"4px 8px","borderRadius":"6px","marginLeft":"auto","display":"flex","alignItems":"center","gap":"4px","background":"var(--gray-50)","color":"var(--gray-800)","border":"1px solid var(--gray-200)","textTransform":"none","letterSpacing":"normal"}}>
            Book Now
          </span>
        </div>

        <div className="pipeline-step">
          <div className="step-icon-box green">
            <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          </div>
          <div className="step-content">
            <div className="step-label">Step 1</div>
            <h4 className="step-title">Find Equipment</h4>
            <p className="step-desc">Browse tractors, harvesters and other machinery from nearby CHCs.</p>
          </div>
          <div className="step-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
        </div>

        <div className="pipeline-step">
          <div className="step-icon-box green">
            <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div className="step-content">
            <div className="step-label">Step 2</div>
            <h4 className="step-title">Connect with Owner</h4>
            <p className="step-desc">Contact the machinery owner directly and confirm the booking.</p>
          </div>
          <div className="step-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
        </div>

        <div className="pipeline-step highlighted">
          <div className="step-icon-box orange">
            <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div className="step-content">
            <div className="step-label orange">Step 3</div>
            <h4 className="step-title">Job Done!</h4>
            <p className="step-desc">Get your field work completed on time at the best local rates.</p>
          </div>
          <div className="step-arrow orange">
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
        </div>
      </a>
      <div className="hero-badge-float hbf-1">✅ Trusted by Farmers</div>
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
    <div className="sb-num">9</div>
    <div className="sb-lbl">Major Crops</div>
  </div>
  <div className="sb-item">
    <div className="sb-num">4</div>
    <div className="sb-lbl">Smart Tools</div>
  </div>
</div>

{/*  ── Features Grid ────────────────────────────────────────────── */}
<section className="features-section" id="features">
  <div className="container">
    <div style={{"textAlign":"center","marginBottom":"0"}}>
      <p className="page-hero-badge" style={{"background":"#e8f5d6","color":"var(--primary)","display":"inline-flex","marginBottom":"14px"}}>
        🌱 Platform Features
      </p>
      <h2 className="section-title" style={{"textAlign":"center"}}>Everything a Farmer Needs</h2>
      <p className="section-sub" style={{"textAlign":"center","maxWidth":"540px","margin":"0 auto 48px"}}>
        Four powerful tools, one simple platform — designed for the Indian farmer.
      </p>
    </div>
    <div className="features-grid">
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
