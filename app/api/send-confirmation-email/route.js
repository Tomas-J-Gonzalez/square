import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, name, confirmationUrl } = body;

    if (!email || !name || !confirmationUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Extract token from confirmation URL
    const url = new URL(confirmationUrl);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing confirmation token' 
      }, { status: 400 });
    }

    const rawBase = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || 'localhost:3000';
    const normalizedBase = (() => {
      let u = rawBase.trim();
      if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
      return u.replace(/\/$/, '');
    })();
    
    const logoUrl = `${normalizedBase}/assets/circle-pink.svg`;

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
          <meta name="color-scheme" content="light">
          <meta name="supported-color-schemes" content="light">
          <title>Confirm your Show Up or Else account</title>
          <meta name="description" content="Confirm your email address for Show Up or Else">
          <!--[if mso]>
          <noscript>
            <xml>
              <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
            </xml>
          </noscript>
          <![endif]-->
          <style>
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
            
            /* Dark mode support */
            @media (prefers-color-scheme: dark) {
              .dark-mode-text { color: #ffffff !important; }
              .dark-mode-bg { background-color: #1f2937 !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
          <!-- Email Container -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;">
                  
                  <!-- Header Section -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 40px 20px; text-align: center;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td>
                            <!-- Logo -->
                            <div style="margin-bottom: 24px;">
                              <img src="${logoUrl}" alt="Show Up or Else" width="64" height="64" style="display: inline-block; width: 64px; height: 64px; border-radius: 12px; background-color: rgba(255, 255, 255, 0.15); padding: 8px; box-sizing: border-box;" />
                            </div>
                            <!-- Heading -->
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; line-height: 36px; letter-spacing: -0.025em;">Welcome to Show Up or Else!</h1>
                            <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px; line-height: 24px; font-weight: 400;">The anti-flake app that keeps friends accountable</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td class="mobile-padding" style="padding: 48px 40px;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="text-align: center;">
                            <!-- Greeting -->
                            <h2 style="color: #1f2937; margin: 0 0 24px 0; font-size: 24px; font-weight: 600; line-height: 32px; letter-spacing: -0.025em;">Hi ${name},</h2>
                            
                            <!-- Main Message -->
                            <p style="color: #374151; line-height: 1.6; margin-bottom: 32px; font-size: 16px; font-weight: 400; max-width: 480px; margin-left: auto; margin-right: auto;" class="mobile-text">
                              Thanks for signing up! To complete your registration and start organizing events that your friends can't flake on, please confirm your email address.
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 32px auto;">
                              <tr>
                                <td style="border-radius: 8px; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);">
                                  <a href="${confirmationUrl}" 
                                     style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; line-height: 24px; border-radius: 8px; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3); min-width: 200px; text-align: center;" 
                                     class="mobile-button">
                                    Confirm Email Address
                                  </a>
                                </td>
                              </tr>
                            </table>
                            
                            <!-- Fallback Link -->
                            <p style="color: #6b7280; font-size: 14px; line-height: 20px; margin: 24px 0 16px 0; font-weight: 400;">
                              If the button above doesn't work, copy and paste this link into your browser:
                            </p>
                            
                            <!-- Link Box -->
                            <div style="background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0 32px 0; word-break: break-all;">
                              <a href="${confirmationUrl}" 
                                 style="color: #ec4899; text-decoration: none; font-size: 14px; font-family: 'Courier New', monospace; line-height: 20px; font-weight: 500;">
                                ${confirmationUrl}
                              </a>
                            </div>
                            
                            <!-- Security Notice -->
                            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 32px 0; text-align: left;">
                              <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 20px; font-weight: 500;">
                                <strong>Security Note:</strong> This link will expire in 24 hours for your security. If you didn't create an account with Show Up or Else, you can safely ignore this email.
                              </p>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 32px 40px; text-align: center;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td>
                            <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px; line-height: 20px; font-weight: 500;">
                              <strong>Show Up or Else</strong> - Making sure your friends show up
                            </p>
                            <p style="color: #9ca3af; margin: 0 0 8px 0; font-size: 12px; line-height: 16px; font-weight: 400;">
                              This email was sent to ${email} because you signed up for Show Up or Else.
                            </p>
                            <p style="color: #9ca3af; margin: 0; font-size: 12px; line-height: 16px; font-weight: 400;">
                              © 2024 Show Up or Else. All rights reserved.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
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

    if (error) {
      console.error('Resend email error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send confirmation email' 
      }, { status: 500 });
    }

    console.log('Confirmation email sent successfully to:', email);
    return NextResponse.json({ 
      success: true, 
      message: 'Confirmation email sent successfully',
      data,
      confirmationUrl
    });

  } catch (error) {
    console.error('Send confirmation email error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send confirmation email' 
    }, { status: 500 });
  }
}
