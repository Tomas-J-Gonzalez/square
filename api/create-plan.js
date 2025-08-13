import { cors } from '../lib/cors.js';
import { supabase } from '../lib/supabaseClient.js';

export default async function handler(req, res) {
  // Apply CORS headers
  cors(req, res);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, description, date, location, creator_id, max_members } = req.body;

    // Validate required fields
    if (!title || !creator_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: title and creator_id are required' 
      });
    }

    // Create plan in Supabase
    const { data, error } = await supabase
      .from('plans')
      .insert([
        {
          title,
          description: description || null,
          date: date || null,
          location: location || null,
          creator_id,
          max_members: max_members || null,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: 'Failed to create plan',
        details: error.message 
      });
    }

    console.log('Plan created successfully:', data);
    return res.status(201).json({ 
      success: true, 
      message: 'Plan created successfully',
      plan: data 
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
