import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { eventId, name, willAttend = true, event } = req.body || {};
    if (!eventId || !name) return res.status(400).json({ success: false, error: 'Missing eventId or name' });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) return res.status(500).json({ success: false, error: 'Supabase service key not configured' });

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Ensure event exists (minimal shape)
    const e = event || {};
    await supabase.from('events').upsert({
      id: eventId,
      title: e.title || 'Untitled Event',
      date: e.date || (e.dateTime ? new Date(e.dateTime).toISOString().slice(0,10) : new Date().toISOString().slice(0,10)),
      time: e.time || (e.dateTime ? new Date(e.dateTime).toTimeString().slice(0,5) : '12:00'),
      location: e.location || null,
      decision_mode: e.decisionMode || 'none',
      punishment: e.punishment || '',
      invited_by: e.invitedBy || 'Organizer'
    });

    const { error } = await supabase.from('event_rsvps').insert({
      event_id: eventId,
      name,
      will_attend: !!willAttend
    });

    if (error) return res.status(500).json({ success: false, error: error.message || 'Failed to store RSVP' });
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}


