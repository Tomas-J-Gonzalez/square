import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

function makeHttpRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/events',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const responseData = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: responseData
          });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testWithHttp() {
  console.log('🔍 TESTING WITH HTTP MODULE\n');

  try {
    // Use the exact same data that worked with curl
    const exactData = {
      action: 'createEvent',
      eventData: {
        title: 'Test Event with HTTP',
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

    console.log('📝 Data being sent with http module:');
    console.log(JSON.stringify(exactData, null, 2));

    // Make the API request with http module
    const response = await makeHttpRequest(exactData);

    console.log(`\n📊 Response Status: ${response.status}`);
    console.log('📋 Response Data:');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data.success) {
      console.log('\n✅ HTTP module request successful!');
      console.log(`📅 Created event ID: ${response.data.event.id}`);
      
      // Clean up the test event
      console.log('\n🧹 Cleaning up test event...');
      const deleteResponse = await makeHttpRequest({
        action: 'deleteEvent',
        eventId: response.data.event.id
      });

      if (deleteResponse.status === 200) {
        console.log('✅ Test event cleaned up');
      } else {
        console.log('⚠️  Could not clean up test event');
      }
    } else {
      console.log('\n❌ HTTP module request failed!');
      console.log(`Error: ${response.data.error}`);
    }

    console.log('\n🎉 HTTP module test complete!');

  } catch (error) {
    console.error('❌ Error in testWithHttp:', error);
  }
}

testWithHttp();
