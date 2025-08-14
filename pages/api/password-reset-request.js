import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || '');

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ success: false, error: 'Email required' });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) return res.status(500).json({ success: false, error: 'Supabase not configured' });
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    await supabase.from('email_confirmations').insert({ token, used: false });

    const rawBase = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || 'localhost:3000';
    const base = (/^https?:\/\//i.test(rawBase) ? rawBase : `https://${rawBase}`).replace(/\/$/, '');
    const resetUrl = `${base}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Be There or Be Square <no-reply@be-square.app>',
        to: email,
        subject: 'Reset your password',
        html: `<p>Click to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
      });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}


