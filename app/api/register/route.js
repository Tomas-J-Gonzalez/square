import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Initialize Supabase client (will be created when needed)
let supabase = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables:');
      console.error('  NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.error('  SUPABASE_URL:', !!process.env.SUPABASE_URL);
      console.error('  SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
      throw new Error('Supabase environment variables not configured');
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

export async function POST(request) {
  try {
    console.log('Register API - Request method: POST');
    
    const body = await request.json();
    console.log('Register API - Request body:', body);
    
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: 'Email, password, and name are required' }, { status: 400 });
    }

    // Very permissive email validation - users will confirm their emails anyway
    const trimmedEmail = email.trim().toLowerCase();
    
    // Only reject obviously invalid formats
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.') || trimmedEmail.length < 5) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address' }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', trimmedEmail)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing user:', checkError);
      return NextResponse.json({ success: false, error: 'Failed to check existing user' }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json({ success: false, error: 'User with this email already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: trimmedEmail,
        password_hash: hashedPassword,
        name,
        email_confirmed: false
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store confirmation token
    const { error: tokenError } = await supabase
      .from('email_confirmations')
      .insert({
        user_id: user.id,
        token: confirmationToken,
        expires_at: expiresAt.toISOString()
      });

    if (tokenError) {
      console.error('Error creating confirmation token:', tokenError);
      return NextResponse.json({ success: false, error: 'Failed to create confirmation token' }, { status: 500 });
    }

    // Send confirmation email
    const confirmationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'https://square-tomas-j-gonzalez.vercel.app'}/confirm-email?token=${confirmationToken}`;
    
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'https://square-tomas-j-gonzalez.vercel.app'}/api/send-confirmation-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          confirmationUrl
        })
      });

      const emailData = await emailResponse.json();
      if (!emailData.success) {
        console.error('Error sending confirmation email:', emailData.error);
      } else {
        console.log('Confirmation email sent successfully');
      }
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail registration if email fails, just log it
    }

    // Remove password from user object before sending
    const { password: _, ...userWithoutPassword } = user;

    console.log('Registration successful for user:', email);
    return NextResponse.json({ 
      success: true, 
      user: userWithoutPassword,
      message: 'Registration successful. Please check your email to confirm your account.'
    });

  } catch (error) {
    console.error('Register API - Unhandled error:', error);
    console.error('Register API - Error message:', error.message);
    console.error('Register API - Error stack:', error.stack);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
