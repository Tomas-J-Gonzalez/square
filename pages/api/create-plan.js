import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { title, description, date, location, creator_id, max_members } = req.body;
    if (!title || !creator_id) {
      return res.status(400).json({ error: 'Missing required fields: title and creator_id are required' });
    }

    const { data, error } = await supabase
      .from('plans')
      .insert([{ title, description: description || null, date: date || null, location: location || null, creator_id, max_members: max_members || null, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: 'Failed to create plan', details: error.message });
    return res.status(201).json({ success: true, message: 'Plan created successfully', plan: data });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

