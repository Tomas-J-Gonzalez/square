import { Metadata } from 'next';
import { supabase } from '../../../lib/supabase';

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
            url: '/assets/Logo.svg',
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
            url: '/assets/Logo.svg',
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
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    
    // Fetch event data
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', params.eventId)
      .single();

    if (error || !event) {
      return {
        title: 'Event Not Found - Show up or Else',
        description: 'This event invitation is invalid or has been deleted.',
      };
    }

    // Get host name
    const { data: host } = await supabase
      .from('users')
      .select('name')
      .eq('email', event.invited_by)
      .single();

    const hostName = host?.name?.split(' ')[0] || 'Someone';
    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const title = `Event invitation by ${hostName} - ${event.title}`;
    const description = `You're invited to ${event.title} on ${eventDate} at ${event.location}. Join us for this ${event.event_type} event!`;

    return {
      title,
      description,
      keywords: ['event invitation', 'RSVP', event.event_type, event.location],
      openGraph: {
        title,
        description,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://square-tomas-j-gonzalez.vercel.app'}/invite/${params.eventId}`,
        siteName: 'Show up or Else',
        images: [
          {
            url: '/assets/Logo.svg',
            width: 1200,
            height: 630,
            alt: `${event.title} - Event Invitation`,
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
            url: '/assets/Logo.svg',
            alt: `${event.title} - Event Invitation`,
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
