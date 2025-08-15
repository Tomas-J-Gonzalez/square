/**
 * Browser Registration Test Script
 * 
 * This script simulates the exact browser registration flow to identify the issue.
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

async function testBrowserRegistration() {
  console.log('🧪 Testing Browser Registration Flow...\n');

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  try {
    // Test 1: Simulate the exact registration flow
    console.log('📋 Test 1: Simulating browser registration...');
    
    const testData = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!'
    };

    console.log(`🧪 Registration data:`, testData);

    // Simulate the exact fetch call that the browser makes
    const response = await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log(`📊 Response status: ${response.status}`);
    console.log(`📊 Response status text: ${response.statusText}`);

    if (!response.ok) {
      console.log('❌ Response not OK!');
      console.log('   This might be the issue you\'re seeing in the browser.');
    }

    const result = await response.json();
    console.log(`📊 Response body:`, JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('✅ Registration successful!');
      console.log('   The API is working correctly.');
      console.log('   The issue might be in the browser or frontend code.');
    } else {
      console.log('❌ Registration failed!');
      console.log(`   Error: ${result.message}`);
      console.log('   This is the exact error you\'re seeing.');
    }

    // Test 2: Check if the error message matches what you're seeing
    if (result.message && result.message.includes('Database error while checking existing user')) {
      console.log('\n🎯 FOUND THE ISSUE!');
      console.log('   The error message matches exactly what you reported.');
      console.log('   This suggests the issue is intermittent or related to timing.');
    }

  } catch (error) {
    console.log('❌ Network error:', error.message);
    console.log('   This might be the issue you\'re seeing.');
  }

  // Test 3: Check if there are any environment variable issues
  console.log('\n📋 Test 3: Checking environment variables...');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'SET' : 'MISSING'}`);
  console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? 'SET' : 'MISSING'}`);
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing environment variables!');
    console.log('   This could cause the "Database error" message.');
  }
}

// Run the test
testBrowserRegistration().catch(console.error);
