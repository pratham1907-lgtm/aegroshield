"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface StatItem {
  userDataKey?: string;
  demoValue: number;
  suffix: string;
  label: string;
  delay: number;
}

export const StatsSection: React.FC = () => {
  const { user, userData, isDemo } = useAuth();
  const isLoggedIn = Boolean(user || isDemo || userData);

  const stats: StatItem[] = isLoggedIn
    ? [
        { userDataKey: 'referrals', demoValue: 50000, suffix: '+', label: 'Farmers You Referred', delay: 0 },
        { userDataKey: 'active_states', demoValue: 18, suffix: '', label: 'States Active', delay: 0.1 },
        { userDataKey: 'total_orders', demoValue: 26, suffix: '+', label: 'Orders Placed', delay: 0.2 },
        { userDataKey: 'tools_used', demoValue: 5, suffix: '', label: 'Tools You Use', delay: 0.3 },
      ]
    : [
        { demoValue: 50000, suffix: '+', label: 'Farmers Served', delay: 0 },
        { demoValue: 18, suffix: '', label: 'States Covered', delay: 0.1 },
        { demoValue: 26, suffix: '+', label: 'Products Listed', delay: 0.2 },
        { demoValue: 5, suffix: '', label: 'Smart Tools', delay: 0.3 },
      ];

  return (
    <section
      className="stats-section-root"
      style={{
        background: '#FFFFFF',
        padding: '64px 24px',
        borderTop: '1px solid #E5E7EB',
        borderBottom: '1px solid #E5E7EB',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '32px',
          }}
        >
          {stats.map((item, idx) => (
            <ScrollReveal key={idx} direction="up" delay={item.delay}>
              <div
                style={{
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '32px 24px',
                  textAlign: 'center',
                  transition: 'background 0.3s ease',
                }}
              >
                <AnimatedCounter
                  demoValue={item.demoValue}
                  userDataKey={item.userDataKey}
                  suffix={item.suffix}
                  label={item.label}
                />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
