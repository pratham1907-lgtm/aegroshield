"use client";

import React, { useEffect, useState, ReactNode } from 'react';

export interface ParallaxBackgroundProps {
  children?: ReactNode;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
  children,
  speed = 0.5,
  className = '',
  style = {},
}) => {
  const [scrollY, setScrollY] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    let animationFrameId: number;

    const handleScroll = () => {
      if (window.innerWidth < 768) return;
      animationFrameId = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const parallaxTransform = isMobile ? 'none' : `translateY(${scrollY * speed}px)`;
  const opacityFade = isMobile ? 1 : Math.max(0.3, 1 - (scrollY / 800) * 0.7);

  return (
    <div
      className={`parallax-background-root ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: isMobile ? '100%' : '120vh',
        background: 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)',
        transform: parallaxTransform,
        opacity: opacityFade,
        zIndex: 0,
        pointerEvents: 'none',
        transition: isMobile ? 'none' : 'transform 0.1s ease-out',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default ParallaxBackground;
