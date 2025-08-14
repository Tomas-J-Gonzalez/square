import { cors } from '../lib/cors.js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Apply CORS headers
  cors(req, res);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      to_email, 
      to_name, 
      plan_title, 
      plan_description, 
      plan_date, 
      plan_location, 
      creator_name,
      action_type = 'invitation' // 'invitation', 'reminder', 'update'
    } = req.body;

    // Validate required fields
    if (!to_email || !plan_title) {
      return res.status(400).json({ 
        error: 'Missing required fields: to_email and plan_title are required' 
      });
    }

    // Determine email subject and content based on action type
    let subject, htmlContent;
    
    switch (action_type) {
      case 'invitation':
        subject = `You're invited to: ${plan_title}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #ec4899; width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 20px;"></div>
            <h1 style="color: #1f2937; text-align: center; margin-bottom: 10px;">You're Invited!</h1>
            <p style="color: #6b7280; text-align: center; margin-bottom: 30px;">Hi ${to_name || 'there'},</p>
            <p style="color: #374151; line-height: 1.6; margin-bottom: 30px;">
              ${creator_name || 'Someone'} has invited you to join their plan: <strong>${plan_title}</strong>
            </p>
            ${plan_description ? `<p style="color: #374151; line-height: 1.6; margin-bottom: 20px;"><strong>Description:</strong> ${plan_description}</p>` : ''}
            ${plan_date ? `<p style="color: #374151; line-height: 1.6; margin-bottom: 20px;"><strong>Date:</strong> ${plan_date}</p>` : ''}
            ${plan_location ? `<p style="color: #374151; line-height: 1.6; margin-bottom: 30px;"><strong>Location:</strong> ${plan_location}</p>` : ''}
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${process.env.FRONTEND_URL || 'https://dontbesquare.netlify.app'}" 
                 style="background-color: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 9999px; display: inline-block; font-weight: 500;">
                View Plan Details
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              This email was sent from Be There or Be Square. Don't be a flake! 🎯
            </p>
          </div>
        `;
        break;
        
      case 'reminder':
        subject = `Reminder: ${plan_title} is coming up!`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #ec4899; width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 20px;"></div>
            <h1 style="color: #1f2937; text-align: center; margin-bottom: 10px;">Plan Reminder!</h1>
            <p style="color: #6b7280; text-align: center; margin-bottom: 30px;">Hi ${to_name || 'there'},</p>
            <p style="color: #374151; line-height: 1.6; margin-bottom: 30px;">
              This is a friendly reminder about your upcoming plan: <strong>${plan_title}</strong>
            </p>
            ${plan_description ? `<p style="color: #374151; line-height: 1.6; margin-bottom: 20px;"><strong>Description:</strong> ${plan_description}</p>` : ''}
            ${plan_date ? `<p style="color: #374151; line-height: 1.6; margin-bottom: 20px;"><strong>Date:</strong> ${plan_date}</p>` : ''}
            ${plan_location ? `<p style="color: #374151; line-height: 1.6; margin-bottom: 30px;"><strong>Location:</strong> ${plan_location}</p>` : ''}
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${process.env.FRONTEND_URL || 'https://dontbesquare.netlify.app'}" 
                 style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 9999px; display: inline-block; font-weight: 500;">
                View Plan Details
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              Don't be a flake! Show up and have fun! 🎯
            </p>
          </div>
        `;
        break;
        
      case 'update':
        subject = `Update: ${plan_title}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #ec4899; width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 20px;"></div>
            <h1 style="color: #1f2937; text-align: center; margin-bottom: 10px;">Plan Updated!</h1>
            <p style="color: #6b7280; text-align: center; margin-bottom: 30px;">Hi ${to_name || 'there'},</p>
            <p style="color: #374151; line-height: 1.6; margin-bottom: 30px;">
              The plan <strong>${plan_title}</strong> has been updated with new details.
            </p>
            ${plan_description ? `<p style="color: #374151; line-height: 1.6; margin-bottom: 20px;"><strong>Description:</strong> ${plan_description}</p>` : ''}
            ${plan_date ? `<p style="color: #374151; line-height: 1.6; margin-bottom: 20px;"><strong>Date:</strong> ${plan_date}</p>` : ''}
            ${plan_location ? `<p style="color: #374151; line-height: 1.6; margin-bottom: 30px;"><strong>Location:</strong> ${plan_location}</p>` : ''}
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${process.env.FRONTEND_URL || 'https://dontbesquare.netlify.app'}" 
                 style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 9999px; display: inline-block; font-weight: 500;">
                View Updated Plan
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              Stay updated with Be There or Be Square! 🎯
            </p>
          </div>
        `;
        break;
        
      default:
        return res.status(400).json({ 
          error: 'Invalid action_type. Must be one of: invitation, reminder, update' 
        });
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Be There or Be Square <onboarding@resend.dev>',
      to: to_email,
      subject: subject,
      html: htmlContent
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ 
        error: 'Failed to send email',
        details: error.message 
      });
    }

    console.log('Email sent successfully:', data);
    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully',
      data 
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
