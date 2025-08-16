import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

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
    console.log('Confirm Email API - Request method: POST');
    
    const body = await request.json();
    console.log('Confirm Email API - Request body:', body);
    
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    
    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, email_confirmed')
      .eq('email', email)
      .single();

    if (userError || !user) {
      console.error('User not found:', email);
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (user.email_confirmed) {
      return NextResponse.json({ 
        success: true, 
        message: 'Email is already confirmed',
        user: { email: user.email, name: user.name }
      });
    }

    // Update user to confirm email
    const { error: updateError } = await supabase
      .from('users')
      .update({ email_confirmed: true })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error confirming email:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to confirm email' }, { status: 500 });
    }

    console.log('Email confirmed for user:', email);
    return NextResponse.json({ 
      success: true, 
      message: 'Email confirmed successfully',
      user: { email: user.email, name: user.name }
    });

  } catch (error) {
    console.error('Confirm Email API - Unhandled error:', error);
    console.error('Confirm Email API - Error message:', error.message);
    console.error('Confirm Email API - Error stack:', error.stack);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
