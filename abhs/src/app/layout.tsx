import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter, Playfair_Display, Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://allbeautyhairstudio.com'),
  title: {
    default: 'Karli Rosario | Intentional Hair Design — Wildomar, CA',
    template: '%s | Karli Rosario',
  },
  description:
    'Low maintenance cut and color services that grow out gracefully, allowing you to decide when you come back, not your hair. Located at The Colour Parlor in Wildomar, CA.',
  keywords: [
    'hairstylist wildomar',
    'intentional hair design',
    'precision haircuts',
    'balayage wildomar',
    'low maintenance hair',
    'hair colorist wildomar',
    'the colour parlor',
    'karli rosario',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Karli Rosario — Intentional Hair Design',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Script
          src="https://analytics.builtbybas.com/script.js"
          data-website-id="bf645176-d22f-493c-9680-f5ee38aabbbd"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
