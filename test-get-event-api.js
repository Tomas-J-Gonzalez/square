// Test getEvent API endpoint specifically
const PRODUCTION_URL = 'https://showuporelse.com';

async function testGetEventAPI() {
  console.log('🔍 Testing getEvent API endpoint...\n');
  
  // Test with a known event ID from our previous test
  const eventId = 'test-event-after-cancel-1755309759067';
  
  console.log('1️⃣ Testing getEvent API with event ID:', eventId);
  
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getEvent',
        eventId
      })
    });
    
    console.log('  - Response status:', response.status);
    console.log('  - Response headers:', response.headers);
    
    if (response.ok) {
      const data = await response.json();
      console.log('  - API response:', JSON.stringify(data, null, 2));
      
      if (data.success && data.event) {
        console.log('✅ Event found successfully!');
        console.log('  - Event title:', data.event.title);
        console.log('  - Event status:', data.event.status);
        console.log('  - Event date:', data.event.date);
        console.log('  - Event time:', data.event.time);
      } else {
        console.log('❌ Event not found in response');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ API error:', errorText);
    }
  } catch (error) {
    console.log('❌ Error testing getEvent API:', error.message);
  }
  
  // Test with a non-existent event ID
  console.log('\n2️⃣ Testing getEvent API with non-existent event ID...');
  
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getEvent',
        eventId: 'non-existent-event-123'
      })
    });
    
    console.log('  - Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('  - API response:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('  - API error (expected):', errorText);
    }
  } catch (error) {
    console.log('❌ Error testing non-existent event:', error.message);
  }
}

// Run the test
testGetEventAPI();

console.log('\n📋 Expected Results:');
console.log('1. getEvent API should return event data for valid event ID');
console.log('2. getEvent API should return 404 for non-existent event ID');
console.log('3. Invite page should use this API to display event details');
