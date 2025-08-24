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
      // Use a text-based logo instead of SVG for better email client compatibility
      // const logoText = "Show Up or Else"; // Removed unused variable
      await resend.emails.send({
        from: 'Show Up or Else <noreply@showuporelse.com>',
        to: email,
        subject: 'Reset your Show Up or Else password',
        replyTo: 'support@showuporelse.com',
        headers: {
          'List-Unsubscribe': '<mailto:unsubscribe@showuporelse.com?subject=unsubscribe>',
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          'X-Auto-Response-Suppress': 'OOF, AutoReply',
          'Precedence': 'bulk',
          'X-Mailer': 'Show Up or Else Email System',
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'Importance': 'Normal',
          'X-Report-Abuse': 'Please report abuse here: abuse@showuporelse.com',
          'X-Campaign': 'password-reset',
          'X-Entity-Ref-ID': 'password-reset-email',
        },
        html: `
          <!DOCTYPE html>
          <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title>Reset your Show Up or Else password</title>
            <meta name="description" content="Reset your password for Show Up or Else">
            <meta name="color-scheme" content="light">
            <meta name="supported-color-schemes" content="light">
            <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
            <meta name="x-apple-disable-message-reformatting">
            
            <!--[if mso]>
            <noscript>
              <xml>
                <o:OfficeDocumentSettings>
                  <o:PixelsPerInch>96</o:PixelsPerInch>
                  <o:AllowPNG/>
                </o:OfficeDocumentSettings>
              </xml>
            </noscript>
            <![endif]-->
            
            <!--[if mso]>
            <style type="text/css">
            body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
            </style>
            <![endif]-->
            
            <style type="text/css">
              /* Reset styles for email clients */
              body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
              table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
              img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
              
              /* Responsive design */
              @media only screen and (max-width: 600px) {
                .email-container { width: 100% !important; }
                .mobile-padding { padding: 20px !important; }
                .mobile-text { font-size: 16px !important; line-height: 24px !important; }
                .mobile-heading { font-size: 24px !important; line-height: 32px !important; }
                .mobile-button { display: block !important; width: 100% !important; }
              }
              
              /* Button styles for email clients */
              .email-button {
                background: #ec4899 !important;
                color: #ffffff !important;
                text-decoration: none !important;
                border: none !important;
                outline: none !important;
              }
              
              /* Outlook-specific fixes */
              .outlook-button {
                background: #ec4899 !important;
                color: #ffffff !important;
                text-decoration: none !important;
                border: none !important;
                outline: none !important;
                display: inline-block !important;
                padding: 16px 32px !important;
                font-weight: 600 !important;
                font-size: 16px !important;
                line-height: 1.2 !important;
              }
            </style>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f9fafb; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
            <!--[if mso]>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
            <td align="center" style="background-color: #f9fafb;">
            <![endif]-->
            
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <!-- Header -->
              <tr>
                <td style="background-color: #ec4899; padding: 40px 20px; text-align: center;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td align="center" style="padding-bottom: 20px;">
                        <!-- Text-based logo for Outlook compatibility -->
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="background-color: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); padding: 8px; text-align: center; width: 80px; height: 80px;">
                              <div style="color: #ffffff; font-size: 12px; font-weight: bold; text-align: center; line-height: 1.2; padding-top: 20px;">
                                Show Up<br>or Else
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; line-height: 1.2;">Password Reset</h1>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-top: 8px;">
                        <p style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 16px; line-height: 1.4;">Secure your Show Up or Else account</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px; text-align: center;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td align="center" style="padding-bottom: 20px;">
                        <h2 style="color: #111827; margin: 0; font-size: 24px; font-weight: 600; line-height: 1.3;">Hi there,</h2>
                      </td>
                    </tr>
                    
                    <tr>
                      <td align="center" style="padding-bottom: 30px;">
                        <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 16px;">
                          We received a request to reset your password for your Show Up or Else account. Click the button below to create a new password.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- CTA Button -->
                    <tr>
                      <td align="center" style="padding: 30px 0;">
                        <!--[if mso]>
                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${resetUrl}" style="height:56px;v-text-anchor:middle;width:200px;" arcsize="8%" stroke="f" fillcolor="#ec4899">
                        <w:anchorlock/>
                        <center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:600;">
                        Reset Password
                        </center>
                        </v:roundrect>
                        <![endif]-->
                        <!--[if !mso]><!-->
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td align="center" style="background-color: #ec4899; border-radius: 8px;">
                              <a href="${resetUrl}"
                                 class="outlook-button"
                                 style="background-color: #ec4899; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; line-height: 1.2;">
                                Reset Password
                              </a>
                            </td>
                          </tr>
                        </table>
                        <!--<![endif]-->
                      </td>
                    </tr>
                    
                    <!-- Fallback Link Text -->
                    <tr>
                      <td align="center" style="padding-bottom: 20px;">
                        <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.4;">
                          If the button above doesn't work, copy and paste this link into your browser:
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Fallback Link -->
                    <tr>
                      <td align="center" style="padding-bottom: 30px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6;">
                          <tr>
                            <td style="padding: 16px; text-align: center;">
                              <a href="${resetUrl}" 
                                 style="color: #ec4899; text-decoration: none; font-size: 14px; font-family: 'Courier New', monospace; word-break: break-all; line-height: 1.4;">
                                ${resetUrl}
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Security Notice -->
                    <tr>
                      <td align="center">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fef3c7; border: 1px solid #f59e0b;">
                          <tr>
                            <td style="padding: 16px; text-align: left;">
                              <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: 500; line-height: 1.4;">
                                <strong>Security Note:</strong> This link will expire in 1 hour for your security. If you didn't request this password reset, you can safely ignore this email and your password will remain unchanged.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td align="center" style="padding-bottom: 10px;">
                        <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.4;">
                          <strong>Show Up or Else</strong> - Making sure your friends show up
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-bottom: 10px;">
                        <p style="color: #9ca3af; margin: 0; font-size: 12px; line-height: 1.4;">
                          This email was sent to ${email} because you requested a password reset.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <p style="color: #9ca3af; margin: 0; font-size: 12px; line-height: 1.4;">
                          © 2024 Show Up or Else. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            
            <!--[if mso]>
            </td>
            </tr>
            </table>
            <![endif]-->
          </body>
          </html>
        `,
        text: `
Password Reset - Show Up or Else

Hi there,

We received a request to reset your password for your Show Up or Else account. Click the link below to create a new password.

Reset your password: ${resetUrl}

If the link above doesn't work, copy and paste it into your browser.

Security Note: This link will expire in 1 hour for your security. If you didn't request this password reset, you can safely ignore this email and your password will remain unchanged.

Show Up or Else - Making sure your friends show up
© 2024 Show Up or Else. All rights reserved.
        `
      });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}


