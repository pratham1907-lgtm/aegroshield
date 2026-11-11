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
  title: 'AegroShield — Kisan Agri OS & Marketplace',
  description: 'Unified smart agriculture platform for Indian farmers. Order verified farm inputs, book machinery & labour, and check live mandi rates.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'AegroShield — Kisan Agri OS & Marketplace',
    description: 'Direct farm inputs, verified local agri-stores, live APMC mandi prices, and smart crop advisory for Indian farmers.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'AegroShield',
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

