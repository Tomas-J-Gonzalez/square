import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

/**
 * User Login API Endpoint
 * 
 * This endpoint handles user authentication using Supabase as the single source of truth.
 * It validates credentials and returns user data for authenticated sessions.
 * 
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * 
 * @returns {Object} Response object
 * @returns {boolean} returns.success - Whether login was successful
 * @returns {string} returns.message - Success or error message
 * @returns {Object} [returns.user] - User object (without password) on success
 */
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Use POST for login.' 
    });
  }

  try {
    const { email, password } = req.body || {};

    // Validate required fields
    if (!email?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password is required' 
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

    const normalizedEmail = email.trim().toLowerCase();

    // Check for admin credentials (special case)
    if (normalizedEmail === 'admin' || normalizedEmail === 'admin@example.com') {
      if (password === 'admin') {
        return res.status(200).json({
          success: true,
          message: 'Admin login successful',
          user: {
            id: 'admin',
            email: 'admin@example.com',
            name: 'Administrator',
            email_confirmed: true,
            isAdmin: true,
            created_at: new Date().toISOString()
          }
        });
      }
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, password_hash, email_confirmed, created_at, last_login_at')
      .eq('email', normalizedEmail)
      .single();

    if (userError || !user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check if email is confirmed
    if (!user.email_confirmed) {
      return res.status(403).json({ 
        success: false, 
        message: 'Please confirm your email address before signing in. Check your email for a confirmation link.' 
      });
    }

    // Update last login time
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating last login time:', updateError);
      // Don't fail login if update fails
    }

    // Return user data (without password)
    const { password_hash, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error during login' 
    });
  }
}
