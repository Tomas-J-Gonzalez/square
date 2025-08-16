import { createClient } from '@supabase/supabase-js';

/**
 * Email Confirmation API Endpoint
 * 
 * This endpoint handles email confirmation using Supabase as the single source of truth.
 * It validates the confirmation token and marks the user as confirmed in the database.
 * 
 * Example confirmation link: https://yourdomain.com/confirm-email?token=abc123
 * After confirmation, user should be redirected to: https://yourdomain.com/login
 * 
 * @param {string} req.query.token - Confirmation token from URL query parameters
 * 
 * @returns {Object} Response object
 * @returns {boolean} returns.success - Whether confirmation was successful
 * @returns {string} returns.message - Success or error message
 */
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Use GET or POST for email confirmation.' 
    });
  }

  try {
    // Extract token from query parameters (GET) or request body (POST)
    const token = req.method === 'GET' ? (req.query.token || '') : (req.body?.token || '');
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing confirmation token' 
      });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database configuration error' 
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find and validate the confirmation token
    const { data: confirmation, error: tokenError } = await supabase
      .from('email_confirmations')
      .select('id, token, user_id, email, used, expires_at')
      .eq('token', token)
      .single();

    if (tokenError) {
      console.error('Token lookup error:', tokenError);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired confirmation token' 
      });
    }

    if (!confirmation) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired confirmation token' 
      });
    }

    // Check if token has already been used
    if (confirmation.used) {
      return res.status(400).json({ 
        success: false, 
        message: 'Confirmation token has already been used' 
      });
    }

    // Check if token has expired
    if (new Date(confirmation.expires_at) < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Confirmation token has expired' 
      });
    }

    // Mark the user as confirmed
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_confirmed: true,
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', confirmation.user_id);

    if (updateError) {
      console.error('Error updating user confirmation status:', updateError);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error while confirming email' 
      });
    }

    // Mark the confirmation token as used
    const { error: tokenUpdateError } = await supabase
      .from('email_confirmations')
      .update({ used: true })
      .eq('id', confirmation.id);

    if (tokenUpdateError) {
      console.error('Error marking token as used:', tokenUpdateError);
      // Don't fail the confirmation if token update fails
      // The user is already confirmed
    }

    // Clean up any other unused confirmation tokens for this user
    try {
      await supabase
        .from('email_confirmations')
        .update({ used: true })
        .eq('user_id', confirmation.user_id)
        .eq('used', false);
    } catch (cleanupError) {
      console.error('Error cleaning up unused tokens:', cleanupError);
      // Non-critical error, don't fail the confirmation
    }

    console.log(`Email confirmed successfully for user: ${confirmation.email}`);

    return res.status(200).json({
      success: true,
      message: 'Email confirmed successfully! You can now log in to your account.'
    });

  } catch (error) {
    console.error('Email confirmation error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error during email confirmation' 
    });
  }
}


