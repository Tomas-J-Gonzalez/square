// Test script to verify email configuration
// Run this in the browser console on your deployed site

async function testEmailConfig() {
  console.log('🧪 Testing Email Configuration...');
  
  try {
    // Test the Vercel API route
    const response = await fetch('/api/send-confirmation-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Test User',
        token: 'test-token-123'
      })
    });
    
    const result = await response.json();
    console.log('📧 Email Function Response:', result);
    
    if (result.success) {
      console.log('✅ Email function is working!');
    } else {
      console.log('❌ Email function error:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testEmailConfig();
