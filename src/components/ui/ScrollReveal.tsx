"use client";

import React, { useEffect, useRef, useState, ReactNode } from 'react';

export interface ScrollRevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'up',
  duration = 0.8,
  delay = 0,
  className = '',
  style = {},
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Check prefers-reduced-motion media query
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  const getInitialTransform = () => {
    switch (direction) {
      case 'down':
        return 'translateY(-40px)';
      case 'left':
        return 'translateX(40px)';
      case 'right':
        return 'translateX(-40px)';
      case 'up':
      default:
        return 'translateY(40px)';
    }
  };

  const animationStyles: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translate(0, 0)' : getInitialTransform(),
    transition: `opacity ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s, transform ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s`,
    willChange: 'opacity, transform',
    ...style,
  };

  return (
    <div ref={ref} className={`scroll-reveal-container ${className}`} style={animationStyles}>
      {children}
    </div>
  );
};

export default ScrollReveal;
