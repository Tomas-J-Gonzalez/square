import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

/**
 * User Registration API Endpoint
 * 
 * This endpoint handles user registration with Supabase as the single source of truth.
 * It creates a user in the users table, generates a confirmation token, and sends a confirmation email.
 * 
 * Example confirmation link: https://yourdomain.com/confirm-email?token=abc123
 * 
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - User's full name
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password (will be hashed)
 * 
 * @returns {Object} Response object
 * @returns {boolean} returns.success - Whether registration was successful
 * @returns {string} returns.message - Success or error message
 * @returns {Object} [returns.user] - User object (without password) on success
 */
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Use POST for registration.' 
    });
  }

  try {
    const { name, email, password } = req.body || {};

    // Validate required fields
    if (!name?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name is required' 
      });
    }

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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters long' 
      });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must contain at least one uppercase letter' 
      });
    }

    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must contain at least one lowercase letter' 
      });
    }

    if (!/\d/.test(password)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must contain at least one number' 
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
    const normalizedName = name.trim();

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email_confirmed')
      .eq('email', normalizedEmail)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing user:', checkError);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error while checking existing user' 
      });
    }

    if (existingUser) {
      if (existingUser.email_confirmed) {
        return res.status(409).json({ 
          success: false, 
          message: 'An account with this email already exists' 
        });
      } else {
        // User exists but email not confirmed - allow re-registration
        // We'll update the existing user with new credentials
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const { error: updateError } = await supabase
          .from('users')
          .update({
            name: normalizedName,
            password_hash: hashedPassword,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id);

        if (updateError) {
          console.error('Error updating existing user:', updateError);
          return res.status(500).json({ 
            success: false, 
            message: 'Database error while updating user' 
          });
        }

        // Generate new confirmation token
        const token = generateConfirmationToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store confirmation token
        const { error: tokenError } = await supabase
          .from('email_confirmations')
          .insert({
            token,
            user_id: existingUser.id,
            email: normalizedEmail,
            expires_at: expiresAt.toISOString()
          });

        if (tokenError) {
          console.error('Error storing confirmation token:', tokenError);
          return res.status(500).json({ 
            success: false, 
            message: 'Error creating confirmation token' 
          });
        }

        // Send confirmation email
        try {
          await sendConfirmationEmail(normalizedEmail, normalizedName, token);
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't fail registration if email fails
        }

        return res.status(200).json({
          success: true,
          message: 'Account updated successfully. Please check your email for a new confirmation link.',
          user: {
            id: existingUser.id,
            email: normalizedEmail,
            name: normalizedName,
            email_confirmed: false
          }
        });
      }
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email: normalizedEmail,
        name: normalizedName,
        password_hash: hashedPassword,
        email_confirmed: false
      })
      .select('id, email, name, email_confirmed, created_at')
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error while creating user' 
      });
    }

    // Generate confirmation token
    const token = generateConfirmationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store confirmation token
    const { error: tokenError } = await supabase
      .from('email_confirmations')
      .insert({
        token,
        user_id: newUser.id,
        email: normalizedEmail,
        expires_at: expiresAt.toISOString()
      });

    if (tokenError) {
      console.error('Error storing confirmation token:', tokenError);
      return res.status(500).json({ 
        success: false, 
        message: 'Error creating confirmation token' 
      });
    }

    // Send confirmation email
    try {
      await sendConfirmationEmail(normalizedEmail, normalizedName, token);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail registration if email fails
    }

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Please check your email for a confirmation link.',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        email_confirmed: newUser.email_confirmed,
        created_at: newUser.created_at
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error during registration' 
    });
  }
}

/**
 * Generates a secure random confirmation token
 * @returns {string} Random token
 */
function generateConfirmationToken() {
  return Math.random().toString(36).substr(2, 15) + Date.now().toString(36);
}

/**
 * Sends a confirmation email using the existing email service
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @param {string} token - Confirmation token
 */
async function sendConfirmationEmail(email, name, token) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   process.env.VERCEL_PROJECT_PRODUCTION_URL || 
                   process.env.VERCEL_URL || 
                   'http://localhost:3000';
    
    const normalizedBase = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
    const confirmationUrl = `${normalizedBase}/confirm-email?token=${encodeURIComponent(token)}`;

    const response = await fetch(`${normalizedBase}/api/send-confirmation-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, token })
    });

    if (!response.ok) {
      throw new Error(`Email service returned ${response.status}`);
    }

    console.log('Confirmation email sent successfully to:', email);
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    throw error;
  }
}
