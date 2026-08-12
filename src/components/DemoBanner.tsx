"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { isDemoSessionActive } from '@/lib/ecommerce-service';
import { Sparkles } from 'lucide-react';

export default function DemoBanner() {
  const pathname = usePathname();
  const [demoActive, setDemoActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Banner MUST ONLY show when an active Demo Session exists (logged into demo account)
    setDemoActive(isDemoSessionActive());
  }, [pathname]);

  if (!mounted || !demoActive) return null;

  return (
    <div className="demo-account-top-banner">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <Sparkles size={16} />
        <span>
          <strong>Demo Account Active</strong> — Viewing Sample Evaluation Data.
        </span>
      </div>
    </div>
  );
}
