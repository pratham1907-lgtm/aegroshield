"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MarketplacePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/store');
  }, [router]);

  return (
    <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b' }}>
      <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Redirecting to AgriShield Store...</p>
      <Link href="/store" style={{ color: '#16a34a', textDecoration: 'underline', marginTop: '12px', display: 'inline-block' }}>
        Click here if not redirected automatically
      </Link>
    </div>
  );
}
