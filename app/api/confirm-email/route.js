import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

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

export async function GET(request) {
  try {
    console.log('Confirm Email API - Request method: GET');
    
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    console.log('Confirm Email API - Token from URL:', token);

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing confirmation token' 
      }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Find and validate the confirmation token
    const { data: confirmation, error: tokenError } = await supabase
      .from('email_confirmations')
      .select('id, token, user_id, email, used, expires_at')
      .eq('token', token)
      .single();

    if (tokenError || !confirmation) {
      console.error('Token lookup error:', tokenError);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid or expired confirmation token' 
      }, { status: 400 });
    }

    // Check if token has already been used
    if (confirmation.used) {
      return NextResponse.json({ 
        success: false, 
        error: 'Confirmation token has already been used' 
      }, { status: 400 });
    }

    // Check if token has expired
    if (new Date(confirmation.expires_at) < new Date()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Confirmation token has expired' 
      }, { status: 400 });
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
      return NextResponse.json({ 
        success: false, 
        error: 'Database error while confirming email' 
      }, { status: 500 });
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

    return NextResponse.json({
      success: true,
      message: 'Email confirmed successfully! You can now log in to your account.'
    });

  } catch (error) {
    console.error('Confirm Email API - Unhandled error:', error);
    console.error('Confirm Email API - Error message:', error.message);
    console.error('Confirm Email API - Error stack:', error.stack);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error during email confirmation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
