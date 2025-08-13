import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('Missing RESEND_API_KEY in Netlify environment');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: 'Server misconfiguration: RESEND_API_KEY is not set' })
      };
    }

    const { email, name, token } = JSON.parse(event.body);

    if (!email || !name || !token) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: email, name, token' 
        })
      };
    }

    // Use custom domain if available, otherwise fall back to Netlify URL
    const baseUrl = process.env.CUSTOM_DOMAIN || process.env.URL;
    const confirmationUrl = `${baseUrl}/confirm-email?token=${token}`;

    const { data, error } = await resend.emails.send({
      from: 'Be There or Be Square <onboarding@resend.dev>',
      to: email,
      subject: 'Confirm your Be There or Be Square account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #ec4899; width: 64px; height: 64px; border-radius: 4px; margin: 0 auto 20px;"></div>
          <h1 style="color: #1f2937; text-align: center; margin-bottom: 10px;">Welcome to Be There or Be Square!</h1>
          <p style="color: #6b7280; text-align: center; margin-bottom: 30px;">Hi ${name},</p>
          <p style="color: #374151; line-height: 1.6; margin-bottom: 30px;">
            Thank you for creating an account with Be There or Be Square! To complete your registration and start using our anti-flake app, please confirm your email address by clicking the button below.
          </p>
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${confirmationUrl}" 
               style="background-color: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 9999px; display: inline-block; font-weight: 500;">
              Confirm Email Address
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
            If the button doesn't work, you can also copy and paste this link into your browser:
          </p>
          <p style="color: #6b7280; font-size: 14px; word-break: break-all; margin-bottom: 30px;">
            <a href="${confirmationUrl}" style="color: #ec4899;">${confirmationUrl}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            This email was sent from Be There or Be Square. If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Failed to send confirmation email' 
        })
      };
    }

    console.log('Email sent successfully:', data);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Confirmation email sent successfully',
        data 
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      })
    };
  }
};
