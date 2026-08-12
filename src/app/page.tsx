import Link from "next/link";
import { User, Store, Shield, ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";

export default function MasterGatewayPage() {
  return (
    <main className="gateway-page">
      {/* ── Top Gateway Header ── */}
      <section className="gateway-hero">
        <div className="container" style={{ maxWidth: "1000px", textAlign: "center" }}>
          <div className="hero-tag" style={{ margin: "0 auto 16px", display: "inline-flex" }}>
            <span></span> Smart Agriculture Ecosystem 🇮🇳
          </div>
          <h1 className="gateway-title">
            Welcome to <em>Aegroshield</em>
          </h1>
          <p className="gateway-subtitle">
            The unified platform connecting Indian Farmers, Local Agricultural Sellers, and Regional Authorities. Select your portal to continue:
          </p>
        </div>
      </section>

      {/* ── 3 Portal Selector Cards ── */}
      <section className="gateway-portals-section">
        <div className="container" style={{ maxWidth: "1100px" }}>
          <div className="gateway-grid">
            
            {/* PORTAL 1: FARMER & BUYER */}
            <div className="portal-card farmer-card">
              <div className="portal-card-header">
                <div className="portal-icon green">🌾</div>
                <span className="portal-tag green">For Farmers & Buyers</span>
              </div>
              <h2 className="portal-title">Farmer & Store Portal</h2>
              <p className="portal-desc">
                Buy fertilizers, pesticides, seeds, and equipment with Cash on Delivery. Book machinery, find farm labour, and check live mandi rates.
              </p>
              
              <ul className="portal-features">
                <li><CheckCircle2 size={16} color="#22c55e" /> Local Agri-Storefront & In-App Cart</li>
                <li><CheckCircle2 size={16} color="#22c55e" /> Tractor & Equipment Rentals</li>
                <li><CheckCircle2 size={16} color="#22c55e" /> Live Mandi Prices & Dosage Calculators</li>
              </ul>

              <div className="portal-action-box">
                <Link href="/farmer/home" className="btn btn-primary btn-full btn-lg">
                  Enter Farmer Portal <ArrowRight size={18} />
                </Link>
                <Link href="/marketplace" className="portal-sublink">
                  Browse Marketplace directly →
                </Link>
              </div>
            </div>

            {/* PORTAL 2: LOCAL SELLER & DEALER */}
            <div className="portal-card seller-card">
              <div className="portal-card-header">
                <div className="portal-icon orange">🏬</div>
                <span className="portal-tag orange">For Local Dealers</span>
              </div>
              <h2 className="portal-title">Local Seller Portal</h2>
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
                  Seller Login / Portal <ArrowRight size={18} />
                </Link>
                <Link href="/vendor/register" className="portal-sublink" style={{ color: "#ea580c" }}>
                  Register New Agri-Store →
                </Link>
              </div>
            </div>

            {/* PORTAL 3: PLATFORM ADMINISTRATOR */}
            <div className="portal-card admin-card">
              <div className="portal-card-header">
                <div className="portal-icon dark">🛡️</div>
                <span className="portal-tag dark">Platform Control</span>
              </div>
              <h2 className="portal-title">Admin Master Panel</h2>
              <p className="portal-desc">
                Inspect shopkeeper license certificates, grant platform accreditation, audit listed products, and monitor regional analytics.
              </p>

              <ul className="portal-features">
                <li><CheckCircle2 size={16} color="#38bdf8" /> Dealer Verification & License Inspection</li>
                <li><CheckCircle2 size={16} color="#38bdf8" /> Banned Chemical & Quality Moderation</li>
                <li><CheckCircle2 size={16} color="#38bdf8" /> Regional Engagement & GMV Analytics</li>
              </ul>

              <div className="portal-action-box">
                <Link href="/login?role=admin" className="btn btn-primary btn-full btn-lg" style={{ background: "#0f172a", borderColor: "#0f172a" }}>
                  Admin Master Login <ArrowRight size={18} />
                </Link>
                <Link href="/login?role=admin" className="portal-sublink" style={{ color: "#475569" }}>
                  Access Demo Admin Control Panel →
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
