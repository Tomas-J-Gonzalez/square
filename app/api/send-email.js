import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { 
      to_email, 
      to_name, 
      plan_title, 
      plan_description, 
      plan_date, 
      plan_location, 
      creator_name,
      action_type = 'invitation'
    } = req.body;

    if (!to_email || !plan_title) {
      return res.status(400).json({ error: 'Missing required fields: to_email and plan_title are required' });
    }

    const site = process.env.NEXT_PUBLIC_SITE_URL || `https://${process.env.VERCEL_URL}` || 'http://localhost:3000';
    // Use a text-based logo instead of SVG for better email client compatibility
    const logoText = "Show Up or Else";

    let subject, htmlContent;
    
    switch (action_type) {
      case 'invitation':
        subject = `You're invited to: ${plan_title}`;
        htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>You're invited to: ${plan_title}</title>
            <meta name="description" content="You've been invited to join a plan on Show Up or Else">
            <meta name="color-scheme" content="light">
            <meta name="supported-color-schemes" content="light">
            <!--[if mso]>
            <noscript>
              <xml>
                <o:OfficeDocumentSettings>
                  <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
              </xml>
            </noscript>
            <![endif]-->
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
            <!--[if mso]>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
            <td align="center" style="background-color: #f9fafb;">
            <![endif]-->
            
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 40px 20px; text-align: center;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td align="center" style="padding-bottom: 20px;">
                        <img src="${process.env.NEXT_PUBLIC_SITE_URL}/assets/circle-pink.svg" alt="Show Up or Else Logo" width="80" height="80" style="display: block; width: 80px; height: 80px; border-radius: 12px; background-color: rgba(255, 255, 255, 0.1); padding: 8px; border: 0;" />
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; line-height: 1.2;">You're Invited!</h1>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-top: 8px;">
                        <p style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 16px; line-height: 1.4;">Join the plan and show up!</p>
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
                        <h2 style="color: #111827; margin: 0; font-size: 24px; font-weight: 600; line-height: 1.3;">Hi ${to_name || 'there'},</h2>
                      </td>
                    </tr>
                    
                    <tr>
                      <td align="center" style="padding-bottom: 30px;">
                        <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 16px;">
                          ${creator_name || 'Someone'} has invited you to join their plan: <strong>${plan_title}</strong>
                        </p>
                      </td>
                    </tr>
                    
                    ${plan_description ? `
                    <tr>
                      <td align="center" style="padding-bottom: 20px;">
                        <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 16px;">
                          <strong>Description:</strong> ${plan_description}
                        </p>
                      </td>
                    </tr>
                    ` : ''}
                    
                    ${plan_date ? `
                    <tr>
                      <td align="center" style="padding-bottom: 20px;">
                        <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 16px;">
                          <strong>Date:</strong> ${plan_date}
                        </p>
                      </td>
                    </tr>
                    ` : ''}
                    
                    ${plan_location ? `
                    <tr>
                      <td align="center" style="padding-bottom: 30px;">
                        <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 16px;">
                          <strong>Location:</strong> ${plan_location}
                        </p>
                      </td>
                    </tr>
                    ` : ''}
                    
                    <!-- CTA Button -->
                    <tr>
                      <td align="center" style="padding: 30px 0;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);">
                              <a href="${site}"
                                 style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; line-height: 1.2; border: 2px solid #ec4899; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);">
                                View Plan Details
                              </a>
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
        `;
        break;
        
      case 'reminder':
        subject = `Reminder: ${plan_title} is coming up!`;
        htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reminder: ${plan_title} is coming up!</title>
            <meta name="description" content="Reminder about your upcoming plan on Show Up or Else">
            <meta name="color-scheme" content="light">
            <meta name="supported-color-schemes" content="light">
            <!--[if mso]>
            <noscript>
              <xml>
                <o:OfficeDocumentSettings>
                  <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
              </xml>
            </noscript>
            <![endif]-->
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
            <!--[if mso]>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
            <td align="center" style="background-color: #f9fafb;">
            <![endif]-->
            
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td align="center" style="padding-bottom: 20px;">
                        <img src="${process.env.NEXT_PUBLIC_SITE_URL}/assets/circle-pink.svg" alt="Show Up or Else Logo" width="80" height="80" style="display: block; width: 80px; height: 80px; border-radius: 12px; background-color: rgba(255, 255, 255, 0.1); padding: 8px; border: 0;" />
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; line-height: 1.2;">Plan Reminder!</h1>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-top: 8px;">
                        <p style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 16px; line-height: 1.4;">Don't forget about your upcoming plan</p>
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
                        <h2 style="color: #111827; margin: 0; font-size: 24px; font-weight: 600; line-height: 1.3;">Hi ${to_name || 'there'},</h2>
                      </td>
                    </tr>
                    
                    <tr>
                      <td align="center" style="padding-bottom: 30px;">
                        <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 16px;">
                          This is a friendly reminder about your upcoming plan: <strong>${plan_title}</strong>
                        </p>
                      </td>
                    </tr>
                    
                    ${plan_description ? `
                    <tr>
                      <td align="center" style="padding-bottom: 20px;">
                        <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 16px;">
                          <strong>Description:</strong> ${plan_description}
                        </p>
                      </td>
                    </tr>
                    ` : ''}
                    
                    ${plan_date ? `
                    <tr>
                      <td align="center" style="padding-bottom: 20px;">
                        <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 16px;">
                          <strong>Date:</strong> ${plan_date}
                        </p>
                      </td>
                    </tr>
                    ` : ''}
                    
                    ${plan_location ? `
                    <tr>
                      <td align="center" style="padding-bottom: 30px;">
                        <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 16px;">
                          <strong>Location:</strong> ${plan_location}
                        </p>
                      </td>
                    </tr>
                    ` : ''}
                    
                    <!-- CTA Button -->
                    <tr>
                      <td align="center" style="padding: 30px 0;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                              <a href="${site}"
                                 style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; line-height: 1.2; border: 2px solid #f59e0b; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
                                View Plan Details
                              </a>
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
        `;
        break;
        
      case 'update':
        subject = `Update: ${plan_title}`;
        htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Update: ${plan_title}</title>
            <meta name="description" content="A plan has been updated on Show Up or Else">
            <meta name="color-scheme" content="light">
            <meta name="supported-color-schemes" content="light">
            <!--[if mso]>
            <noscript>
              <xml>
                <o:OfficeDocumentSettings>
                  <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
              </xml>
            </noscript>
            <![endif]-->
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
            <!--[if mso]>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
            <td align="center" style="background-color: #f9fafb;">
            <![endif]-->
            
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td align="center" style="padding-bottom: 20px;">
                        <img src="${process.env.NEXT_PUBLIC_SITE_URL}/assets/circle-pink.svg" alt="Show Up or Else Logo" width="80" height: 80" style="display: block; width: 80px; height: 80px; border-radius: 12px; background-color: rgba(255, 255, 255, 0.1); padding: 8px; border: 0;" />
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; line-height: 1.2;">Plan Updated!</h1>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-top: 8px;">
                        <p style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 16px; line-height: 1.4;">Check out the new details</p>
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
                        <h2 style="color: #111827; margin: 0; font-size: 24px; font-weight: 600; line-height: 1.3;">Hi ${to_name || 'there'},</h2>
                      </td>
                    </tr>
                    
                    <tr>
                      <td align="center" style="padding-bottom: 30px;">
                        <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 16px;">
                          The plan <strong>${plan_title}</strong> has been updated with new details.
                        </p>
                      </td>
                    </tr>
                    
                    ${plan_description ? `
                    <tr>
                      <td align="center" style="padding-bottom: 20px;">
                        <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 16px;">
                          <strong>Description:</strong> ${plan_description}
                        </p>
                      </td>
                    </tr>
                    ` : ''}
                    
                    ${plan_date ? `
                    <tr>
                      <td align="center" style="padding-bottom: 20px;">
                        <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 16px;">
                          <strong>Date:</strong> ${plan_date}
                        </p>
                      </td>
                    </tr>
                    ` : ''}
                    
                    ${plan_location ? `
                    <tr>
                      <td align="center" style="padding-bottom: 30px;">
                        <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 16px;">
                          <strong>Location:</strong> ${plan_location}
                        </p>
                      </td>
                    </tr>
                    ` : ''}
                    
                    <!-- CTA Button -->
                    <tr>
                      <td align="center" style="padding: 30px 0;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                              <a href="${site}"
                                 style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; line-height: 1.2; border: 2px solid #10b981; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                                View Updated Plan
                              </a>
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
        `;
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid action_type. Must be one of: invitation, reminder, update' });
    }

    const { data, error } = await resend.emails.send({
      from: 'Show Up or Else <noreply@showuporelse.com>',
      to: to_email,
      subject: subject,
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
        'X-Campaign': 'plan-notification',
        'X-Entity-Ref-ID': `${action_type}-email`,
      },
      html: htmlContent
    });

    if (error) return res.status(500).json({ error: 'Failed to send email', details: error.message });
    return res.status(200).json({ success: true, message: 'Email sent successfully', data });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

