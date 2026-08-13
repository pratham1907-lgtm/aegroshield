import Link from "next/link";
import { Store, ArrowRight, ShoppingBag, Tractor, Users, TrendingUp, Calculator, CheckCircle2 } from "lucide-react";

export default function FarmerHomePage() {
  return (
    <main>

{/* ── 1. Hero Section ─────────────────────────────────────────────── */}
<section className="hero">
  <div className="hero-inner">
    <div>
      <div className="hero-tag"><span></span> Free for Every Indian Farmer 🇮🇳</div>
      <h1>Smart Farming —<br /><em>All Tools in</em><br />One Place</h1>
      <p className="hero-sub">
        Order farm inputs, book machinery, find labour, check live mandi prices, and calculate inputs — completely free for Indian farmers.
      </p>
      <div className="hero-actions">
        <Link href="/marketplace" className="btn btn-primary btn-lg">
          🛒 Explore Marketplace →
        </Link>
        <a href="#features" className="btn btn-outline btn-lg">
          Explore All Tools ↓
        </a>
      </div>
      <div className="hero-trust">
        <div className="trust-avatars">
          <span>रा</span><span>सु</span><span>मो</span><span>गी</span><span>+</span>
        </div>
        <p className="trust-text"><strong>50,000+ farmers</strong> already using Aegroshield across 18 states</p>
      </div>
    </div>

    {/* ── Hero Visual: Multi-Tool Quick Hub Widget ── */}
    <div className="hero-visual">
      <div className="hero-card-main pipeline-card" style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "420px", width: "100%" }}>
        <div style={{ fontWeight: "800", color: "var(--primary)", fontSize: "1.1rem", borderBottom: "1.5px solid var(--gray-100)", paddingBottom: "10px", marginBottom: "2px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>🌾 Aegroshield Smart Hub</span>
          <span style={{ fontSize: "0.75rem", background: "#e8f5d6", color: "var(--primary)", padding: "3px 8px", borderRadius: "6px", fontWeight: "700" }}>5 Tools Included</span>
        </div>

        <Link href="/marketplace" className="pipeline-step highlighted" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="step-icon-box green">
            <ShoppingBag size={18} />
          </div>
          <div className="step-content">
            <div className="step-label green">Agri-Store</div>
            <h4 className="step-title">Local Marketplace</h4>
            <p className="step-desc">Buy seeds, fertilizers & pesticides</p>
          </div>
          <div className="step-arrow green">→</div>
        </Link>

        <Link href="/machinery" className="pipeline-step" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="step-icon-box green">
            <Tractor size={18} />
          </div>
          <div className="step-content">
            <div className="step-label">Rentals</div>
            <h4 className="step-title">Machinery Booking</h4>
            <p className="step-desc">Book tractors & harvesters nearby</p>
          </div>
          <div className="step-arrow">→</div>
        </Link>

        <Link href="/market" className="pipeline-step" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="step-icon-box green">
            <TrendingUp size={18} />
          </div>
          <div className="step-content">
            <div className="step-label">Mandi Rates</div>
            <h4 className="step-title">Live Market Prices</h4>
            <p className="step-desc">Real-time crop prices & sell insights</p>
          </div>
          <div className="step-arrow">→</div>
        </Link>
      </div>
      <div className="hero-badge-float hbf-1">✅ 100% Verified Local Inputs</div>
    </div>
  </div>
</section>

{/* ── 2. Stats Banner ─────────────────────────────────────────────── */}
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

{/* ── 3. Comprehensive Feature Grid (ALL 5 TOOLS INCLUDED) ────────────── */}
<section className="features-section" id="features">
  <div className="container">
    <div style={{ textAlign: "center", marginBottom: "0" }}>
      <p className="page-hero-badge" style={{ background: "#e8f5d6", color: "var(--primary)", display: "inline-flex", marginBottom: "14px" }}>
        🌱 Complete Smart Farming Suite
      </p>
      <h2 className="section-title" style={{ textAlign: "center" }}>Platform Features</h2>
      <p className="section-sub" style={{ textAlign: "center", maxWidth: "580px", margin: "0 auto 48px" }}>
        Five powerful tools designed to simplify every aspect of farming for Indian agriculturalists.
      </p>
    </div>
    
    <div className="features-grid">
      {/* TOOL 1: MARKETPLACE */}
      <Link href="/marketplace" className="feature-card">
        <div className="feature-icon-circle">🛒</div>
        <h3>Local Marketplace</h3>
        <p>Buy seeds, fertilizers, and pesticides from nearby verified local dealers with Cash on Delivery.</p>
        <span className="fc-arrow">Shop Now →</span>
      </Link>

      {/* TOOL 2: MACHINERY BOOKING */}
      <Link href="/machinery" className="feature-card">
        <div className="feature-icon-circle">🚜</div>
        <h3>Machinery Booking</h3>
        <p>Rent tractors and harvesters from nearby Custom Hiring Centres (CHCs) at affordable hourly rates.</p>
        <span className="fc-arrow">Browse Equipment →</span>
      </Link>

      {/* TOOL 3: LABOUR BOARD */}
      <Link href="/labour" className="feature-card">
        <div className="feature-icon-circle">👥</div>
        <h3>Labour Board</h3>
        <p>Find available farm workers or post job listings for harvesting, sowing, and field maintenance.</p>
        <span className="fc-arrow">Find Workers →</span>
      </Link>

      {/* TOOL 4: MARKET PRICES */}
      <Link href="/market" className="feature-card">
        <div className="feature-icon-circle">📈</div>
        <h3>Market Prices</h3>
        <p>Live mandi rates with intelligent sell or wait recommendations to maximize your crop revenue.</p>
        <span className="fc-arrow">Check Mandi Rates →</span>
      </Link>

      {/* TOOL 5: INPUT CALCULATOR */}
      <Link href="/calculator" className="feature-card">
        <div className="feature-icon-circle">🧪</div>
        <h3>Input Calculator</h3>
        <p>Accurate pesticide and fertilizer dosage calculation tailored to your crop and field size.</p>
        <span className="fc-arrow">Calculate Dosage →</span>
      </Link>
    </div>
  </div>
</section>

{/* ── 4. Marketplace Showcase Section ────────────────────────────────── */}
<section className="marketplace-banner-section">
  <div className="container">
    <div className="mbs-inner">
      <div className="mbs-content">
        <p className="page-hero-badge" style={{ background: "#fff7e6", color: "#d97706", display: "inline-flex", marginBottom: "14px" }}>
          🛒 Local Agri-Marketplace
        </p>
        <h2 className="section-title">Buy Agri-Inputs —<br />Directly from Your Local Store</h2>
        <p className="section-sub" style={{ marginBottom: "28px" }}>
          Order fertilizers, seeds, pesticides and equipment from trusted sellers in your district with in-app cart and Cash on Delivery!
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
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

{/* ── 5. How It Works Section ──────────────────────────────────────── */}
<section className="mp-how" style={{ padding: "60px 0", background: "#f8fafc" }}>
  <div className="container">
    <h2 className="section-title" style={{ textAlign: "center" }}>How Marketplace Works in 3 Easy Steps</h2>
    <p className="section-sub" style={{ textAlign: "center", marginBottom: "40px" }}>
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

{/* ── 6. SELLER REGISTRATION CALL-TO-ACTION BANNER (FINAL BANNER BEFORE FOOTER) ── */}
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

{/* ── 7. Footer ───────────────────────────────────────────────────── */}
  <footer>
    <div className="container">
      <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Aegroshield — Smart Farming Platform | Made for Indian Farmers 🇮🇳</p>
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
