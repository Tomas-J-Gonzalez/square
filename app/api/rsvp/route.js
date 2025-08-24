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
    console.log('RSVP API - Request method: POST');
    
    const body = await request.json();
    console.log('RSVP API - Request body:', body);
    
    const { action } = body;

    if (!action) {
      console.error('RSVP API - No action provided');
      return NextResponse.json({ success: false, error: 'Action is required' }, { status: 400 });
    }

    console.log('RSVP API - Processing action:', action);

    switch (action) {
      case 'addParticipant':
        return await addParticipant(body);
      case 'removeParticipant':
        return await removeParticipant(body);
      case 'getParticipants':
        return await getParticipants(body);
      case 'rsvp':
        return await rsvp(body);
      default:
        console.error('RSVP API - Invalid action:', action);
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('RSVP API - Unhandled error:', error);
    console.error('RSVP API - Error message:', error.message);
    console.error('RSVP API - Error stack:', error.stack);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

async function addParticipant(body) {
  try {
    const { eventId, participantData } = body;
    
    if (!eventId || !participantData) {
      return NextResponse.json({ success: false, error: 'Event ID and participant data required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    
    // Check if participant already exists for this event
    const { data: existingParticipant, error: checkError } = await supabase
      .from('event_rsvps')
      .select('*')
      .eq('event_id', eventId)
      .eq('email', participantData.email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing participant:', checkError);
      return NextResponse.json({ success: false, error: 'Failed to check existing participant' }, { status: 500 });
    }

    if (existingParticipant) {
      return NextResponse.json({ success: false, error: 'Participant already exists for this event' }, { status: 400 });
    }

    const insertData = {
      event_id: eventId,
      name: participantData.name,
      email: participantData.email,
      will_attend: true,
      message: participantData.message || null
    };

    const { data, error } = await supabase
      .from('event_rsvps')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error adding participant:', error);
      return NextResponse.json({ success: false, error: 'Failed to add participant' }, { status: 500 });
    }

    return NextResponse.json({ success: true, participant: data });
  } catch (error) {
    console.error('Error in addParticipant:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

async function removeParticipant(body) {
  try {
    const { participantId } = body;
    
    if (!participantId) {
      return NextResponse.json({ success: false, error: 'Participant ID required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('event_rsvps')
      .delete()
      .eq('id', participantId);

    if (error) {
      console.error('Error removing participant:', error);
      return NextResponse.json({ success: false, error: 'Failed to remove participant' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in removeParticipant:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

async function getParticipants(body) {
  try {
    const { eventId } = body;
    
    if (!eventId) {
      return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('event_rsvps')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching participants:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch participants' }, { status: 500 });
    }

    return NextResponse.json({ success: true, participants: data || [] });
  } catch (error) {
    console.error('Error in getParticipants:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

async function rsvp(body) {
  try {
    const { eventId, rsvpData, token } = body;
    
    if (!eventId || !rsvpData) {
      return NextResponse.json({ success: false, error: 'Event ID and RSVP data required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    
    // Validate RSVP access for private events
    const { data: accessValidation, error: accessError } = await supabase.rpc('validate_rsvp_access', {
      event_id_param: eventId,
      token_param: token || null,
      email_param: rsvpData.email || null
    });

    if (accessError) {
      console.error('Error validating RSVP access:', accessError);
      return NextResponse.json({ success: false, error: 'Failed to validate access' }, { status: 500 });
    }

    if (!accessValidation) {
      return NextResponse.json({ 
        success: false, 
        error: 'This event is invite-only. Please contact the host for an invitation.',
        accessDenied: true
      }, { status: 403 });
    }
    
    // If email is provided, check if participant already exists for this event
    let existingParticipant = null;
    if (rsvpData.email) {
      const { data, error: checkError } = await supabase
        .from('event_rsvps')
        .select('*')
        .eq('event_id', eventId)
        .eq('email', rsvpData.email)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing participant:', checkError);
        return NextResponse.json({ success: false, error: 'Failed to check existing participant' }, { status: 500 });
      }
      existingParticipant = data;
    }

    let result;
    if (existingParticipant) {
      // Update existing RSVP
      const { data, error } = await supabase
        .from('event_rsvps')
        .update({
          will_attend: rsvpData.willAttend,
          message: rsvpData.message || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingParticipant.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating RSVP:', error);
        return NextResponse.json({ success: false, error: 'Failed to update RSVP' }, { status: 500 });
      }
      result = data;
    } else {
      // Create new RSVP
      const insertData = {
        event_id: eventId,
        name: rsvpData.name,
        email: rsvpData.email || null,
        will_attend: rsvpData.willAttend,
        message: rsvpData.message || null
      };

      const { data, error } = await supabase
        .from('event_rsvps')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating RSVP:', error);
        return NextResponse.json({ success: false, error: 'Failed to create RSVP' }, { status: 500 });
      }
      result = data;
    }

    return NextResponse.json({ success: true, rsvp: result });
  } catch (error) {
    console.error('Error in rsvp:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
