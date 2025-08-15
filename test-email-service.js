/**
 * Email Service Test Script
 * 
 * This script tests the email service to identify configuration issues.
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

async function testEmailService() {
  console.log('🧪 Testing Email Service...\n');

  // Check environment variables
  const resendApiKey = process.env.RESEND_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  console.log('📋 Environment Variables:');
  console.log(`  RESEND_API_KEY: ${resendApiKey ? '✅ SET' : '❌ MISSING'}`);
  console.log(`  NEXT_PUBLIC_SITE_URL: ${siteUrl ? '✅ SET' : '❌ MISSING'}\n`);

  if (!resendApiKey) {
    console.log('❌ ERROR: Missing RESEND_API_KEY!');
    console.log('📝 To fix this, add RESEND_API_KEY to your .env file');
    console.log('🔗 Get your API key from: https://resend.com/api-keys');
    return;
  }

  // Test the email service API endpoint
  console.log('📋 Testing Email Service API...');
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://showuporelse.com';
  
  try {
    const testData = {
      email: 'tomachos08@gmail.com', // Use verified email address
      name: 'Test User',
      token: 'test-token-123'
    };

    console.log(`🧪 Sending test email request to: ${baseUrl}/api/send-confirmation-email`);
    console.log(`📧 Test data:`, testData);

    const response = await fetch(`${baseUrl}/api/send-confirmation-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    console.log(`📊 Response status: ${response.status}`);
    console.log(`📊 Response status text: ${response.statusText}`);

    const result = await response.json();
    console.log(`📊 Response body:`, JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ Email service test successful!');
      console.log('   The email service is working correctly.');
    } else {
      console.log('❌ Email service test failed!');
      console.log(`   Error: ${result.error || result.message}`);
      
      if (result.error && result.error.includes('API key')) {
        console.log('\n🔧 Possible solutions:');
        console.log('1. Check your RESEND_API_KEY in .env file');
        console.log('2. Verify the API key is valid at https://resend.com/api-keys');
        console.log('3. Make sure the API key has permission to send emails');
      }
    }

  } catch (error) {
    console.log('❌ Network error:', error.message);
    console.log('   This might mean the development server is not running.');
    console.log('   Make sure to run: npm run dev');
  }

  // Test Resend API directly
  console.log('\n📋 Testing Resend API directly...');
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);
    
    const { data, error } = await resend.emails.send({
      from: 'noreply@showuporelse.com',
      to: 'tomachos08@gmail.com', // Use verified email address
      subject: 'Test Email',
      html: '<p>This is a test email</p>'
    });

    if (error) {
      console.log('❌ Resend API error:', error);
    } else {
      console.log('✅ Resend API test successful!');
      console.log('   Data:', data);
    }
  } catch (error) {
    console.log('❌ Resend API test error:', error.message);
  }
}

// Run the test
testEmailService().catch(console.error);
