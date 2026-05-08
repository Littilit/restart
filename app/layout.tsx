import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Cryopoint Augsburg – Anmeldung',
  description: 'Dein persönlicher Anwendungsplan für das Cryopoint Longevity Spa Augsburg.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
