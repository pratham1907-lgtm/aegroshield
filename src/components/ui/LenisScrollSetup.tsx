"use client";

import React, { useEffect } from 'react';

export const LenisScrollSetup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Enable smooth scroll behavior on root html element
    document.documentElement.style.scrollBehavior = 'smooth';

    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  return <>{children}</>;
};

export default LenisScrollSetup;
