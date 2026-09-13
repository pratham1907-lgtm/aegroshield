"use client";

import React, { useState, MouseEvent, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export interface RippleButtonProps {
  children: ReactNode;
  primary?: boolean;
  href?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface RippleSpan {
  x: number;
  y: number;
  id: number;
}

export const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  primary = true,
  href,
  onClick,
  disabled = false,
  className = '',
  style = {},
}) => {
  const { user, isDemo } = useAuth();
  const router = useRouter();
  const [ripples, setRipples] = useState<RippleSpan[]>([]);

  const handleRipple = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { x, y, id: Date.now() };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    handleRipple(e);

    // Auth redirection logic for protected routes when not logged in
    const isLoggedIn = Boolean(user || isDemo);
    if (!isLoggedIn && href && (href.startsWith('/marketplace/user') || href.startsWith('/checkout') || href.startsWith('/cart'))) {
      e.preventDefault();
      router.push('/login');
      return;
    }

    onClick?.(e);
  };

  const baseStyles: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '16px',
    transition: 'all 0.3s ease',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
    textDecoration: 'none',
    boxSizing: 'border-box',
    ...style,
  };

  const primaryStyles: React.CSSProperties = {
    ...baseStyles,
    background: 'linear-gradient(135deg, #40916C 0%, #2D6A4F 100%)',
    color: '#FFFFFF',
    padding: '12px 32px',
    border: 'none',
    boxShadow: '0px 4px 15px rgba(45, 106, 79, 0.3)',
  };

  const secondaryStyles: React.CSSProperties = {
    ...baseStyles,
    background: '#FFFFFF',
    color: '#2D6A4F',
    border: '2px solid #2D6A4F',
    padding: '10px 32px',
    boxShadow: 'none',
  };

  const currentStyle = primary ? primaryStyles : secondaryStyles;

  const content = (
    <>
      <span style={{ position: 'relative', zIndex: 2, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        {children}
      </span>

      {/* Render Ripples */}
      {ripples.map(r => (
        <span
          key={r.id}
          className="ripple-span"
          style={{
            top: r.y - 200,
            left: r.x - 200,
            width: '400px',
            height: '400px',
          }}
        />
      ))}
    </>
  );

  if (href && !disabled) {
    return (
      <Link
        href={href}
        onClick={handleClick}
        className={`ripple-btn-container ${primary ? 'ripple-btn-primary' : 'ripple-btn-secondary'} ${className}`}
        style={currentStyle}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`ripple-btn-container ${primary ? 'ripple-btn-primary' : 'ripple-btn-secondary'} ${className}`}
      style={currentStyle}
    >
      {content}
    </button>
  );
};

export default RippleButton;
