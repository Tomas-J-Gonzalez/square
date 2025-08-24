import dotenv from 'dotenv';

dotenv.config();

async function testExactCurlData() {
  console.log('🔍 TESTING EXACT CURL DATA\n');

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  try {
    // Use the exact same data that worked with curl
    const exactData = {
      action: 'createEvent',
      eventData: {
        title: 'Test Event',
        date: '2024-12-25',
        time: '18:00',
        location: 'Test Location',
        eventType: 'in-person',
        eventDetails: 'Test details',
        punishment: 'Test punishment',
        invited_by: 'testuser@example.com',
        access: 'private',
        pageVisibility: 'private'
      }
    };

    console.log('📝 Exact data being sent:');
    console.log(JSON.stringify(exactData, null, 2));

    // Make the API request
    const response = await fetch(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exactData),
    });

    const data = await response.json();

    console.log(`\n📊 Response Status: ${response.status}`);
    console.log('📋 Response Data:');
    console.log(JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log('\n✅ Fetch request successful!');
      console.log(`📅 Created event ID: ${data.event.id}`);
      
      // Clean up the test event
      console.log('\n🧹 Cleaning up test event...');
      const deleteResponse = await fetch(`${baseUrl}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deleteEvent',
          eventId: data.event.id
        })
      });

      if (deleteResponse.ok) {
        console.log('✅ Test event cleaned up');
      } else {
        console.log('⚠️  Could not clean up test event');
      }
    } else {
      console.log('\n❌ Fetch request failed!');
      console.log(`Error: ${data.error}`);
    }

    console.log('\n🎉 Test complete!');

  } catch (error) {
    console.error('❌ Error in testExactCurlData:', error);
  }
}

testExactCurlData();
