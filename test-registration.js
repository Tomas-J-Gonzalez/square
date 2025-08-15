/**
 * Registration API Test Script
 * 
 * This script tests the actual registration API endpoint to identify the issue.
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

async function testRegistration() {
  console.log('🧪 Testing Registration API...\n');

  // Test the registration API endpoint
  console.log('📋 Test 1: Checking API endpoint accessibility...');
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://showuporelse.com';
  
  try {
    const testData = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!'
    };

    console.log(`🧪 Sending registration request to: ${baseUrl}/api/register`);
    console.log(`📧 Test email: ${testData.email}`);

    const response = await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log(`📊 Response status: ${response.status}`);
    console.log(`📊 Response headers:`, Object.fromEntries(response.headers.entries()));

    const result = await response.json();
    console.log(`📊 Response body:`, JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ Registration API test successful!');
    } else {
      console.log('❌ Registration API test failed!');
      console.log(`   Error: ${result.message || 'Unknown error'}`);
    }

  } catch (error) {
    console.log('❌ Network error:', error.message);
    console.log('   This might mean the development server is not running.');
    console.log('   Make sure to run: npm run dev');
  }
}

// Run the test
testRegistration().catch(console.error);
