import { Metadata } from 'next';

interface Props {
  children: React.ReactNode;
  params: { eventId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://square-tomas-j-gonzalez.vercel.app';
  const inviteUrl = `${baseUrl}/invite/${params.eventId}`;
  
  // Default metadata for social sharing
  const title = 'Event Invitation - Show Up or Else';
  const description = 'You have been invited to an event. Join us for a great time!';
  const imageUrl = `${baseUrl}/assets/social-share.png`; // Use PNG instead of SVG

  return {
    title,
    description,
    keywords: ['event invitation', 'RSVP', 'party', 'gathering'],
    openGraph: {
      title,
      description,
      url: inviteUrl,
      siteName: 'Show Up or Else',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: 'Event Invitation - Show Up or Else',
          type: 'image/png', // Use PNG for better Facebook compatibility
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [
        {
          url: imageUrl,
          alt: 'Event Invitation - Show Up or Else',
        },
      ],
    },
    robots: {
      index: false, // Don't index invitation pages
      follow: false,
    },
    other: {
      // Additional meta tags for better social sharing
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:type': 'image/png',
      'og:image:alt': 'Event Invitation - Show Up or Else',
      'twitter:image:alt': 'Event Invitation - Show Up or Else',
    },
  };
}

export default function InviteLayout({ children }: Props) {
  return children;
}
