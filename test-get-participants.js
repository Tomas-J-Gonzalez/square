// Test Get Participants Functionality
const PRODUCTION_URL = 'https://showuporelse.com';

async function testGetParticipants() {
  console.log('🔍 Testing Get Participants Functionality...\n');
  
  try {
    // Test the new getParticipants action
    console.log('1️⃣ Testing getParticipants action...');
    const response = await fetch(`${PRODUCTION_URL}/api/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getParticipants',
        eventId: 'test-event-123'
      })
    });
    
    console.log('Get participants response status:', response.status);
    const responseText = await response.text();
    console.log('Get participants response body:', responseText);
    
    // Test regular RSVP submission (should still work)
    console.log('\n2️⃣ Testing regular RSVP submission...');
    const rsvpResponse = await fetch(`${PRODUCTION_URL}/api/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: 'test-event-123',
        name: 'Another Friend',
        email: 'another@example.com',
        willAttend: true,
        message: 'Test RSVP'
      })
    });
    
    console.log('RSVP response status:', rsvpResponse.status);
    const rsvpText = await rsvpResponse.text();
    console.log('RSVP response body:', rsvpText);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testGetParticipants();
