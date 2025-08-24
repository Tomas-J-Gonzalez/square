import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

async function testWithAxios() {
  console.log('🔍 TESTING WITH AXIOS\n');

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  try {
    // Use the exact same data that worked with curl
    const exactData = {
      action: 'createEvent',
      eventData: {
        title: 'Test Event with Axios',
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

    console.log('📝 Data being sent with axios:');
    console.log(JSON.stringify(exactData, null, 2));

    // Make the API request with axios
    const response = await axios.post(`${baseUrl}/api/events`, exactData, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log(`\n📊 Response Status: ${response.status}`);
    console.log('📋 Response Data:');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data.success) {
      console.log('\n✅ Axios request successful!');
      console.log(`📅 Created event ID: ${response.data.event.id}`);
      
      // Clean up the test event
      console.log('\n🧹 Cleaning up test event...');
      const deleteResponse = await axios.post(`${baseUrl}/api/events`, {
        action: 'deleteEvent',
        eventId: response.data.event.id
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (deleteResponse.status === 200) {
        console.log('✅ Test event cleaned up');
      } else {
        console.log('⚠️  Could not clean up test event');
      }
    } else {
      console.log('\n❌ Axios request failed!');
      console.log(`Error: ${response.data.error}`);
    }

    console.log('\n🎉 Axios test complete!');

  } catch (error) {
    console.error('❌ Error in testWithAxios:', error.response ? {
      status: error.response.status,
      data: error.response.data
    } : error.message);
  }
}

testWithAxios();
