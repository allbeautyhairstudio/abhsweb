import type { Metadata } from 'next';
import Script from 'next/script';
import { StructuredData } from '@/components/seo/structured-data';
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
    'Intentional hair design by Karli Rosario in Wildomar, CA. Low maintenance cuts and color that grow out gracefully, so you decide when to come back. Serving Wildomar, Murrieta, Temecula, and surrounding areas.',
  keywords: [
    'hairstylist wildomar',
    'hair salon wildomar',
    'balayage wildomar',
    'hair colorist wildomar',
    'low maintenance hair wildomar',
    'intentional hair design',
    'precision haircuts wildomar',
    'hairstylist murrieta',
    'hair salon murrieta',
    'balayage murrieta',
    'hairstylist temecula',
    'hair salon temecula',
    'balayage temecula',
    'hairstylist lake elsinore',
    'hair salon menifee',
    'hair salon canyon lake',
    'dimensional color wildomar',
    'lived in color wildomar',
    'color correction wildomar',
    'karli rosario hair',
    'the colour parlor wildomar',
    'women haircut wildomar',
    'mens haircut wildomar',
    'hair salon near me wildomar',
    'best hairstylist wildomar ca',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Karli Rosario — Intentional Hair Design',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  other: {
    'ai-content-declaration': 'original',
  },
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
        <StructuredData />
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
