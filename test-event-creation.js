// Test Event Creation Functionality
const PRODUCTION_URL = 'https://showuporelse.com';

async function testEventCreation() {
  console.log('🔍 Testing Event Creation Functionality...\n');
  
  try {
    // Test 1: Test event creation with unique ID
    console.log('1️⃣ Testing event creation...');
    const uniqueId = `test-event-${Date.now()}`;
    const createResponse = await fetch(`${PRODUCTION_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'createEvent',
        userEmail: 'test@example.com',
        eventData: {
          id: uniqueId,
          title: 'Test Event Creation',
          date: '2024-12-25',
          time: '19:00',
          location: 'Test Location',
          decisionMode: 'none',
          punishment: 'Test Punishment',
          createdAt: new Date().toISOString()
        }
      })
    });
    
    console.log('Event creation response status:', createResponse.status);
    const createText = await createResponse.text();
    console.log('Event creation response body:', createText);
    
    if (createResponse.ok) {
      console.log('✅ Event creation works!');
      
      // Test 2: Try to create another event (should fail due to active event)
      console.log('\n2️⃣ Testing duplicate event creation (should fail)...');
      const duplicateResponse = await fetch(`${PRODUCTION_URL}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createEvent',
          userEmail: 'test@example.com',
          eventData: {
            id: `test-event-duplicate-${Date.now()}`,
            title: 'Duplicate Test Event',
            date: '2024-12-26',
            time: '20:00',
            location: 'Another Location',
            decisionMode: 'none',
            punishment: 'Another Punishment',
            createdAt: new Date().toISOString()
          }
        })
      });
      
      console.log('Duplicate event creation response status:', duplicateResponse.status);
      const duplicateText = await duplicateResponse.text();
      console.log('Duplicate event creation response body:', duplicateText);
      
      if (duplicateResponse.status === 400) {
        console.log('✅ Duplicate event creation correctly blocked!');
      } else {
        console.log('⚠️  Duplicate event creation should have been blocked');
      }
      
      // Test 3: Cancel the first event
      console.log('\n3️⃣ Testing event cancellation...');
      const cancelResponse = await fetch(`${PRODUCTION_URL}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancelEvent',
          eventId: uniqueId,
          userEmail: 'test@example.com',
          updates: { status: 'cancelled' }
        })
      });
      
      console.log('Cancel event response status:', cancelResponse.status);
      const cancelText = await cancelResponse.text();
      console.log('Cancel event response body:', cancelText);
      
      if (cancelResponse.ok) {
        console.log('✅ Event cancellation works!');
        
        // Test 4: Try to create another event after cancellation (should work)
        console.log('\n4️⃣ Testing event creation after cancellation...');
        const newEventResponse = await fetch(`${PRODUCTION_URL}/api/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'createEvent',
            userEmail: 'test@example.com',
            eventData: {
              id: `test-event-after-cancel-${Date.now()}`,
              title: 'Event After Cancellation',
              date: '2024-12-27',
              time: '21:00',
              location: 'New Location',
              decisionMode: 'none',
              punishment: 'New Punishment',
              createdAt: new Date().toISOString()
            }
          })
        });
        
        console.log('New event creation response status:', newEventResponse.status);
        const newEventText = await newEventResponse.text();
        console.log('New event creation response body:', newEventText);
        
        if (newEventResponse.ok) {
          console.log('✅ Event creation after cancellation works!');
        } else {
          console.log('❌ Event creation after cancellation failed');
        }
      } else {
        console.log('❌ Event cancellation failed');
      }
      
    } else {
      console.log('❌ Event creation failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testEventCreation();
