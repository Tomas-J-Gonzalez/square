import { createClient } from '@supabase/supabase-js';

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

export default async function handler(req, res) {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }
  
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  try {
    console.log('Events API - Request method:', req.method);
    console.log('Events API - Request body:', req.body);
    
    const { action, eventData, eventId, updates } = req.body;

    if (!action) {
      console.error('Events API - No action provided');
      return res.status(400).json({ success: false, error: 'Action is required' });
    }

    console.log('Events API - Processing action:', action);

    switch (action) {
      case 'getEvents':
        return await getEvents(req, res);
      case 'getEvent':
        return await getEvent(req, res);
      case 'createEvent':
        return await createEvent(req, res);
      case 'updateEvent':
        return await updateEvent(req, res);
      case 'deleteEvent':
        return await deleteEvent(req, res);
      case 'cancelEvent':
        return await cancelEvent(req, res);
      case 'completeEvent':
        return await completeEvent(req, res);
      default:
        console.error('Events API - Invalid action:', action);
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Events API - Unhandled error:', error);
    console.error('Events API - Error message:', error.message);
    console.error('Events API - Error stack:', error.stack);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function getEvents(req, res) {
  try {
    const { userEmail } = req.body;
    
    if (!userEmail) {
      return res.status(400).json({ success: false, error: 'User email required' });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('invited_by', userEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch events' });
    }

    return res.status(200).json({ success: true, events: data || [] });
  } catch (error) {
    console.error('Error in getEvents:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function getEvent(req, res) {
  try {
    const { eventId } = req.body;
    
    if (!eventId) {
      return res.status(400).json({ success: false, error: 'Event ID required' });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    return res.status(200).json({ success: true, event: data });
  } catch (error) {
    console.error('Error in getEvent:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function createEvent(req, res) {
  try {
    console.log('Events API - createEvent - Request body:', req.body);
    
    const { eventData, userEmail } = req.body;
    
    if (!userEmail) {
      console.error('Events API - createEvent - No user email provided');
      return res.status(400).json({ success: false, error: 'User email required' });
    }

    if (!eventData) {
      console.error('Events API - createEvent - No event data provided');
      return res.status(400).json({ success: false, error: 'Event data required' });
    }

    console.log('Events API - createEvent - User email:', userEmail);
    console.log('Events API - createEvent - Event data:', eventData);

    // Check if there's already an active event (only check for active events)
    const supabase = getSupabaseClient();
    const { data: existingEvents, error: checkError } = await supabase
      .from('events')
      .select('id, title, status')
      .eq('invited_by', userEmail)
      .eq('status', 'active');

    if (checkError) {
      console.error('Error checking existing events:', checkError);
    } else if (existingEvents && existingEvents.length > 0) {
      const activeEvent = existingEvents[0];
      return res.status(400).json({ 
        success: false, 
        error: `There is already an active event. Please cancel or complete the current event first. [View Current Event](/event/${activeEvent.id})` 
      });
    }

    // Create the event
    console.log('Events API - createEvent - Inserting event into Supabase...');
    
    const insertData = {
      id: eventData.id,
      title: eventData.title,
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      decision_mode: eventData.decisionMode,
      punishment: eventData.punishment,
      invited_by: userEmail,
      status: 'active', // Set status to active for new events
      created_at: eventData.createdAt,
      updated_at: eventData.updatedAt
    };
    
    console.log('Events API - createEvent - Insert data:', insertData);
    
    const { data, error } = await supabase
      .from('events')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Events API - createEvent - Supabase error:', error);
      return res.status(500).json({ success: false, error: `Failed to create event: ${error.message}` });
    }

    console.log('Events API - createEvent - Success, created event:', data);
    return res.status(201).json({ success: true, event: data });
  } catch (error) {
    console.error('Error in createEvent:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function updateEvent(req, res) {
  try {
    const { eventId, updates, userEmail } = req.body;
    
    if (!userEmail) {
      return res.status(400).json({ success: false, error: 'User email required' });
    }

    if (!eventId) {
      return res.status(400).json({ success: false, error: 'Event ID required' });
    }

    // Convert updates to Supabase format
    const supabaseUpdates = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Remove fields that don't exist in Supabase
    delete supabaseUpdates.participants;
    delete supabaseUpdates.flakes;
    delete supabaseUpdates.winner;
    delete supabaseUpdates.loser;

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('events')
      .update(supabaseUpdates)
      .eq('id', eventId)
      .eq('invited_by', userEmail)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      return res.status(500).json({ success: false, error: 'Failed to update event' });
    }

    if (!data) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    return res.status(200).json({ success: true, event: data });
  } catch (error) {
    console.error('Error in updateEvent:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function deleteEvent(req, res) {
  try {
    const { eventId, userEmail } = req.body;
    
    if (!userEmail) {
      return res.status(400).json({ success: false, error: 'User email required' });
    }

    if (!eventId) {
      return res.status(400).json({ success: false, error: 'Event ID required' });
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('invited_by', userEmail);

    if (error) {
      console.error('Error deleting event:', error);
      return res.status(500).json({ success: false, error: 'Failed to delete event' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function cancelEvent(req, res) {
  return updateEvent(req, res);
}

async function completeEvent(req, res) {
  return updateEvent(req, res);
}
