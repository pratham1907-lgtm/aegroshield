"use client";

import Link from "next/link";
import HeroSection from "@/components/sections/HeroSection";
import StatsSection from "@/components/sections/StatsSection";
import FeaturesGrid from "@/components/sections/FeaturesGrid";
import MarketplacePreview from "@/components/sections/MarketplacePreview";
import HowItWorks from "@/components/sections/HowItWorks";
import SellerRegistrationCTA from "@/components/sections/SellerRegistrationCTA";

export default function FarmerHomePage() {
  return (
    <main>
      {/* ── 1. Hero Section (Auth Integrated) ─────────────────────────── */}
      <HeroSection />

      {/* ── 2. Stats Section (Auth Counters) ───────────────────────────── */}
      <StatsSection />

      {/* ── 3. Features Grid (5 GlassCard Tools) ──────────────────────── */}
      <FeaturesGrid />

      {/* ── 4. Marketplace Showcase Section ────────────────────────────── */}
      <MarketplacePreview />

      {/* ── 5. How It Works Section ────────────────────────────────────── */}
      <HowItWorks />

      {/* ── 6. Seller Registration Call-To-Action Banner ─────────────── */}
      <SellerRegistrationCTA />

      {/* ── 7. Footer ───────────────────────────────────────────────────── */}
      <footer>
        <div className="container">
          <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>
            Aegroshield — Smart Farming Platform | Made for Indian Farmers 🇮🇳
          </p>
          <div className="footer-links">
            <Link href="/">Home</Link>
            <Link href="/marketplace">Store</Link>
            <Link href="/machinery">Machinery</Link>
            <Link href="/labour">Labour</Link>
            <Link href="/market">Market Price</Link>
            <Link href="/calculator">Calculator</Link>
            <Link href="/vendor/login" style={{ color: '#ea580c', fontWeight: '700' }}>
              Seller Portal 🏬
            </Link>
          </div>
          <p className="footer-copy">&copy; 2026 Aegroshield. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
