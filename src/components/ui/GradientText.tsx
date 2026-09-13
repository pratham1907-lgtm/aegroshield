"use client";

import React from 'react';

export interface GradientTextProps {
  line1?: string;
  line2?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const GradientText: React.FC<GradientTextProps> = ({
  line1 = "Smart Farming —",
  line2 = "All Tools in One Place",
  className = '',
  style = {},
}) => {
  return (
    <h1
      className={`gradient-text-header ${className}`}
      style={{
        textAlign: 'center',
        margin: '0 auto 24px',
        lineHeight: 1.15,
        letterSpacing: '-0.02em',
        ...style,
      }}
    >
      <span
        style={{
          display: 'block',
          color: '#1F2937',
          fontWeight: 700,
          fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
        }}
      >
        {line1}
      </span>
      <span
        className="gradient-text-gradient"
        style={{
          display: 'block',
          fontWeight: 700,
          fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
        }}
      >
        {line2}
      </span>
    </h1>
  );
};

export default GradientText;
