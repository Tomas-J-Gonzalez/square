// Test Environment Variables
const PRODUCTION_URL = 'https://showuporelse.com';

async function testEnvironmentVariables() {
  console.log('🔍 Testing Environment Variables...\n');
  
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/test-env`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Environment variables status:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEnvironmentVariables();
