import { createClient } from '@supabase/supabase-js';

/**
 * RSVP API Endpoint
 * 
 * This endpoint handles RSVP submissions for both logged-in users and guests.
 * It upserts RSVP data into Supabase and returns participant information.
 * 
 * @param {Object} req.body - Request body
 * @param {string} req.body.eventId - Event ID
 * @param {string} req.body.name - Participant name (required)
 * @param {string} req.body.email - Participant email (optional)
 * @param {boolean} req.body.willAttend - Whether participant will attend
 * @param {string} req.body.message - Optional message from participant
 * @param {Object} req.body.event - Event data for upsert
 * 
 * @returns {Object} Response object
 * @returns {boolean} returns.success - Whether RSVP was successful
 * @returns {Object} [returns.participant] - Participant data on success
 * @returns {string} [returns.error] - Error message on failure
 */
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST for RSVP submission.' 
    });
  }

  try {
    const { eventId, name, email, willAttend = true, message, event } = req.body || {};

    // Validate required fields
    if (!eventId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Event ID is required' 
      });
    }

    if (!name?.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Participant name is required' 
      });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'Database configuration error' 
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const normalizedName = name.trim();
    const normalizedEmail = email?.trim() || null;
    const normalizedMessage = message?.trim() || null;

    // Ensure event exists in Supabase (upsert)
    if (event) {
      const { error: eventError } = await supabase
        .from('events')
        .upsert({
          id: eventId,
          title: event.title || 'Untitled Event',
          date: event.date || (event.dateTime ? new Date(event.dateTime).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)),
          time: event.time || (event.dateTime ? new Date(event.dateTime).toTimeString().slice(0, 5) : '12:00'),
          location: event.location || null,
          decision_mode: event.decisionMode || 'none',
          punishment: event.punishment || '',
          invited_by: event.invitedBy || 'Organizer'
        }, {
          onConflict: 'id'
        });

      if (eventError) {
        console.error('Error upserting event:', eventError);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to create/update event' 
        });
      }
    } else {
      // Check if event exists, if not, skip the upsert
      const { data: existingEvent, error: eventCheckError } = await supabase
        .from('events')
        .select('id')
        .eq('id', eventId)
        .maybeSingle();

      if (eventCheckError) {
        console.error('Error checking event existence:', eventCheckError);
        return res.status(500).json({ 
          success: false, 
          error: 'Database error while checking event' 
        });
      }

      if (!existingEvent) {
        console.warn(`Event ${eventId} does not exist, but continuing with RSVP`);
      }
    }

    // Check if RSVP already exists for this event + name combination
    const { data: existingRsvp, error: checkError } = await supabase
      .from('event_rsvps')
      .select('id, name, email, will_attend, message, created_at')
      .eq('event_id', eventId)
      .ilike('name', normalizedName)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing RSVP:', checkError);
      return res.status(500).json({ 
        success: false, 
        error: 'Database error while checking existing RSVP' 
      });
    }

    let participant;

    if (existingRsvp) {
      // Update existing RSVP
      const { data: updatedRsvp, error: updateError } = await supabase
        .from('event_rsvps')
        .update({
          email: normalizedEmail,
          will_attend: !!willAttend,
          message: normalizedMessage
        })
        .eq('id', existingRsvp.id)
        .select('id, name, email, will_attend, message, created_at')
        .single();

      if (updateError) {
        console.error('Error updating RSVP:', updateError);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to update RSVP' 
        });
      }

      participant = {
        id: updatedRsvp.id,
        name: updatedRsvp.name,
        email: updatedRsvp.email,
        willAttend: updatedRsvp.will_attend,
        message: updatedRsvp.message,
        createdAt: updatedRsvp.created_at
      };

      console.log(`Updated RSVP for ${normalizedName} on event ${eventId}`);
    } else {
      // Insert new RSVP
      const { data: newRsvp, error: insertError } = await supabase
        .from('event_rsvps')
        .insert({
          event_id: eventId,
          name: normalizedName,
          email: normalizedEmail,
          will_attend: !!willAttend,
          message: normalizedMessage
        })
        .select('id, name, email, will_attend, message, created_at')
        .single();

      if (insertError) {
        console.error('Error inserting RSVP:', insertError);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to create RSVP' 
        });
      }

      participant = {
        id: newRsvp.id,
        name: newRsvp.name,
        email: newRsvp.email,
        willAttend: newRsvp.will_attend,
        message: newRsvp.message,
        createdAt: newRsvp.created_at
      };

      console.log(`Created new RSVP for ${normalizedName} on event ${eventId}`);
    }

    return res.status(200).json({
      success: true,
      participant
    });

  } catch (error) {
    console.error('RSVP API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error during RSVP submission' 
    });
  }
}


