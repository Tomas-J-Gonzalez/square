import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, name, token } = req.body || {};
    if (!email || !name || !token) {
      return res.status(400).json({ success: false, error: 'Missing required fields: email, name, token' });
    }

    const rawBase = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || 'localhost:3000';
    const normalizedBase = (() => {
      let u = rawBase.trim();
      if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
      // remove trailing slash
      return u.replace(/\/$/, '');
    })();
    const confirmationUrl = `${normalizedBase}/confirm-email?token=${encodeURIComponent(token)}`;
    const logoUrl = `${normalizedBase}/logo.svg`;

    // Note: Tokens are now stored in Supabase during user registration
    // This endpoint is called by the registration API to send the email
    // The token should already exist in the email_confirmations table

    const { data, error } = await resend.emails.send({
      from: 'Show Up or Else <noreply@showuporelse.com>',
      to: email,
      subject: 'Confirm your Show Up or Else account',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirm your Show Up or Else account</title>
          <meta name="description" content="Confirm your email address for Show Up or Else">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 40px 20px; text-align: center;">
              <div style="margin-bottom: 20px;">
                <img src="${logoUrl}" alt="Show Up or Else" width="80" height="80" style="display: inline-block; width: 80px; height: 80px; border-radius: 12px; background-color: rgba(255, 255, 255, 0.1); padding: 8px;" />
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Welcome to Show Up or Else!</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">The anti-flake app that keeps friends accountable</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px; text-align: center;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Hi ${name},</h2>
              
              <p style="color: #374151; line-height: 1.6; margin-bottom: 30px; font-size: 16px;">
                Thanks for signing up! To complete your registration and start organizing events that your friends can't flake on, please confirm your email address.
              </p>
              
              <div style="margin: 30px 0;">
                <a href="${confirmationUrl}"
                   style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3); transition: all 0.2s ease;">
                  Confirm Email Address
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin: 20px 0;">
                If the button above doesn't work, copy and paste this link into your browser:
              </p>
              
              <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin: 20px 0; word-break: break-all;">
                <a href="${confirmationUrl}" style="color: #ec4899; text-decoration: none; font-size: 14px; font-family: 'Courier New', monospace;">${confirmationUrl}</a>
              </div>
              
              <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin: 30px 0; text-align: left;">
                <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: 500;">
                  <strong>Security Note:</strong> This link will expire in 24 hours for your security. If you didn't create an account with Show Up or Else, you can safely ignore this email.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
                <strong>Show Up or Else</strong> - Making sure your friends show up
              </p>
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                This email was sent to ${email} because you signed up for Show Up or Else.
              </p>
              <p style="color: #9ca3af; margin: 10px 0 0 0; font-size: 12px;">
                © 2024 Show Up or Else. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to Show Up or Else!

Hi ${name},

Thanks for signing up! To complete your registration and start organizing events that your friends can't flake on, please confirm your email address.

Confirm your email: ${confirmationUrl}

If the link above doesn't work, copy and paste it into your browser.

Security Note: This link will expire in 24 hours for your security. If you didn't create an account with Show Up or Else, you can safely ignore this email.

Show Up or Else - Making sure your friends show up
© 2024 Show Up or Else. All rights reserved.
      `
    });

    if (error) return res.status(500).json({ success: false, error: 'Failed to send confirmation email' });
    return res.status(200).json({ success: true, message: 'Confirmation email sent successfully', data, confirmationUrl });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

