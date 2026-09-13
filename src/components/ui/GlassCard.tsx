"use client";

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export interface GlassCardProps {
  icon: ReactNode | string;
  title: string;
  description: string;
  ctaText?: string;
  ctaHref?: string;
  delay?: number;
  isDemoCard?: boolean;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  icon,
  title,
  description,
  ctaText,
  ctaHref,
  delay = 0,
  isDemoCard = true,
  className = '',
}) => {
  const { user, isLoading } = useAuth();

  // If this card should only show for logged-in users and user is not logged in, don't render
  if (!isDemoCard && !user && !isLoading) {
    return null;
  }

  return (
    <div
      className={`glass-card-root ${className}`}
      style={{
        padding: '32px',
        animationDelay: `${delay}s`,
      }}
    >
      {/* Background Hover Overlay */}
      <div className="glass-card-overlay" />

      {/* Card Content Layers */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* 1. Icon */}
        <div style={{ fontSize: '40px', marginBottom: '16px', lineHeight: 1 }}>
          {icon}
        </div>

        {/* 2. Title */}
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#1F2937',
            marginBottom: '8px',
            lineHeight: 1.3,
          }}
        >
          {title}
        </h3>

        {/* 3. Description */}
        <p
          style={{
            fontSize: '15px',
            color: '#6B7280',
            lineHeight: 1.6,
            marginBottom: '20px',
            flexGrow: 1,
          }}
        >
          {description}
        </p>

        {/* 4. CTA Link */}
        {ctaText && ctaHref && (
          <div style={{ marginTop: 'auto' }}>
            <Link
              href={ctaHref}
              className="glass-card-cta"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#2D6A4F',
                fontWeight: 600,
                fontSize: '15px',
                textDecoration: 'none',
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              <span>{ctaText}</span>
              <span className="glass-cta-underline" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlassCard;
