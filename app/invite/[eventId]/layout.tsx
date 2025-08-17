import { Metadata } from 'next';

interface Props {
  children: React.ReactNode;
  params: { eventId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Check if Supabase environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return default metadata if environment variables are not available
    return {
      title: 'Event Invitation - Show up or Else',
      description: 'You have been invited to an event.',
      openGraph: {
        title: 'Event Invitation - Show up or Else',
        description: 'You have been invited to an event.',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://square-tomas-j-gonzalez.vercel.app'}/invite/${params.eventId}`,
        siteName: 'Show up or Else',
        images: [
          {
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://square-tomas-j-gonzalez.vercel.app'}/assets/social-share.svg`,
            width: 1200,
            height: 630,
            alt: 'Event Invitation - Show up or Else',
            type: 'image/svg+xml',
          },
        ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Event Invitation - Show up or Else',
        description: 'You have been invited to an event.',
        images: [
          {
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://square-tomas-j-gonzalez.vercel.app'}/assets/social-share.svg`,
            alt: 'Event Invitation - Show up or Else',
          },
        ],
      },
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  try {
    // For now, return default metadata since we can't access Supabase on the server
    // The actual event data will be fetched on the client side
    const title = `Event invitation - Show up or Else`;
    const description = `You have been invited to an event. Click to view details and RSVP.`;
    const imageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://square-tomas-j-gonzalez.vercel.app'}/assets/social-share.svg`;

    return {
      title,
      description,
      keywords: ['event invitation', 'RSVP'],
      openGraph: {
        title,
        description,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://square-tomas-j-gonzalez.vercel.app'}/invite/${params.eventId}`,
        siteName: 'Show up or Else',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: 'Event Invitation - Show up or Else',
            type: 'image/svg+xml',
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
            alt: 'Event Invitation - Show up or Else',
          },
        ],
      },
      robots: {
        index: false, // Don't index invitation pages
        follow: false,
      },
    };
  } catch (error) {
    return {
      title: 'Event Invitation - Show up or Else',
      description: 'You have been invited to an event.',
    };
  }
}

export default function InviteLayout({ children }: Props) {
  return children;
}
