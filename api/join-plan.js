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
    const { plan_id, user_id, user_name, user_email } = req.body;

    // Validate required fields
    if (!plan_id || !user_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: plan_id and user_id are required' 
      });
    }

    // Check if plan exists
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', plan_id)
      .single();

    if (planError || !plan) {
      return res.status(404).json({ 
        error: 'Plan not found' 
      });
    }

    // Check if user is already a member
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('plan_members')
      .select('*')
      .eq('plan_id', plan_id)
      .eq('user_id', user_id)
      .single();

    if (existingMember) {
      return res.status(409).json({ 
        error: 'User is already a member of this plan' 
      });
    }

    // Check if plan is full (if max_members is set)
    if (plan.max_members) {
      const { count, error: countError } = await supabase
        .from('plan_members')
        .select('*', { count: 'exact', head: true })
        .eq('plan_id', plan_id);

      if (countError) {
        console.error('Error counting members:', countError);
      } else if (count >= plan.max_members) {
        return res.status(400).json({ 
          error: 'Plan is full' 
        });
      }
    }

    // Add user to plan
    const { data, error } = await supabase
      .from('plan_members')
      .insert([
        {
          plan_id,
          user_id,
          user_name: user_name || null,
          user_email: user_email || null,
          joined_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: 'Failed to join plan',
        details: error.message 
      });
    }

    console.log('User joined plan successfully:', data);
    return res.status(201).json({ 
      success: true, 
      message: 'Successfully joined plan',
      member: data 
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
