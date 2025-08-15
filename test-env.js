// Test Environment Variables in Production
// This will help us identify if the 500 error is due to missing env vars

const PRODUCTION_URL = 'https://showuporelse.com';

async function testEnvironmentVariables() {
  console.log('🔍 Testing Environment Variables...\n');
  
  try {
    // Test 1: Simple API call that should work if env vars are set
    console.log('1️⃣ Testing basic API call...');
    const response = await fetch(`${PRODUCTION_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getEvents',
        userEmail: 'test@example.com'
      })
    });
    
    console.log('Response status:', response.status);
    
    if (response.status === 500) {
      console.log('❌ 500 error - likely missing environment variables');
      console.log('📋 You need to set these in Vercel:');
      console.log('   - NEXT_PUBLIC_SUPABASE_URL');
      console.log('   - SUPABASE_SERVICE_ROLE_KEY');
      console.log('   - RESEND_API_KEY');
      console.log('   - NEXT_PUBLIC_SITE_URL');
    } else if (response.status === 200) {
      console.log('✅ API is working! Environment variables are set correctly.');
    } else {
      console.log('⚠️ Unexpected status:', response.status);
    }
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Go to Vercel dashboard: https://vercel.com/dashboard');
  console.log('2. Find your "showuporelse" project');
  console.log('3. Go to Settings → Environment Variables');
  console.log('4. Add the missing variables');
  console.log('5. Redeploy the project');
}

// Run the test
testEnvironmentVariables();
