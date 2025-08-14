import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { token, email, newPassword } = req.body || {};
    if (!token || !email || !newPassword) return res.status(400).json({ success: false, error: 'Missing fields' });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) return res.status(500).json({ success: false, error: 'Supabase not configured' });
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('email_confirmations')
      .select('id, token, used')
      .eq('token', token)
      .maybeSingle();
    if (error) return res.status(500).json({ success: false, error: 'Token lookup failed' });
    if (!data || data.used) return res.status(400).json({ success: false, error: 'Invalid or expired token' });

    // Mark used
    await supabase.from('email_confirmations').update({ used: true }).eq('id', data.id);

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}


