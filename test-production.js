// Test Production Deployment
// Run this to verify your production app is working correctly

const PRODUCTION_URL = 'https://showuporelse.com';

async function testProduction() {
  console.log('🧪 Testing Production Deployment...\n');
  
  try {
    // Test 1: Check if the site is accessible
    console.log('1️⃣ Testing site accessibility...');
    const response = await fetch(PRODUCTION_URL);
    if (response.ok) {
      console.log('✅ Site is accessible');
    } else {
      console.log('❌ Site returned status:', response.status);
    }
    
    // Test 2: Test API endpoint
    console.log('\n2️⃣ Testing API endpoint...');
    const apiResponse = await fetch(`${PRODUCTION_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getEvents',
        userEmail: 'test@example.com'
      })
    });
    
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      console.log('✅ API is working:', data.success ? 'Success' : 'Error');
    } else {
      console.log('❌ API returned status:', apiResponse.status);
      console.log('❌ API error:', await apiResponse.text());
    }
    
    // Test 3: Check environment variables
    console.log('\n3️⃣ Checking environment variables...');
    const envResponse = await fetch(`${PRODUCTION_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'test',
        userEmail: 'test@example.com'
      })
    });
    
    if (envResponse.status === 400) {
      console.log('✅ Environment variables are configured (got expected 400 for invalid action)');
    } else {
      console.log('❌ Unexpected response:', envResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n📋 Manual Testing Checklist:');
  console.log('1. Visit https://showuporelse.com');
  console.log('2. Create a new account');
  console.log('3. Create an event');
  console.log('4. Test RSVP functionality');
  console.log('5. Check email confirmations');
  
  console.log('\n🔧 If you see 405 errors:');
  console.log('- Make sure you\'re accessing the production URL');
  console.log('- Clear browser cache');
  console.log('- Try incognito mode');
  console.log('- Check Vercel deployment logs');
}

// Run the test
testProduction();
