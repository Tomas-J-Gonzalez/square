// Test Cancel Event Functionality
const PRODUCTION_URL = 'https://showuporelse.com';

async function testCancelEvent() {
  console.log('🔍 Testing Cancel Event Functionality...\n');
  
  try {
    // Test 1: Test cancel event API
    console.log('1️⃣ Testing cancel event API...');
    const cancelResponse = await fetch(`${PRODUCTION_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'cancelEvent',
        eventId: 'test-event-123',
        userEmail: 'test@example.com',
        updates: { status: 'cancelled' }
      })
    });
    
    console.log('Cancel event response status:', cancelResponse.status);
    const cancelText = await cancelResponse.text();
    console.log('Cancel event response body:', cancelText);
    
    // Test 2: Test complete event API
    console.log('\n2️⃣ Testing complete event API...');
    const completeResponse = await fetch(`${PRODUCTION_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'completeEvent',
        eventId: 'test-event-123',
        userEmail: 'test@example.com',
        updates: { status: 'completed' }
      })
    });
    
    console.log('Complete event response status:', completeResponse.status);
    const completeText = await completeResponse.text();
    console.log('Complete event response body:', completeText);
    
    // Test 3: Test update event API (general)
    console.log('\n3️⃣ Testing update event API...');
    const updateResponse = await fetch(`${PRODUCTION_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateEvent',
        eventId: 'test-event-123',
        userEmail: 'test@example.com',
        updates: { title: 'Updated Test Event' }
      })
    });
    
    console.log('Update event response status:', updateResponse.status);
    const updateText = await updateResponse.text();
    console.log('Update event response body:', updateText);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testCancelEvent();
