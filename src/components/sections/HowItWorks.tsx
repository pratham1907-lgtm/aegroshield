"use client";

import React from 'react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const STEPS_DATA = [
  {
    num: '1',
    icon: '📍',
    title: 'Select Location',
    description: 'Enter your pincode or district to view nearby trusted local sellers and stores.',
    delay: 0,
  },
  {
    num: '2',
    icon: '📱',
    title: 'Browse Store Catalogs',
    description: 'Check real-time stock, prices, and product details from local verified shops.',
    delay: 0.1,
  },
  {
    num: '3',
    icon: '✅',
    title: 'Place In-App Order',
    description: 'Add items to your cart and checkout securely with Cash on Delivery or store pickup.',
    delay: 0.2,
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section
      className="how-it-works-section"
      style={{
        padding: '64px 24px',
        background: '#F8FAFC',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              fontWeight: 700,
              color: '#1F2937',
              marginBottom: '12px',
            }}
          >
            How Marketplace Works in 3 Easy Steps
          </h2>
          <p
            style={{
              fontSize: '1rem',
              color: '#6B7280',
              maxWidth: '580px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Order your farming inputs directly from local shops without leaving your field.
          </p>
        </div>

        {/* 3 Steps Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
          }}
        >
          {STEPS_DATA.map((step, idx) => (
            <ScrollReveal key={idx} direction="up" delay={step.delay}>
              <div
                style={{
                  background: '#FFFFFF',
                  border: '2px solid #E5E7EB',
                  borderRadius: '16px',
                  padding: '32px 24px',
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                }}
              >
                {/* Number Badge */}
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F0FDF4 0%, #E8F5E9 100%)',
                    color: '#2D6A4F',
                    fontSize: '28px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    boxShadow: '0 2px 8px rgba(45,106,79,0.1)',
                  }}
                >
                  {step.num}
                </div>

                {/* Icon */}
                <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.85 }}>
                  {step.icon}
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937', marginBottom: '12px' }}>
                  {step.title}
                </h3>

                {/* Description */}
                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
