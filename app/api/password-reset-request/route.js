import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
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
    console.log('Password Reset Request API - Request method: POST');
    
    const body = await request.json();
    console.log('Password Reset Request API - Request body:', body);
    
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .single();

    if (userError || !user) {
      console.error('User not found for password reset:', email);
      // Don't reveal if user exists or not for security
      return NextResponse.json({ 
        success: true, 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Store reset token
    const { error: tokenError } = await supabase
      .from('password_resets')
      .upsert({
        user_id: user.id,
        token: resetToken,
        expires_at: expiresAt.toISOString()
      });

    if (tokenError) {
      console.error('Error storing reset token:', tokenError);
      return NextResponse.json({ success: false, error: 'Failed to create reset token' }, { status: 500 });
    }

    // Send email (for now, just log the reset link)
    const resetUrl = `${process.env.VERCEL_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    console.log('Password reset link for', email, ':', resetUrl);

    // TODO: Send actual email with reset link
    // For now, we'll just return success
    // In production, you would use Resend or another email service

    console.log('Password reset request successful for user:', email);
    return NextResponse.json({ 
      success: true, 
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Password Reset Request API - Unhandled error:', error);
    console.error('Password Reset Request API - Error message:', error.message);
    console.error('Password Reset Request API - Error stack:', error.stack);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
