import type { Metadata, Viewport } from 'next';
import { Inter, Sora, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://digilog.app'),
  title: {
    default: 'DigiLog — Smart Digital Logbook for Modern Industrial Operations',
    template: '%s · DigiLog',
  },
  description:
    'DigiLog is the enterprise-grade digital logbook platform for refineries, power plants, and manufacturing. Shift logs, incident management, CAPA, handovers, and real-time analytics — all in one secure system.',
  keywords: [
    'digital logbook',
    'shift logbook',
    'industrial operations',
    'incident management',
    'CAPA',
    'shift handover',
    'refinery software',
    'plant operations',
  ],
  authors: [{ name: 'DigiLog' }],
  openGraph: {
    type: 'website',
    title: 'DigiLog — Smart Digital Logbook for Modern Industrial Operations',
    description:
      'The enterprise digital logbook for refineries, power plants, and manufacturing operations.',
    siteName: 'DigiLog',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#080b1a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${sora.variable} ${jetbrains.variable} font-sans`}
      >
        <Providers>
          {children}
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
