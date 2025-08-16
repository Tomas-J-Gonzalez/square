// Test RSVP Functionality
const PRODUCTION_URL = 'https://showuporelse.com';

async function testRSVP() {
  console.log('🔍 Testing RSVP Functionality...\n');
  
  try {
    // Test 1: Test RSVP endpoint with a test event
    console.log('1️⃣ Testing RSVP endpoint...');
    const rsvpResponse = await fetch(`${PRODUCTION_URL}/api/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: 'test-event-123',
        name: 'Test User',
        email: 'test@example.com',
        willAttend: true,
        message: 'Test RSVP',
        event: {
          id: 'test-event-123',
          title: 'Test Event',
          date: '2024-01-15',
          time: '18:00',
          location: 'Test Location',
          decisionMode: 'none',
          punishment: 'Test Punishment',
          invitedBy: 'test@example.com'
        }
      })
    });
    
    console.log('RSVP response status:', rsvpResponse.status);
    const rsvpText = await rsvpResponse.text();
    console.log('RSVP response body:', rsvpText);
    
    // Test 2: Test adding a participant (organizer functionality)
    console.log('\n2️⃣ Testing add participant...');
    const addParticipantResponse = await fetch(`${PRODUCTION_URL}/api/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: 'test-event-123',
        name: 'New Friend',
        email: 'friend@example.com',
        willAttend: true,
        message: 'Added by organizer'
      })
    });
    
    console.log('Add participant response status:', addParticipantResponse.status);
    const addParticipantText = await addParticipantResponse.text();
    console.log('Add participant response body:', addParticipantText);
    
    // Test 3: Test invitation link functionality
    console.log('\n3️⃣ Testing invitation link...');
    const inviteResponse = await fetch(`${PRODUCTION_URL}/invite/test-event-123`);
    console.log('Invitation page status:', inviteResponse.status);
    
    if (inviteResponse.ok) {
      const inviteText = await inviteResponse.text();
      console.log('Invitation page accessible');
    } else {
      console.log('Invitation page error:', inviteResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testRSVP();
