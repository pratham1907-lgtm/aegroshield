"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { isDemoMode } from '@/lib/ecommerce-service';
import { Sparkles } from 'lucide-react';

export default function DemoBanner() {
  const pathname = usePathname();
  const [demoActive, setDemoActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDemoActive(isDemoMode());
  }, [pathname]);

  if (!mounted || !demoActive) return null;

  return (
    <div className="demo-account-top-banner">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <Sparkles size={16} />
        <span>
          <strong>Demo Account Active</strong> — Viewing Sample Evaluation Data. (Real Sign-Ups create clean database accounts).
        </span>
      </div>
    </div>
  );
}
