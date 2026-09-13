"use client";

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const FEATURES_DATA = [
  {
    icon: '🛒',
    title: 'Local Marketplace',
    description: 'Buy seeds, fertilizers, and pesticides from nearby verified local dealers with Cash on Delivery.',
    ctaText: 'Shop Now →',
    ctaHref: '/marketplace',
    delay: 0,
  },
  {
    icon: '🚜',
    title: 'Machinery Booking',
    description: 'Rent tractors and harvesters from nearby Custom Hiring Centres (CHCs) at affordable hourly rates.',
    ctaText: 'Browse Equipment →',
    ctaHref: '/machinery',
    delay: 0.1,
  },
  {
    icon: '👥',
    title: 'Labour Board',
    description: 'Find available farm workers or post job listings for harvesting, sowing, and field maintenance.',
    ctaText: 'Find Workers →',
    ctaHref: '/labour',
    delay: 0.2,
  },
  {
    icon: '📈',
    title: 'Market Prices',
    description: 'Live mandi rates with intelligent sell or wait recommendations to maximize your crop revenue.',
    ctaText: 'Check Mandi Rates →',
    ctaHref: '/market',
    delay: 0.3,
  },
  {
    icon: '🧪',
    title: 'Input Calculator',
    description: 'Accurate pesticide and fertilizer dosage calculation tailored to your crop and field size.',
    ctaText: 'Calculate Dosage →',
    ctaHref: '/calculator',
    delay: 0.4,
  },
];

export const FeaturesGrid: React.FC = () => {
  return (
    <section className="features-grid-section" id="features" style={{ padding: '64px 24px', background: '#FFFFFF' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Section Heading */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#E8F5E9',
              color: '#2D6A4F',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '12px',
            }}
          >
            🌾 Aegroshield Smart Hub: 5 Tools Included
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              fontWeight: 700,
              color: '#1F2937',
              marginBottom: '12px',
            }}
          >
            Complete Smart Farming Suite
          </h2>
          <p
            style={{
              fontSize: '1rem',
              color: '#6B7280',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Five powerful tools designed to simplify every aspect of farming for Indian agriculturalists.
          </p>
        </div>

        {/* 5-Card Grid Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
          }}
        >
          {FEATURES_DATA.map((item, idx) => (
            <ScrollReveal key={idx} direction="up" delay={item.delay}>
              <GlassCard
                icon={item.icon}
                title={item.title}
                description={item.description}
                ctaText={item.ctaText}
                ctaHref={item.ctaHref}
                delay={item.delay}
                isDemoCard={true}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
