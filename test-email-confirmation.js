/**
 * Email Confirmation Test Script
 * 
 * This script tests the email confirmation flow to identify issues.
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

async function testEmailConfirmation() {
  console.log('🧪 Testing Email Confirmation Flow...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing Supabase environment variables');
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Step 1: Create a test user
    console.log('📋 Step 1: Creating test user...');
    const testEmail = `test-confirm-${Date.now()}@example.com`;
    const testName = 'Test Confirmation User';
    
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email: testEmail,
        name: testName,
        password_hash: 'test_hash',
        email_confirmed: false
      })
      .select('id, email, name, email_confirmed')
      .single();

    if (userError) {
      console.log('❌ Error creating test user:', userError.message);
      return;
    }

    console.log('✅ Test user created:', newUser);

    // Step 2: Create a test confirmation token
    console.log('\n📋 Step 2: Creating test confirmation token...');
    const testToken = `test-token-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { data: confirmation, error: tokenError } = await supabase
      .from('email_confirmations')
      .insert({
        token: testToken,
        user_id: newUser.id,
        email: testEmail,
        expires_at: expiresAt.toISOString(),
        used: false
      })
      .select('id, token, user_id, email, used, expires_at')
      .single();

    if (tokenError) {
      console.log('❌ Error creating test token:', tokenError.message);
      return;
    }

    console.log('✅ Test confirmation token created:', confirmation);

    // Step 3: Test the confirmation API
    console.log('📋 Step 3: Testing confirmation API...');
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://showuporelse.com';
    
    try {
      const response = await fetch(`${baseUrl}/api/confirm-email?token=${encodeURIComponent(testToken)}`);
      console.log(`📊 API Response status: ${response.status}`);
      
      const result = await response.json();
      console.log(`📊 API Response:`, JSON.stringify(result, null, 2));

      if (response.ok && result.success) {
        console.log('✅ Email confirmation API test successful!');
      } else {
        console.log('❌ Email confirmation API test failed!');
        console.log(`   Error: ${result.message}`);
      }
    } catch (apiError) {
      console.log('❌ API test error:', apiError.message);
    }

    // Step 4: Verify the user was confirmed
    console.log('\n📋 Step 4: Verifying user confirmation...');
    const { data: updatedUser, error: verifyError } = await supabase
      .from('users')
      .select('id, email, name, email_confirmed, confirmed_at')
      .eq('id', newUser.id)
      .single();

    if (verifyError) {
      console.log('❌ Error verifying user:', verifyError.message);
    } else {
      console.log('✅ User verification result:', updatedUser);
      if (updatedUser.email_confirmed) {
        console.log('✅ User email confirmed successfully!');
      } else {
        console.log('❌ User email not confirmed!');
      }
    }

    // Step 5: Clean up test data
    console.log('\n📋 Step 5: Cleaning up test data...');
    try {
      await supabase.from('email_confirmations').delete().eq('id', confirmation.id);
      await supabase.from('users').delete().eq('id', newUser.id);
      console.log('✅ Test data cleaned up');
    } catch (cleanupError) {
      console.log('⚠️ Cleanup error (non-critical):', cleanupError.message);
    }

    console.log('\n🎉 Email confirmation test completed!');

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

// Run the test
testEmailConfirmation().catch(console.error);
