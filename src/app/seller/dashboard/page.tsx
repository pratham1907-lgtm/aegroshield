"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SellerDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/vendor/dashboard');
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif', color: '#1e293b' }}>
      Loading Seller Dashboard…
    </div>
  );
}
