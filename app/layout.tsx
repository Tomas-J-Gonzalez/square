import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'https://square-tomas-j-gonzalez.vercel.app'),
  title: 'Show up or Else - Make event planning fun and flake-proof',
  description: 'Create events, collect RSVPs, and keep everyone accountable with playful punishments and rewards.',
  icons: {
    icon: '/assets/circle-pink.svg',
    apple: '/assets/circle-pink.svg',
  },
  openGraph: {
    title: 'Show up or Else - Make event planning fun and flake-proof',
    description: 'Create events, collect RSVPs, and keep everyone accountable with playful punishments and rewards.',
    images: [
      {
        url: '/assets/Logo.svg',
        width: 1200,
        height: 630,
        alt: 'Show up or Else',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Show up or Else - Make event planning fun and flake-proof',
    description: 'Create events, collect RSVPs, and keep everyone accountable with playful punishments and rewards.',
    images: ['/assets/Logo.svg'],
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
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
