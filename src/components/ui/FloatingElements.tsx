"use client";

import React, { useEffect, useState } from 'react';

const POSITIONS = [
  { left: '20%', top: '10%', duration: '4s', delay: '0s' },
  { left: '35%', top: '22%', duration: '4.5s', delay: '0.5s' },
  { left: '50%', top: '15%', duration: '5s', delay: '1s' },
  { left: '65%', top: '28%', duration: '5.5s', delay: '1.5s' },
  { left: '80%', top: '18%', duration: '6s', delay: '2s' },
];

export const FloatingElements: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div
      className="floating-elements-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {POSITIONS.map((pos, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            left: pos.left,
            top: pos.top,
            fontSize: '32px',
            opacity: isMobile ? 0.15 : 0.25,
            animation: isMobile
              ? 'none'
              : `floatBob ${pos.duration} ease-in-out ${pos.delay} infinite, floatRotate ${pos.duration} ease-in-out ${pos.delay} infinite`,
            userSelect: 'none',
          }}
        >
          🌿
        </div>
      ))}
    </div>
  );
};

export default FloatingElements;
