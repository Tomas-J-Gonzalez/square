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
      const logoUrl = `${base}/logo.svg`;
      await resend.emails.send({
        from: 'Show Up or Else <noreply@showuporelse.com>',
        to: email,
        subject: 'Reset your password - Show Up or Else',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
            <div style="margin-bottom: 20px;">
              <img src="${logoUrl}" alt="Show Up or Else" width="64" height="64" style="display: inline-block; width: 64px; height: 64px;" />
            </div>
            <h1 style="color: #1f2937; margin-bottom: 10px;">Reset Your Password</h1>
            <p style="color: #6b7280; margin-bottom: 30px;">Hi there,</p>
            <p style="color: #374151; line-height: 1.6; margin-bottom: 30px;">
              We received a request to reset your password for your Show Up or Else account.
            </p>
            <div style="margin-bottom: 30px;">
              <a href="${resetUrl}"
                 style="background-color: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 9999px; display: inline-block; font-weight: 500;">
                Reset Password
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">If the button doesn't work, copy and paste this link:</p>
            <p style="color: #6b7280; font-size: 14px; word-break: break-all; margin-bottom: 30px;">
              <a href="${resetUrl}" style="color: #ec4899;">${resetUrl}</a>
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px;">If you didn't request this password reset, you can safely ignore this email.</p>
          </div>
        `
      });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}


