"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { GradientText } from '@/components/ui/GradientText';
import { RippleButton } from '@/components/ui/RippleButton';
import { ParallaxBackground } from '@/components/ui/ParallaxBackground';
import { FloatingElements } from '@/components/ui/FloatingElements';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

export const HeroSection: React.FC = () => {
  const { user, userData, isLoading, isDemo } = useAuth();

  const isLoggedIn = Boolean(user || isDemo || userData);
  const displayName = userData?.name || user?.displayName || (userData?.email ? userData.email.split('@')[0] : 'Farmer');
  const firstName = displayName.split(' ')[0];

  if (isLoading) {
    return (
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)',
        }}
      >
        <div style={{ color: '#2D6A4F', fontWeight: 600, fontSize: '1.2rem' }}>🌿 Loading AgriShield...</div>
      </section>
    );
  }

  return (
    <section
      className="hero-section-root"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px 40px',
        overflow: 'hidden',
      }}
    >
      {/* Background Decorators */}
      <ParallaxBackground />
      <FloatingElements />

      {/* Hero Content Wrapper */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '900px',
          width: '100%',
          textAlign: 'center',
          margin: '0 auto',
        }}
      >
        {isLoggedIn ? (
          /* ============================================================
             PERSONALIZED HERO (LOGGED IN MODE)
             ============================================================ */
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#DCFCE7',
                color: '#15803D',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '0.88rem',
                fontWeight: 700,
                marginBottom: '20px',
              }}
            >
              <span>👋</span> Logged in as {displayName} {isDemo && '(Demo)'}
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
                fontWeight: 800,
                color: '#1F2937',
                lineHeight: 1.2,
                marginBottom: '16px',
              }}
            >
              Welcome back, <span className="gradient-text-gradient">{firstName}</span>!
            </h1>

            <p
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                color: '#4B5563',
                lineHeight: 1.6,
                maxWidth: '720px',
                margin: '0 auto 32px',
              }}
            >
              You have{' '}
              <strong style={{ color: '#2D6A4F' }}>
                {userData?.stats?.pending_orders || 2} pending orders
              </strong>{' '}
              and{' '}
              <strong style={{ color: '#2D6A4F' }}>
                {userData?.stats?.pending_enquiries || 3} new enquiries
              </strong>{' '}
              waiting on your AgriShield dashboard.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: '48px',
              }}
            >
              <RippleButton primary href="/marketplace" className="btn-lg">
                🛒 Open Your Marketplace →
              </RippleButton>
              <RippleButton primary={false} href="#features" className="btn-lg">
                Explore All Tools ↓
              </RippleButton>
            </div>
          </div>
        ) : (
          /* ============================================================
             DEMO HERO (NOT LOGGED IN MODE)
             ============================================================ */
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#E8F5E9',
                color: '#2D6A4F',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '0.88rem',
                fontWeight: 700,
                marginBottom: '20px',
              }}
            >
              <span>🇮🇳</span> Free for Every Indian Farmer
            </div>

            <GradientText
              line1="Smart Farming —"
              line2="All Tools in One Place"
            />

            <p
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                color: '#6B7280',
                lineHeight: 1.6,
                maxWidth: '700px',
                margin: '0 auto 32px',
              }}
            >
              Order farm inputs, book machinery, find labour, check live mandi prices, and calculate inputs — completely free for every Indian farmer.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: '48px',
              }}
            >
              <RippleButton primary href="/marketplace">
                🛒 Explore Marketplace →
              </RippleButton>
              <RippleButton primary={false} href="#features">
                Explore All Tools ↓
              </RippleButton>
            </div>
          </div>
        )}

        {/* ============================================================
           HERO STATS COUNTERS SECTION (AUTH INTEGRATED)
           ============================================================ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '20px',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(45, 106, 79, 0.15)',
            borderRadius: '16px',
            padding: '24px 16px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
          }}
        >
          {isLoggedIn ? (
            <>
              <AnimatedCounter
                demoValue={50000}
                userDataKey="referrals"
                suffix="+"
                label="Farmers You Referred"
              />
              <AnimatedCounter
                demoValue={18}
                userDataKey="active_states"
                suffix=""
                label="States Active"
              />
              <AnimatedCounter
                demoValue={26}
                userDataKey="total_orders"
                suffix="+"
                label="Orders Placed"
              />
              <AnimatedCounter
                demoValue={5}
                userDataKey="tools_used"
                suffix=""
                label="Tools Used"
              />
            </>
          ) : (
            <>
              <AnimatedCounter
                demoValue={50000}
                suffix="+"
                label="Farmers Served"
              />
              <AnimatedCounter
                demoValue={18}
                suffix=""
                label="States Covered"
              />
              <AnimatedCounter
                demoValue={26}
                suffix="+"
                label="Products Listed"
              />
              <AnimatedCounter
                demoValue={5}
                suffix=""
                label="Smart Tools"
              />
            </>
          )}
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          zIndex: 5,
          color: '#6B7280',
          fontSize: '14px',
          fontWeight: 500,
          animation: 'bounceSlow 2s ease-in-out infinite',
        }}
      >
        Scroll to explore ↓
      </div>
    </section>
  );
};

export default HeroSection;
