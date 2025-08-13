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
		const { email, name, token } = req.body || {};

		if (!email || !name || !token) {
			return res.status(400).json({
				success: false,
				error: 'Missing required fields: email, name, token'
			});
		}

		const baseUrl = process.env.FRONTEND_URL || 'https://dontbesquare.netlify.app';
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
						Please confirm your email address by clicking the button below.
					</p>
					<div style="text-align: center; margin-bottom: 30px;">
						<a href="${confirmationUrl}"
							style="background-color: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 9999px; display: inline-block; font-weight: 500;">
							Confirm Email Address
						</a>
					</div>
					<p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">If the button doesn't work, copy and paste this link:</p>
					<p style="color: #6b7280; font-size: 14px; word-break: break-all; margin-bottom: 30px;">
						<a href="${confirmationUrl}" style="color: #ec4899;">${confirmationUrl}</a>
					</p>
					<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
					<p style="color: #9ca3af; font-size: 12px; text-align: center;">If you didn't create an account, you can safely ignore this email.</p>
				</div>
			`
		});

		if (error) {
			console.error('Resend error:', error);
			return res.status(500).json({ success: false, error: 'Failed to send confirmation email' });
		}

		return res.status(200).json({ success: true, message: 'Confirmation email sent successfully', data });
	} catch (err) {
		console.error('Function error:', err);
		return res.status(500).json({ success: false, error: 'Internal server error' });
	}
}
