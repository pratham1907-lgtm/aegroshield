"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface AnimatedCounterProps {
  demoValue: number;
  userDataKey?: string;
  suffix?: string;
  prefix?: string;
  label?: string;
  duration?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  demoValue,
  userDataKey,
  suffix = '',
  prefix = '',
  label = '',
  duration = 2000,
  className = '',
}) => {
  const { user, userData, isLoading } = useAuth();
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState<number>(0);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // Determine target value based on authentication state
  let targetValue = demoValue;
  if (user || userData) {
    if (userDataKey && userData?.stats && userData.stats[userDataKey] !== undefined) {
      targetValue = Number(userData.stats[userDataKey]);
    } else if (userDataKey && (user as any)?.stats && (user as any).stats[userDataKey] !== undefined) {
      targetValue = Number((user as any).stats[userDataKey]);
    }
  }

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const t = Math.min(progress / duration, 1);

      // Natural ease-out deceleration formula
      const easeOut = Math.min(1, 1.001 - Math.pow(2, -10 * t));
      const currentVal = Math.floor(easeOut * targetValue);

      setCount(currentVal);

      if (t < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(targetValue);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [hasStarted, targetValue, duration]);

  const formattedNumber = count.toLocaleString('en-IN');

  if (isLoading) {
    return (
      <div className={`animated-counter-root ${className}`} style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '36px', fontWeight: 700, color: '#2D6A4F', opacity: 0.5 }}>...</div>
        {label && <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '8px' }}>{label}</div>}
      </div>
    );
  }

  return (
    <div ref={ref} className={`animated-counter-root ${className}`} style={{ textAlign: 'center' }}>
      <div
        style={{
          fontSize: '36px',
          fontWeight: 700,
          color: '#2D6A4F',
          lineHeight: 1.2,
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        }}
      >
        {prefix}
        {formattedNumber}
        {suffix}
      </div>
      {label && (
        <div
          style={{
            fontSize: '14px',
            color: '#6B7280',
            marginTop: '8px',
            lineHeight: 1.4,
            fontWeight: 500,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default AnimatedCounter;
