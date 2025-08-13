import { cors } from '../lib/cors.js';
import { supabase } from '../lib/supabaseClient.js';

export default async function handler(req, res) {
  // Apply CORS headers
  cors(req, res);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id } = req.query;

    // Validate required fields
    if (!user_id) {
      return res.status(400).json({ 
        error: 'Missing required parameter: user_id' 
      });
    }

    // Get plans where user is a member or creator
    const { data, error } = await supabase
      .from('plans')
      .select(`
        *,
        plan_members!inner(user_id),
        creator:creator_id(id, name, email)
      `)
      .or(`creator_id.eq.${user_id},plan_members.user_id.eq.${user_id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch plans',
        details: error.message 
      });
    }

    // Get member count for each plan
    const plansWithMemberCount = await Promise.all(
      data.map(async (plan) => {
        const { count, error: countError } = await supabase
          .from('plan_members')
          .select('*', { count: 'exact', head: true })
          .eq('plan_id', plan.id);

        return {
          ...plan,
          member_count: countError ? 0 : count,
          plan_members: undefined // Remove the join data
        };
      })
    );

    console.log(`Retrieved ${plansWithMemberCount.length} plans for user ${user_id}`);
    return res.status(200).json({ 
      success: true, 
      message: 'Plans retrieved successfully',
      plans: plansWithMemberCount 
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
