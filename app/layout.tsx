import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Show up or Else - Make event planning fun and flake-proof',
  description: 'Create events, collect RSVPs, and keep everyone accountable with playful punishments and rewards.',
  icons: {
    icon: '/logo-res.svg',
    apple: '/logo-res.svg',
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
        <link rel="icon" href="/logo-res.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo-res.svg" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
