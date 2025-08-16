// Final Comprehensive Test - All Functionality
const PRODUCTION_URL = 'https://showuporelse.com';

async function comprehensiveTest() {
  console.log('🎯 FINAL COMPREHENSIVE TEST - All Functionality\n');
  
  const results = {
    siteAccessibility: false,
    eventCreation: false,
    eventCancellation: false,
    eventCompletion: false,
    rsvpFunctionality: false,
    participantManagement: false,
    invitationLinks: false,
    apiEndpoints: false
  };
  
  try {
    // Test 1: Site Accessibility
    console.log('1️⃣ Testing site accessibility...');
    const siteResponse = await fetch(PRODUCTION_URL);
    if (siteResponse.ok) {
      console.log('✅ Site is accessible');
      results.siteAccessibility = true;
    } else {
      console.log('❌ Site accessibility failed');
    }
    
    // Test 2: Event Creation API
    console.log('\n2️⃣ Testing event creation...');
    const createResponse = await fetch(`${PRODUCTION_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'createEvent',
        userEmail: 'test@example.com',
        eventData: {
          id: 'comprehensive-test-event',
          title: 'Comprehensive Test Event',
          date: '2024-12-25',
          time: '19:00',
          location: 'Test Location',
          decisionMode: 'none',
          punishment: 'Test Punishment',
          createdAt: new Date().toISOString()
        }
      })
    });
    
    if (createResponse.ok) {
      console.log('✅ Event creation works');
      results.eventCreation = true;
    } else {
      console.log('❌ Event creation failed:', createResponse.status);
    }
    
    // Test 3: Event Cancellation
    console.log('\n3️⃣ Testing event cancellation...');
    const cancelResponse = await fetch(`${PRODUCTION_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'cancelEvent',
        eventId: 'comprehensive-test-event',
        userEmail: 'test@example.com',
        updates: { status: 'cancelled' }
      })
    });
    
    if (cancelResponse.ok) {
      console.log('✅ Event cancellation works');
      results.eventCancellation = true;
    } else {
      console.log('❌ Event cancellation failed:', cancelResponse.status);
    }
    
    // Test 4: Event Completion
    console.log('\n4️⃣ Testing event completion...');
    const completeResponse = await fetch(`${PRODUCTION_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'completeEvent',
        eventId: 'comprehensive-test-event',
        userEmail: 'test@example.com',
        updates: { status: 'completed' }
      })
    });
    
    if (completeResponse.ok) {
      console.log('✅ Event completion works');
      results.eventCompletion = true;
    } else {
      console.log('❌ Event completion failed:', completeResponse.status);
    }
    
    // Test 5: RSVP Functionality
    console.log('\n5️⃣ Testing RSVP functionality...');
    const rsvpResponse = await fetch(`${PRODUCTION_URL}/api/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: 'comprehensive-test-event',
        name: 'Test Participant',
        email: 'participant@example.com',
        willAttend: true,
        message: 'Comprehensive test RSVP'
      })
    });
    
    if (rsvpResponse.ok) {
      console.log('✅ RSVP functionality works');
      results.rsvpFunctionality = true;
    } else {
      console.log('❌ RSVP functionality failed:', rsvpResponse.status);
    }
    
    // Test 6: Participant Management
    console.log('\n6️⃣ Testing participant management...');
    const participantsResponse = await fetch(`${PRODUCTION_URL}/api/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getParticipants',
        eventId: 'comprehensive-test-event'
      })
    });
    
    if (participantsResponse.ok) {
      console.log('✅ Participant management works');
      results.participantManagement = true;
    } else {
      console.log('❌ Participant management failed:', participantsResponse.status);
    }
    
    // Test 7: Invitation Links
    console.log('\n7️⃣ Testing invitation links...');
    const inviteResponse = await fetch(`${PRODUCTION_URL}/invite/comprehensive-test-event`);
    if (inviteResponse.ok) {
      console.log('✅ Invitation links work');
      results.invitationLinks = true;
    } else {
      console.log('❌ Invitation links failed:', inviteResponse.status);
    }
    
    // Test 8: API Endpoints
    console.log('\n8️⃣ Testing API endpoints...');
    const apiResponse = await fetch(`${PRODUCTION_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getEvents',
        userEmail: 'test@example.com'
      })
    });
    
    if (apiResponse.ok) {
      console.log('✅ API endpoints work');
      results.apiEndpoints = true;
    } else {
      console.log('❌ API endpoints failed:', apiResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  // Summary
  console.log('\n📊 COMPREHENSIVE TEST RESULTS:');
  console.log('================================');
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} ${testName}`);
  });
  
  const passedCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  const percentage = Math.round((passedCount / totalCount) * 100);
  
  console.log('\n🎯 OVERALL RESULT:');
  console.log(`✅ ${passedCount}/${totalCount} tests passed (${percentage}%)`);
  
  if (percentage === 100) {
    console.log('🎉 ALL TESTS PASSED! Your app is fully functional!');
  } else if (percentage >= 80) {
    console.log('👍 Most functionality is working! Minor issues may remain.');
  } else {
    console.log('⚠️  Several issues need attention.');
  }
}

comprehensiveTest();
