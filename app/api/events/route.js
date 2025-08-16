import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client (will be created when needed)
let supabase = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables:');
      console.error('  NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.error('  SUPABASE_URL:', !!process.env.SUPABASE_URL);
      console.error('  SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
      throw new Error('Supabase environment variables not configured');
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

export async function POST(request) {
  try {
    console.log('Events API - Request method: POST');
    
    const body = await request.json();
    console.log('Events API - Request body:', body);
    
    const { action, eventData, eventId, updates } = body;

    if (!action) {
      console.error('Events API - No action provided');
      return NextResponse.json({ success: false, error: 'Action is required' }, { status: 400 });
    }

    console.log('Events API - Processing action:', action);

    switch (action) {
      case 'getEvents':
        return await getEvents(body);
      case 'getEvent':
        return await getEvent(body);
      case 'getPastEvents':
        return await getPastEvents(body);
      case 'createEvent':
        return await createEvent(body);
      case 'updateEvent':
        return await updateEvent(body);
      case 'deleteEvent':
        return await deleteEvent(body);
      case 'cancelEvent':
        return await cancelEvent(body);
      case 'completeEvent':
        return await completeEvent(body);
      default:
        console.error('Events API - Invalid action:', action);
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Events API - Unhandled error:', error);
    console.error('Events API - Error message:', error.message);
    console.error('Events API - Error stack:', error.stack);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

async function getEvents(body) {
  try {
    const { userEmail } = body;
    
    if (!userEmail) {
      return NextResponse.json({ success: false, error: 'User email required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('invited_by', userEmail)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch events' }, { status: 500 });
    }

    // Get participant count for each event
    const eventsWithParticipantCount = await Promise.all(
      (data || []).map(async (event) => {
        try {
          const { count, error: countError } = await supabase
            .from('event_rsvps')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .eq('will_attend', true);
          if (countError) {
            console.error('Error fetching participant count for event', event.id, ':', countError);
            return { ...event, participant_count: 0 };
          }
          return { ...event, participant_count: count || 0 };
        } catch (countError) {
          console.error('Error fetching participant count for event', event.id, ':', countError);
          return { ...event, participant_count: 0 };
        }
      })
    );

    return NextResponse.json({ success: true, events: eventsWithParticipantCount });
  } catch (error) {
    console.error('Error in getEvents:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

async function getEvent(body) {
  try {
    const { eventId } = body;
    
    if (!eventId) {
      return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, event: data });
  } catch (error) {
    console.error('Error in getEvent:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

async function createEvent(body) {
  try {
    const { eventData } = body;
    
    if (!eventData) {
      return NextResponse.json({ success: false, error: 'Event data required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    
    // Check if user already has an active event
    const { data: activeEvents, error: checkError } = await supabase
      .from('events')
      .select('*')
      .eq('invited_by', eventData.invited_by)
      .eq('status', 'active');

    if (checkError) {
      console.error('Error checking active events:', checkError);
      return NextResponse.json({ success: false, error: 'Failed to check existing events' }, { status: 500 });
    }

    if (activeEvents && activeEvents.length > 0) {
      const activeEvent = activeEvents[0];
      return NextResponse.json({ 
        success: false, 
        error: `You can only host a maximum of 1 event at a time. Please cancel or complete your current event "${activeEvent.title}" before creating a new one.`
      }, { status: 400 });
    }

    const insertData = {
      title: eventData.title,
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      event_type: eventData.eventType || 'in-person',
      event_details: eventData.eventDetails || null,
      decision_mode: eventData.decisionMode,
      punishment: eventData.punishment,
      punishment_severity: eventData.punishmentSeverity || 5,
      invited_by: eventData.invited_by,
      status: 'active'
    };

    const { data, error } = await supabase
      .from('events')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return NextResponse.json({ success: false, error: 'Failed to create event' }, { status: 500 });
    }

    return NextResponse.json({ success: true, event: data });
  } catch (error) {
    console.error('Error in createEvent:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

async function updateEvent(body) {
  try {
    const { eventId, updates } = body;
    
    if (!eventId || !updates) {
      return NextResponse.json({ success: false, error: 'Event ID and updates required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('events')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      return NextResponse.json({ success: false, error: 'Failed to update event' }, { status: 500 });
    }

    return NextResponse.json({ success: true, event: data });
  } catch (error) {
    console.error('Error in updateEvent:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

async function cancelEvent(body) {
  try {
    const { eventId } = body;
    
    if (!eventId) {
      return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('events')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      console.error('Error cancelling event:', error);
      return NextResponse.json({ success: false, error: 'Failed to cancel event' }, { status: 500 });
    }

    return NextResponse.json({ success: true, event: data });
  } catch (error) {
    console.error('Error in cancelEvent:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

async function completeEvent(body) {
  try {
    const { eventId } = body;
    
    if (!eventId) {
      return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('events')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      console.error('Error completing event:', error);
      return NextResponse.json({ success: false, error: 'Failed to complete event' }, { status: 500 });
    }

    return NextResponse.json({ success: true, event: data });
  } catch (error) {
    console.error('Error in completeEvent:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

async function deleteEvent(body) {
  try {
    const { eventId } = body;
    
    if (!eventId) {
      return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting event:', error);
      return NextResponse.json({ success: false, error: 'Failed to delete event' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

async function getPastEvents(body) {
  try {
    const { userEmail } = body;
    
    if (!userEmail) {
      return NextResponse.json({ success: false, error: 'User email required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('invited_by', userEmail)
      .in('status', ['completed', 'cancelled'])
      .order('created_at', { ascending: false });

    if (eventsError) {
      console.error('Error fetching past events:', eventsError);
      return NextResponse.json({ success: false, error: 'Failed to fetch past events' }, { status: 500 });
    }

    const eventsWithFlakes = await Promise.all(
      (events || []).map(async (event) => {
        try {
          const { data: flakes, error: flakesError } = await supabase
            .from('event_rsvps')
            .select('id, name, email, message')
            .eq('event_id', event.id)
            .eq('will_attend', false);
          if (flakesError) {
            console.error('Error fetching flakes for event', event.id, ':', flakesError);
            return { ...event, flakes: [] };
          }
          return { ...event, flakes: flakes || [] };
        } catch (flakesError) {
          console.error('Error fetching flakes for event', event.id, ':', flakesError);
          return { ...event, flakes: [] };
        }
      })
    );

    return NextResponse.json({ success: true, events: eventsWithFlakes });
  } catch (error) {
    console.error('Error in getPastEvents:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
