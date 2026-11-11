import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/lib/language-context';
import { CartProvider } from '@/lib/cart-context';
import NavbarClient from '@/components/Navbar';
import CartDrawer from '@/components/cart/CartDrawer';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import PwaRegister from '@/components/PwaRegister';
import './globals.css';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://aegroshield.vercel.app'),
  title: 'AegroShield — Kisan Agri OS & Local Marketplace',
  description: 'Unified smart agriculture platform for Indian farmers. Order verified seeds & fertilizers, book tractors & farm labour, and check live APMC mandi rates.',
  keywords: [
    'AegroShield',
    'Kisan Agri Marketplace',
    'Live Mandi Rates',
    'APMC Mandi Bhav',
    'Fertilizer Online',
    'Seeds Store',
    'Tractor Rental India',
    'Farm Labour Booking',
    'Kisan Helpline',
    'Agro Weather Advisory',
  ],
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'AegroShield — Kisan Agri OS & Local Marketplace',
    description: 'Order verified seeds & fertilizers from local agri-stores, book tractors & labour, and get live APMC mandi rates with AI crop advisory.',
    url: 'https://aegroshield.vercel.app',
    siteName: 'AegroShield',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AegroShield — Kisan Agri OS & Local Marketplace',
    description: 'Direct farm inputs, live APMC mandi rates, machinery rental, and 24/7 Kisan AI assistant.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Noto+Sans+Devanagari:wght@300;400;500;600;700;800&display=swap" />
      </head>
      <body>
        <AuthProvider>
          <LanguageProvider>
            <CartProvider>
              <NavbarClient />
              <CartDrawer />
              {children}
              <Footer />
              <Chatbot />
              <PwaRegister />
            </CartProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

