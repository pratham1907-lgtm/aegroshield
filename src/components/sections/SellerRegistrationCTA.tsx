"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { RippleButton } from '@/components/ui/RippleButton';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const SellerRegistrationCTA: React.FC = () => {
  const { user, userData, isDemo, isLoading } = useAuth();

  const isLoggedIn = Boolean(user || isDemo || userData);
  const role = userData?.role || 'farmer';

  if (isLoading) {
    return null;
  }

  return (
    <section style={{ padding: '64px 24px', background: '#FFFFFF' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <ScrollReveal direction="up">
          <div
            style={{
              background: 'linear-gradient(135deg, #2D6A4F 0%, #40916C 100%)',
              borderRadius: '24px',
              padding: '48px 32px',
              color: '#FFFFFF',
              textAlign: 'center',
              boxShadow: '0 12px 40px rgba(45, 106, 79, 0.25)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
              {!isLoggedIn ? (
                /* ============================================================
                   VERSION 1: UNAUTHENTICATED / GUEST MODE (DEALER PROMPT)
                   ============================================================ */
                <>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(255, 255, 255, 0.18)',
                      color: '#FFFFFF',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      marginBottom: '16px',
                    }}
                  >
                    🏬 Local Dealer Partnership
                  </div>
                  <h2
                    style={{
                      fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      marginBottom: '12px',
                      lineHeight: 1.2,
                    }}
                  >
                    Are You a Local Agri-Input Dealer or Shopkeeper?
                  </h2>
                  <p
                    style={{
                      fontSize: '1rem',
                      color: '#B7E4C7',
                      lineHeight: 1.6,
                      maxWidth: '620px',
                      margin: '0 auto 32px',
                    }}
                  >
                    Expand your reach! Register your shop on Aegroshield to showcase your inventory of fertilizers, seeds, and pesticides to thousands of farmers in your district.
                  </p>
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <RippleButton
                      primary={false}
                      href="/vendor/login?tab=signup"
                      style={{ background: '#FFFFFF', color: '#2D6A4F', border: 'none' }}
                    >
                      Register Store as Seller
                    </RippleButton>
                    <RippleButton
                      primary={false}
                      href="/vendor/login"
                      style={{ background: 'transparent', color: '#FFFFFF', borderColor: '#FFFFFF' }}
                    >
                      Seller Portal Login →
                    </RippleButton>
                  </div>
                </>
              ) : role === 'vendor' ? (
                /* ============================================================
                   VERSION 3: LOGGED-IN DEALER / VENDOR MODE
                   ============================================================ */
                <>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(255, 255, 255, 0.18)',
                      color: '#FFFFFF',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      marginBottom: '16px',
                    }}
                  >
                    🏬 Seller Dashboard Active
                  </div>
                  <h2
                    style={{
                      fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      marginBottom: '12px',
                      lineHeight: 1.2,
                    }}
                  >
                    Your Seller Dashboard
                  </h2>
                  <p
                    style={{
                      fontSize: '1rem',
                      color: '#B7E4C7',
                      lineHeight: 1.6,
                      maxWidth: '620px',
                      margin: '0 auto 32px',
                    }}
                  >
                    Manage your shop inventory, view customer orders, and track your district store sales directly from your vendor portal.
                  </p>
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <RippleButton
                      primary={false}
                      href="/vendor/dashboard"
                      style={{ background: '#FFFFFF', color: '#2D6A4F', border: 'none' }}
                    >
                      Go to Seller Dashboard →
                    </RippleButton>
                  </div>
                </>
              ) : (
                /* ============================================================
                   VERSION 2: LOGGED-IN FARMER MODE
                   ============================================================ */
                <>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(255, 255, 255, 0.18)',
                      color: '#FFFFFF',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      marginBottom: '16px',
                    }}
                  >
                    🏬 Verified Local Dealer Network
                  </div>
                  <h2
                    style={{
                      fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      marginBottom: '12px',
                      lineHeight: 1.2,
                    }}
                  >
                    Connect with Verified Agricultural Dealers
                  </h2>
                  <p
                    style={{
                      fontSize: '1rem',
                      color: '#B7E4C7',
                      lineHeight: 1.6,
                      maxWidth: '620px',
                      margin: '0 auto 32px',
                    }}
                  >
                    Browse and connect with verified sellers in your district. Get genuine products, transparent prices, and Cash on Delivery service.
                  </p>
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <RippleButton
                      primary={false}
                      href="/marketplace"
                      style={{ background: '#FFFFFF', color: '#2D6A4F', border: 'none' }}
                    >
                      Find Sellers Near You →
                    </RippleButton>
                  </div>
                </>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default SellerRegistrationCTA;
