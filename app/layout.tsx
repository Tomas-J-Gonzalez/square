import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Show up or Else - Make event planning fun and flake-proof',
  description: 'Create events, collect RSVPs, and keep everyone accountable with playful punishments and rewards.',
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
