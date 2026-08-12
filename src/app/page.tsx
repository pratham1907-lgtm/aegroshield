import Link from "next/link";
import { User, Store, ArrowRight, CheckCircle2 } from "lucide-react";

export default function MasterGatewayPage() {
  return (
    <main className="gateway-page">
      {/* ── Top Gateway Navbar / Header (Strictly Brand & Sign In only) ── */}
      <header className="gateway-navbar">
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
          <div className="nav-brand" style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            🌿 Aegroshield
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-mid)", fontWeight: "600" }}>
              Smart Agriculture Platform 🇮🇳
            </span>
            <Link href="/login" className="btn btn-primary btn-sm">
              Sign In / Login
            </Link>
          </div>
        </div>
      </header>

      {/* ── Top Gateway Hero Header ── */}
      <section className="gateway-hero">
        <div className="container" style={{ maxWidth: "1000px", textAlign: "center" }}>
          <div className="hero-tag" style={{ margin: "0 auto 16px", display: "inline-flex" }}>
            <span></span> Select Your Portal to Continue 🇮🇳
          </div>
          <h1 className="gateway-title">
            Welcome to <em>Aegroshield</em>
          </h1>
          <p className="gateway-subtitle">
            The unified smart agriculture platform connecting Indian Farmers and Local Agri-Dealers. Choose your portal below to get started:
          </p>
        </div>
      </section>

      {/* ── 2 Portal Selector Cards (Farmers & Local Sellers) ── */}
      <section className="gateway-portals-section">
        <div className="container" style={{ maxWidth: "900px" }}>
          <div className="gateway-grid gateway-grid-two">
            
            {/* PORTAL 1: FARMER & BUYER */}
            <div className="portal-card farmer-card">
              <div className="portal-card-header">
                <div className="portal-icon green">🌾</div>
                <span className="portal-tag green">Farmer / User Portal</span>
              </div>
              <h2 className="portal-title">Farmer & Buyer Hub</h2>
              <p className="portal-desc">
                Buy fertilizers, pesticides, seeds, and equipment with Cash on Delivery. Book machinery, find farm labour, and check live mandi rates.
              </p>
              
              <ul className="portal-features">
                <li><CheckCircle2 size={16} color="#22c55e" /> Local Agri-Storefront & In-App Cart</li>
                <li><CheckCircle2 size={16} color="#22c55e" /> Tractor & Equipment Rentals</li>
                <li><CheckCircle2 size={16} color="#22c55e" /> Live Mandi Prices & Dosage Calculators</li>
              </ul>

              <div className="portal-action-box">
                <Link href="/login?role=user" className="btn btn-primary btn-full btn-lg">
                  Farmer Sign In / Account <ArrowRight size={18} />
                </Link>
                <Link href="/farmer/home" className="portal-sublink">
                  Or explore Farmer App directly →
                </Link>
              </div>
            </div>

            {/* PORTAL 2: LOCAL SELLER & DEALER */}
            <div className="portal-card seller-card">
              <div className="portal-card-header">
                <div className="portal-icon orange">🏬</div>
                <span className="portal-tag orange">Local Seller Portal</span>
              </div>
              <h2 className="portal-title">Agri-Input Dealer Hub</h2>
              <p className="portal-desc">
                Register your shop on Aegroshield, list your product catalog, update real-time stock/prices, and fulfill local farmer orders.
              </p>
              
              <ul className="portal-features">
                <li><CheckCircle2 size={16} color="#ea580c" /> Product Catalog & Price Management</li>
                <li><CheckCircle2 size={16} color="#ea580c" /> Instant Stock Toggle (In/Out of Stock)</li>
                <li><CheckCircle2 size={16} color="#ea580c" /> Real-Time Farmer Order Fulfillment Queue</li>
              </ul>

              <div className="portal-action-box">
                <Link href="/login?role=vendor" className="btn btn-primary btn-full btn-lg" style={{ background: "#ea580c", borderColor: "#ea580c" }}>
                  Seller Sign In / Portal <ArrowRight size={18} />
                </Link>
                <Link href="/vendor/register" className="portal-sublink" style={{ color: "#ea580c" }}>
                  Register New Agri-Store →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Simple Footer ── */}
      <footer style={{ marginTop: "60px", background: "#fff", borderTop: "1px solid #e2e8f0", padding: "30px 0", textAlign: "center" }}>
        <div className="container">
          <p style={{ fontSize: "0.95rem", color: "var(--text-mid)", fontWeight: "600" }}>
            Aegroshield — Smart Agriculture Platform | Made for Indian Farmers 🇮🇳
          </p>
          <p style={{ fontSize: "0.82rem", color: "var(--text-light)", marginTop: "6px" }}>
            &copy; 2026 Aegroshield. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
