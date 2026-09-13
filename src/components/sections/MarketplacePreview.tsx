"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const DEMO_PRODUCTS = [
  { emoji: '🌱', name: 'Urea', price: '₹266 / bag', category: 'Fertilizer', delay: 0 },
  { emoji: '🌱', name: 'DAP', price: '₹1350 / bag', category: 'Fertilizer', delay: 0.1 },
  { emoji: '🌾', name: 'Wheat Seeds HD-2967', price: '₹70 / kg', category: 'Seed', delay: 0.2 },
  { emoji: '🧪', name: 'Neem Oil', price: '₹250 / L', category: 'Pesticide', delay: 0.3 },
  { emoji: '⚙️', name: 'Sprayer (16L)', price: '₹1200', category: 'Equipment', delay: 0.4 },
];

export const MarketplacePreview: React.FC = () => {
  const { user, userData, isDemo } = useAuth();
  const [selectedCat, setSelectedCat] = useState<string>('All');

  const isLoggedIn = Boolean(user || isDemo || userData);
  const districtName = userData?.district || 'Meerut';

  const filteredProducts = selectedCat === 'All'
    ? DEMO_PRODUCTS
    : DEMO_PRODUCTS.filter(p => p.category === selectedCat);

  return (
    <section
      className="marketplace-preview-section"
      style={{
        padding: '64px 24px',
        background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FFF7ED',
              color: '#D97706',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '12px',
            }}
          >
            🛒 Local Agri-Marketplace
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              fontWeight: 700,
              color: '#1F2937',
              marginBottom: '12px',
            }}
          >
            {isLoggedIn ? `Top Products in ${districtName}` : 'Buy Agri-Inputs — Directly from Your Local Store'}
          </h2>
          <p
            style={{
              fontSize: '1rem',
              color: '#6B7280',
              maxWidth: '640px',
              margin: '0 auto 24px',
              lineHeight: 1.6,
            }}
          >
            Order fertilizers, seeds, pesticides and equipment from trusted sellers in your district with in-app cart and Cash on Delivery!
          </p>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {['All', 'Fertilizer', 'Seed', 'Pesticide'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCat(cat)}
                style={{
                  background: selectedCat === cat ? '#F0FDF4' : '#FFFFFF',
                  color: selectedCat === cat ? '#2D6A4F' : '#6B7280',
                  border: `2px solid ${selectedCat === cat ? '#2D6A4F' : '#E5E7EB'}`,
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat === 'All' && '🛍️ All Products'}
                {cat === 'Fertilizer' && '🌱 Fertilizers'}
                {cat === 'Seed' && '🌾 Seeds'}
                {cat === 'Pesticide' && '🧪 Pesticides'}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          {filteredProducts.map((item, idx) => (
            <ScrollReveal key={idx} direction="up" delay={item.delay}>
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '24px 16px',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                className="hover:-translate-y-1 hover:shadow-lg"
              >
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>{item.emoji}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', marginBottom: '8px' }}>
                  {item.name}
                </h3>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#2D6A4F' }}>
                  {item.price}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* View All CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link
            href="/marketplace"
            style={{
              color: '#2D6A4F',
              fontWeight: 600,
              fontSize: '16px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            View Full Marketplace →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MarketplacePreview;
