"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VendorRegisterRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/vendor/login?tab=signup');
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      Redirecting to Seller Registration...
    </div>
  );
}
