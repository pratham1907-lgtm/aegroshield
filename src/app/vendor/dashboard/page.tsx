"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VendorDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/seller/dashboard');
  }, [router]);

  return (
    <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b' }}>
      <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Redirecting to Seller Dashboard...</p>
      <Link href="/seller/dashboard" style={{ color: '#16a34a', textDecoration: 'underline', marginTop: '12px', display: 'inline-block' }}>
        Click here if not redirected automatically
      </Link>
    </div>
  );
}
