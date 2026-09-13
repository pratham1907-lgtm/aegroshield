"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VendorRegisterRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/seller/register');
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      Redirecting to Seller Registration...
    </div>
  );
}
