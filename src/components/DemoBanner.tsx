"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { isDemoSessionActive } from '@/lib/ecommerce-service';
import { Sparkles } from 'lucide-react';

export default function DemoBanner() {
  const rawPathname = usePathname();
  const pathname = rawPathname || '';
  const [demoActive, setDemoActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDemoActive(isDemoSessionActive());
  }, [pathname]);

  // NEVER render Demo Banner on public entrance pages (/, /login, /admin/login)
  const isPublicEntrance =
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/admin/login');

  if (!mounted || !demoActive || isPublicEntrance) {
    return null;
  }

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
