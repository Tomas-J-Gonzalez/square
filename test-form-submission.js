import dotenv from 'dotenv';

dotenv.config();

async function testFormSubmission() {
  console.log('🧪 TESTING FORM SUBMISSION SIMULATION\n');

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  try {
    // Simulate the exact form data that would be sent from the create-event page
    console.log('1️⃣ Simulating form submission...');
    
    // Mock user data (as would be stored in localStorage)
    const mockUser = {
      email: 'testuser@example.com',
      name: 'Test User'
    };

    // Mock form data (as would be collected from the form)
    const mockFormData = {
      title: 'Test Event from Form',
      date: '2024-12-25',
      time: '18:00',
      location: 'Test Location',
      eventType: 'in-person',
      eventDetails: 'Test event details from form',
      punishment: 'buys_drinks', // This would be a punishment option value
      customPunishment: '',
      access: 'private',
      pageVisibility: 'private'
    };

    // Simulate the punishment processing logic from the form
    const PUNISHMENT_OPTIONS = [
      { value: '25_pushups', label: '25 Pushups' },
      { value: 'buys_drinks', label: 'Buys Drinks Next Time' },
      { value: 'cleans_up', label: 'Cleans Up After Event' },
      { value: 'cooks_next', label: 'Cooks for Next Event' },
      { value: 'pays_penalty', label: 'Pays $20 Penalty' },
      { value: 'wears_costume', label: 'Wears Embarrassing Costume' },
      { value: 'sings_song', label: 'Sings a Song in Public' },
      { value: 'dance_routine', label: 'Does a Dance Routine' },
      { value: 'custom', label: 'Custom Punishment' }
    ];

    const finalPunishment = mockFormData.punishment === 'custom' 
      ? mockFormData.customPunishment 
      : PUNISHMENT_OPTIONS.find(opt => opt.value === mockFormData.punishment)?.label || '';

    // Create the eventData object exactly as the form does
    const eventData = {
      title: mockFormData.title.trim(),
      date: mockFormData.date,
      time: mockFormData.time,
      location: mockFormData.location.trim(),
      eventType: mockFormData.eventType,
      eventDetails: mockFormData.eventDetails.trim(),
      punishment: finalPunishment,
      invited_by: mockUser.email,
      access: mockFormData.access,
      pageVisibility: mockFormData.pageVisibility
    };

    console.log('📝 Form data being sent:');
    console.log(JSON.stringify(eventData, null, 2));

    // Make the API request exactly as the form does
    const response = await fetch(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'createEvent', eventData }),
    });

    const data = await response.json();

    console.log(`\n📊 Response Status: ${response.status}`);
    console.log('📋 Response Data:');
    console.log(JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log('\n✅ Form submission successful!');
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
      console.log('\n❌ Form submission failed!');
      console.log(`Error: ${data.error}`);
    }

    console.log('\n🎉 Form submission test complete!');

  } catch (error) {
    console.error('❌ Error in testFormSubmission:', error);
    console.log('\n💡 This might indicate:');
    console.log('   - Development server not running');
    console.log('   - Network connectivity issues');
    console.log('   - API endpoint not accessible');
  }
}

testFormSubmission();
