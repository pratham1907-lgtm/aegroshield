import { LanguageProvider } from '@/lib/language-context';
import { CartProvider } from '@/lib/cart-context';
import NavbarClient from '@/components/Navbar';
import Chatbot from '@/components/Chatbot';
import './globals.css';

export const metadata = {
  title: 'Aegroshield — Smart Farming Platform',
  description: 'Smart Farming Platform for Indian Farmers',
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
        <LanguageProvider>
          <CartProvider>
            <NavbarClient />
            {children}
            <Chatbot />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
