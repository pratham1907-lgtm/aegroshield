import Link from "next/link";
import { Store, ArrowRight, ShieldCheck, ShoppingBag } from "lucide-react";

export default function FarmerHomePage() {
  return (
    <main>

{/* ── Hero Section ─────────────────────────────────────────────── */}
<section className="hero">
  <div className="hero-inner">
    <div>
      <div className="hero-tag"><span></span> Free for Every Indian Farmer 🇮🇳</div>
      <h1>Direct Farm Inputs —<br /><em>Connect with Local</em><br />Sellers & Agri-Stores</h1>
      <p className="hero-sub">
        Order fertilizers, seeds, and pesticides directly from verified local dealers in your district with easy home delivery or store pickup.
      </p>
      <div className="hero-actions">
        <Link href="/marketplace" className="btn btn-primary btn-lg">
          🛒 Explore Local Marketplace →
        </Link>
        <a href="#features" className="btn btn-outline btn-lg">Explore All Tools</a>
      </div>
      <div className="hero-trust">
        <div className="trust-avatars">
          <span>रा</span><span>सु</span><span>मो</span><span>गी</span><span>+</span>
        </div>
        <p className="trust-text"><strong>50,000+ farmers</strong> already using Aegroshield across 18 states</p>
      </div>
    </div>

    {/* ── Hero Visual: Marketplace Pipeline ── */}
    <div className="hero-visual">
      <Link href="/marketplace" className="hero-card-main pipeline-card" style={{"display":"flex","flexDirection":"column","gap":"16px","cursor":"pointer","color":"inherit","textDecoration":"none","maxWidth":"420px","width":"100%"}}>
        <div style={{"fontWeight":"800","color":"var(--primary)","fontSize":"1.1rem","borderBottom":"1.5px solid var(--gray-100)","paddingBottom":"10px","marginBottom":"4px","display":"flex","alignItems":"center","gap":"8px"}}>
          <span>🛒 Local Agri-Store</span>
          <span className="badge" style={{"fontSize":"0.72rem","padding":"4px 8px","borderRadius":"6px","marginLeft":"auto","display":"flex","alignItems":"center","gap":"4px","background":"var(--gray-50)","color":"var(--gray-800)","border":"1px solid var(--gray-200)","textTransform":"none","letterSpacing":"normal"}}>
            In-App COD
          </span>
        </div>

        <div className="pipeline-step">
          <div className="step-icon-box green">
            <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          <div className="step-content">
            <div className="step-label">Step 1</div>
            <h4 className="step-title">Select Location</h4>
            <p className="step-desc">Enter your district to view trusted local sellers.</p>
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
            <h4 className="step-title">Browse Catalogs</h4>
            <p className="step-desc">Check real-time stock, prices, and product details.</p>
          </div>
          <div className="step-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
        </div>

        <div className="pipeline-step highlighted">
          <div className="step-icon-box orange">
            <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <div className="step-content">
            <div className="step-label orange">Step 3</div>
            <h4 className="step-title">Place In-App Order</h4>
            <p className="step-desc">Checkout securely with Cash on Delivery (COD).</p>
          </div>
          <div className="step-arrow orange">
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
        </div>
      </Link>
      <div className="hero-badge-float hbf-1">✅ Verified Local Sellers</div>
    </div>
  </div>
</section>

{/* ── Stats Banner ─────────────────────────────────────────────── */}
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

{/* ── Features Grid ────────────────────────────────────────────── */}
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
      <Link href="/marketplace" className="feature-card">
        <div className="feature-icon-circle">🛒</div>
        <h3>Local Marketplace</h3>
        <p>Browse nearby shops, compare real-time prices, and order farm inputs with Cash on Delivery.</p>
        <span className="fc-arrow">Shop Now →</span>
      </Link>
      <Link href="/machinery" className="feature-card">
        <div className="feature-icon-circle">🚜</div>
        <h3>Machinery Booking</h3>
        <p>Book tractors and harvesters from nearby Custom Hiring Centres (CHCs).</p>
        <span className="fc-arrow">Browse Equipment →</span>
      </Link>
      <Link href="/labour" className="feature-card">
        <div className="feature-icon-circle">👥</div>
        <h3>Labour Board</h3>
        <p>Find available farm workers in your area — post or respond to job listings.</p>
        <span className="fc-arrow">Find Workers →</span>
      </Link>
      <Link href="/market" className="feature-card">
        <div className="feature-icon-circle">📈</div>
        <h3>Market Prices</h3>
        <p>Live mandi rates with intelligent sell or wait recommendation for your crop.</p>
        <span className="fc-arrow">Check Rates →</span>
      </Link>
      <Link href="/calculator" className="feature-card">
        <div className="feature-icon-circle">🧪</div>
        <h3>Input Calculator</h3>
        <p>Get the correct pesticide and fertilizer dose calculated for your exact field size.</p>
        <span className="fc-arrow">Calculate →</span>
      </Link>
    </div>
  </div>
</section>

{/* ── Marketplace Banner Section ────────────────────────────────── */}
<section className="marketplace-banner-section">
  <div className="container">
    <div className="mbs-inner">
      <div className="mbs-content">
        <p className="page-hero-badge" style={{"background":"#fff7e6","color":"#d97706","display":"inline-flex","marginBottom":"14px"}}>
          🛒 NEW — Local Agri-Marketplace
        </p>
        <h2 className="section-title">Buy Agri-Inputs —<br />Directly from Your Local Store</h2>
        <p className="section-sub" style={{"marginBottom":"28px"}}>
          Order fertilizers, seeds, pesticides and equipment from trusted sellers in your district with in-app cart and Cash on Delivery!
        </p>
        <div style={{"display":"flex","gap":"12px","flexWrap":"wrap"}}>
          <Link href="/marketplace" className="btn btn-primary">🛒 Open Marketplace →</Link>
          <Link href="/marketplace?cat=Fertilizer" className="btn btn-outline">🌱 Fertilizers</Link>
          <Link href="/marketplace?cat=Seed" className="btn btn-outline">🌾 Seeds</Link>
          <Link href="/marketplace?cat=Pesticide" className="btn btn-outline">🧪 Pesticides</Link>
        </div>
      </div>
      <div className="mbs-cards">
        <div className="mbs-card"><span className="mbs-icon">🌱</span><span>Urea</span><span className="mbs-price">₹266 / bag</span></div>
        <div className="mbs-card"><span className="mbs-icon">🌱</span><span>DAP</span><span className="mbs-price">₹1350 / bag</span></div>
        <div className="mbs-card"><span className="mbs-icon">🌾</span><span>Wheat Seeds HD-2967</span><span className="mbs-price">₹70 / kg</span></div>
        <div className="mbs-card"><span className="mbs-icon">🧪</span><span>Neem Oil</span><span className="mbs-price">₹250 / L</span></div>
        <div className="mbs-card"><span className="mbs-icon">⚙️</span><span>Sprayer (16L)</span><span className="mbs-price">₹1200</span></div>
        <div className="mbs-card mbs-card-cta"><Link href="/marketplace">View All →</Link></div>
      </div>
    </div>
  </div>
</section>

{/* ── SELLER REGISTRATION CALL-TO-ACTION BANNER ──────────────────── */}
<section style={{ padding: '60px 0', background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', borderTop: '1px solid #fed7aa', borderBottom: '1px solid #fed7aa' }}>
  <div className="container" style={{ maxWidth: '1000px' }}>
    <div style={{ background: '#fff', borderRadius: '24px', padding: '36px 32px', boxShadow: '0 10px 30px rgba(234,88,12,0.08)', border: '1px solid #ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '30px', flexWrap: 'wrap' }}>
      <div style={{ flex: '1', minWidth: '280px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ffedd5', color: '#c2410c', padding: '6px 14px', borderRadius: '30px', fontSize: '0.82rem', fontWeight: '700', marginBottom: '12px' }}>
          <Store size={16} /> Local Dealer Partnership 🏬
        </div>
        <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '800', color: '#7c2d12', lineHeight: '1.2', marginBottom: '10px' }}>
          Are You a Local Agri-Input Dealer or Shopkeeper?
        </h2>
        <p style={{ fontSize: '1rem', color: '#9a3412', lineHeight: '1.6', margin: 0 }}>
          Expand your reach! Register your shop on Aegroshield to showcase your inventory of fertilizers, seeds, and pesticides to thousands of farmers in your district.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '240px' }}>
        <Link
          href="/vendor/login?tab=signup"
          className="btn btn-primary"
          style={{ background: '#ea580c', borderColor: '#ea580c', color: '#fff', padding: '14px 24px', fontSize: '1rem', fontWeight: '700', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(234,88,12,0.3)' }}
        >
          <Store size={18} /> Register Store as Seller <ArrowRight size={18} />
        </Link>
        <Link
          href="/vendor/login"
          style={{ textAlign: 'center', fontSize: '0.88rem', fontWeight: '600', color: '#c2410c', textDecoration: 'none' }}
        >
          Already registered? Login to Seller Portal →
        </Link>
      </div>
    </div>
  </div>
</section>

{/* ── How It Works Section ──────────────────────────────────────── */}
<section className="mp-how" style={{"padding":"60px 0","background":"#f8fafc"}}>
  <div className="container">
    <h2 className="section-title" style={{"textAlign":"center"}}>How Marketplace Works in 3 Easy Steps</h2>
    <p className="section-sub" style={{"textAlign":"center","marginBottom":"40px"}}>
      Order your farming inputs directly from local shops without leaving your field.
    </p>
    <div className="mp-how-grid">
      <div className="mp-how-card">
        <div className="mp-how-num">1</div>
        <h4>Select Location</h4>
        <p>Enter your pincode or district to view nearby trusted local sellers and stores.</p>
      </div>
      <div className="mp-how-card">
        <div className="mp-how-num">2</div>
        <h4>Browse Store Catalogs</h4>
        <p>Check real-time stock, prices, and product details from local verified shops.</p>
      </div>
      <div className="mp-how-card">
        <div className="mp-how-num">3</div>
        <h4>Place In-App Order</h4>
        <p>Add items to your cart and checkout securely with Cash on Delivery or store pickup.</p>
      </div>
    </div>
  </div>
</section>

{/* ── Footer ───────────────────────────────────────────────────── */}
  <footer>
    <div className="container">
      <p style={{"fontSize":"16px","fontWeight":"600","marginBottom":"16px"}}>Aegroshield — Smart Farming Platform | Made for Indian Farmers 🇮🇳</p>
      <div className="footer-links">
        <Link href="/">Home</Link>
        <Link href="/marketplace">Store</Link>
        <Link href="/machinery">Machinery</Link>
        <Link href="/labour">Labour</Link>
        <Link href="/market">Market Price</Link>
        <Link href="/calculator">Calculator</Link>
        <Link href="/vendor/login" style={{ color: '#ea580c', fontWeight: '700' }}>Seller Portal 🏬</Link>
      </div>
      <p className="footer-copy">&copy; 2026 Aegroshield. All rights reserved.</p>
    </div>
  </footer>

    </main>
  );
}
