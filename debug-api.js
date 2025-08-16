// Debug API Issues
const PRODUCTION_URL = 'https://showuporelse.com';

async function debugAPI() {
  console.log('🔍 Debugging API Issues...\n');
  
  try {
    // Test 1: Simple API call with detailed error logging
    console.log('1️⃣ Testing API with detailed error logging...');
    const response = await fetch(`${PRODUCTION_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getEvents',
        userEmail: 'test@example.com'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    // Test 2: Try a different endpoint
    console.log('\n2️⃣ Testing register endpoint...');
    const registerResponse = await fetch(`${PRODUCTION_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123'
      })
    });
    
    console.log('Register response status:', registerResponse.status);
    const registerText = await registerResponse.text();
    console.log('Register response body:', registerText);
    
    // Test 3: Check if it's a CORS issue
    console.log('\n3️⃣ Testing with different headers...');
    const corsResponse = await fetch(`${PRODUCTION_URL}/api/events`, {
      method: 'OPTIONS',
      headers: { 
        'Content-Type': 'application/json',
        'Origin': 'https://showuporelse.com'
      }
    });
    
    console.log('CORS response status:', corsResponse.status);
    console.log('CORS headers:', Object.fromEntries(corsResponse.headers.entries()));
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Error stack:', error.stack);
  }
}

debugAPI();
