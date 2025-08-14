import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || 're_iEkiEEsX_8FsnbQ7idPkVWgFkKcjipQVB');

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Email confirmation endpoint
app.post('/api/send-confirmation-email', async (req, res) => {
  try {
    const { email, name, token } = req.body;

    if (!email || !name || !token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: email, name, token' 
      });
    }

    const confirmationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/confirm-email?token=${token}`;

    const { data, error } = await resend.emails.send({
      from: 'Be There or Be Square <onboarding@resend.dev>',
      to: email,
      subject: 'Confirm your Be There or Be Square account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #ec4899; width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 20px;"></div>
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
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to send confirmation email' 
      });
    }

    console.log('Email sent successfully:', data);
    res.json({ 
      success: true, 
      message: 'Confirmation email sent successfully',
      data 
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Email service is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Email server running on port ${PORT}`);
  console.log(`📧 Resend API configured`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
