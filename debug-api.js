// Debug API Script
// Test the production API with detailed logging

const PRODUCTION_URL = 'https://showuporelse.com';

async function debugAPI() {
  console.log('🔍 Debugging Production API...\n');
  
  try {
    // Test 1: Simple GET request to see if the site responds
    console.log('1️⃣ Testing basic site response...');
    const siteResponse = await fetch(PRODUCTION_URL);
    console.log('Site status:', siteResponse.status);
    console.log('Site headers:', Object.fromEntries(siteResponse.headers.entries()));
    
    // Test 2: Test API with detailed logging
    console.log('\n2️⃣ Testing API with detailed request...');
    const requestBody = {
      action: 'getEvents',
      userEmail: 'test@example.com'
    };
    
    console.log('Request URL:', `${PRODUCTION_URL}/api/events`);
    console.log('Request method: POST');
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const apiResponse = await fetch(`${PRODUCTION_URL}/api/events`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('Response status:', apiResponse.status);
    console.log('Response status text:', apiResponse.statusText);
    console.log('Response headers:', Object.fromEntries(apiResponse.headers.entries()));
    
    const responseText = await apiResponse.text();
    console.log('Response body:', responseText);
    
    // Test 3: Try different HTTP methods
    console.log('\n3️⃣ Testing different HTTP methods...');
    
    const methods = ['GET', 'PUT', 'DELETE'];
    for (const method of methods) {
      try {
        const testResponse = await fetch(`${PRODUCTION_URL}/api/events`, {
          method: method,
          headers: { 'Content-Type': 'application/json' }
        });
        console.log(`${method} method:`, testResponse.status);
      } catch (error) {
        console.log(`${method} method: Error -`, error.message);
      }
    }
    
    // Test 4: Check if it's a routing issue
    console.log('\n4️⃣ Testing if it\'s a routing issue...');
    const nonExistentResponse = await fetch(`${PRODUCTION_URL}/api/non-existent`);
    console.log('Non-existent endpoint:', nonExistentResponse.status);
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Error stack:', error.stack);
  }
  
  console.log('\n📋 Analysis:');
  console.log('- If all methods return 405, it\'s a routing issue');
  console.log('- If only POST returns 405, it\'s a handler issue');
  console.log('- If site is accessible but API isn\'t, it\'s a deployment issue');
}

// Run the debug
debugAPI();
