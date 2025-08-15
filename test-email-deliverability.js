/**
 * Test Email Deliverability
 * 
 * This script tests email sending and provides deliverability insights.
 */

import dotenv from 'dotenv';
dotenv.config();

async function testEmailDeliverability() {
  console.log('🧪 Testing Email Deliverability...\n');

  // Check environment variables
  const resendApiKey = process.env.RESEND_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  if (!resendApiKey) {
    console.log('❌ Missing RESEND_API_KEY environment variable');
    return;
  }

  console.log('✅ Environment variables found');
  console.log('📧 Site URL:', siteUrl || 'Not set');
  console.log('🔑 Resend API Key:', resendApiKey ? 'SET' : 'MISSING');

  // Test email sending
  try {
    console.log('\n📤 Testing email sending...');
    
    const testData = {
      email: 'your-test-email@gmail.com', // Replace with your email
      name: 'Test User',
      token: 'test-token-' + Date.now()
    };

    const response = await fetch('http://localhost:3002/api/send-confirmation-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('📧 Confirmation URL:', result.confirmationUrl);
    } else {
      console.log('❌ Email sending failed:', result.error);
    }

  } catch (error) {
    console.log('❌ Error testing email:', error.message);
  }

  // Provide recommendations
  console.log('\n📋 Email Deliverability Recommendations:');
  console.log('1. ✅ Professional email templates (implemented)');
  console.log('2. ✅ Proper "from" address (implemented)');
  console.log('3. ⚠️  Set up DNS records (SPF, DKIM, DMARC)');
  console.log('4. ⚠️  Verify domain in Resend dashboard');
  console.log('5. ⚠️  Monitor email metrics');
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Go to https://resend.com/domains');
  console.log('2. Verify your domain showuporelse.com');
  console.log('3. Add DNS records (see EMAIL_DELIVERABILITY_GUIDE.md)');
  console.log('4. Test with your actual email address');
  console.log('5. Check spam folder and mark as "not spam" if needed');
}

// Run the test
testEmailDeliverability().catch(console.error);
