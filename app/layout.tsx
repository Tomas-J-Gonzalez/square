import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'https://square-tomas-j-gonzalez.vercel.app'),
  title: 'Show up or Else - Make event planning fun and flake-proof',
  description: 'Create events, collect RSVPs, and keep everyone accountable with playful punishments and rewards.',
  keywords: ['event planning', 'RSVP', 'social events', 'group activities', 'event management'],
  authors: [{ name: 'Show up or Else' }],
  creator: 'Show up or Else',
  publisher: 'Show up or Else',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/assets/circle-pink.svg', type: 'image/svg+xml' },
      { url: '/assets/circle-pink.svg', sizes: '32x32', type: 'image/svg+xml' },
      { url: '/assets/circle-pink.svg', sizes: '16x16', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/assets/circle-pink.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
      title: 'Show up or Else - Make event planning fun and flake-proof',
      description: 'Create events, collect RSVPs, and keep everyone accountable with playful punishments and rewards.',
      url: 'https://square-tomas-j-gonzalez.vercel.app',
      siteName: 'Show up or Else',
      images: [
        {
          url: '/assets/Logo.svg',
          width: 1200,
          height: 630,
          alt: 'Show up or Else - Event Planning Made Fun',
          type: 'image/svg+xml',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
  twitter: {
    card: 'summary_large_image',
    title: 'Show up or Else - Make event planning fun and flake-proof',
    description: 'Create events, collect RSVPs, and keep everyone accountable with playful punishments and rewards.',
    creator: '@showuporelse',
    images: [
      {
        url: '/assets/Logo.svg',
        alt: 'Show up or Else - Event Planning Made Fun',
      },
    ],
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
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
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
        <link rel="icon" href="/assets/circle-pink.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/assets/circle-pink.svg" />
        <meta name="theme-color" content="#EC4899" />
        <meta name="msapplication-TileColor" content="#EC4899" />
      </head>
      <body className="antialiased">
        <Providers>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
