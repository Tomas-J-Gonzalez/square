import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Show up or Else - Make event planning fun and flake-proof',
  description: 'Create events, collect RSVPs, and keep everyone accountable with playful punishments and rewards.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
