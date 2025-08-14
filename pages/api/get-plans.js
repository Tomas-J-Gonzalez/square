import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'Missing required parameter: user_id' });

    const { data, error } = await supabase
      .from('plans')
      .select(`*, plan_members!inner(user_id), creator:creator_id(id, name, email)`) 
      .or(`creator_id.eq.${user_id},plan_members.user_id.eq.${user_id}`)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: 'Failed to fetch plans', details: error.message });

    const plansWithMemberCount = await Promise.all(
      data.map(async (plan) => {
        const { count } = await supabase
          .from('plan_members')
          .select('*', { count: 'exact', head: true })
          .eq('plan_id', plan.id);
        return { ...plan, member_count: count || 0, plan_members: undefined };
      })
    );

    return res.status(200).json({ success: true, message: 'Plans retrieved successfully', plans: plansWithMemberCount });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

