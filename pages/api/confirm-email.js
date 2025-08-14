import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const token = req.method === 'GET' ? (req.query.token || '') : (req.body?.token || '');
    if (!token) return res.status(400).json({ success: false, error: 'Missing token' });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // require service role key
    if (!supabaseUrl || !supabaseKey) return res.status(500).json({ success: false, error: 'Supabase service role key missing' });

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find token
    const { data, error } = await supabase
      .from('email_confirmations')
      .select('id, token, used')
      .eq('token', token)
      .maybeSingle();

    if (error) return res.status(500).json({ success: false, error: `Token lookup failed: ${error.message || 'unknown error'}` });
    if (!data || data.used === true) return res.status(400).json({ success: false, error: 'Invalid or expired confirmation token' });

    // Mark as used
    await supabase.from('email_confirmations').update({ used: true }).eq('id', data.id);

    return res.status(200).json({ success: true, message: 'Email confirmed' });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}


