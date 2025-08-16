// Test Invitation Link Functionality
const PRODUCTION_URL = 'https://showuporelse.com';

async function testInvitationLink() {
  console.log('🔍 Testing Invitation Link Functionality...\n');
  
  // Test 1: Check if we can access the invite page structure
  console.log('1️⃣ Testing invite page accessibility...');
  try {
    const response = await fetch(`${PRODUCTION_URL}/invite/test-event-123`);
    console.log('  - Response status:', response.status);
    console.log('  - Response headers:', response.headers);
    
    if (response.ok) {
      const html = await response.text();
      console.log('  - Page loads successfully');
      console.log('  - HTML contains "Event not found":', html.includes('Event not found'));
      console.log('  - HTML contains "You\'re invited":', html.includes("You're invited"));
    } else {
      console.log('  - Page failed to load');
    }
  } catch (error) {
    console.log('  - Error accessing invite page:', error.message);
  }
  
  // Test 2: Check the events API to see if events exist
  console.log('\n2️⃣ Testing events API...');
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getEvents',
        userEmail: 'test@example.com'
      })
    });
    
    console.log('  - API response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('  - API response:', data);
      console.log('  - Events found:', data.events?.length || 0);
      
      if (data.events && data.events.length > 0) {
        const firstEvent = data.events[0];
        console.log('  - First event ID:', firstEvent.id);
        console.log('  - First event status:', firstEvent.status);
        
        // Test 3: Try to access the specific event invite
        console.log('\n3️⃣ Testing specific event invite...');
        const inviteResponse = await fetch(`${PRODUCTION_URL}/invite/${firstEvent.id}`);
        console.log('  - Invite response status:', inviteResponse.status);
        
        if (inviteResponse.ok) {
          const inviteHtml = await inviteResponse.text();
          console.log('  - Invite page loads successfully');
          console.log('  - Contains event title:', inviteHtml.includes(firstEvent.title));
          console.log('  - Contains "Event not found":', inviteHtml.includes('Event not found'));
        } else {
          console.log('  - Invite page failed to load');
        }
      }
    } else {
      const errorText = await response.text();
      console.log('  - API error:', errorText);
    }
  } catch (error) {
    console.log('  - Error testing events API:', error.message);
  }
  
  // Test 4: Test clipboard functionality
  console.log('\n4️⃣ Testing clipboard functionality...');
  console.log('  - navigator.clipboard exists:', typeof navigator !== 'undefined' && navigator.clipboard);
  console.log('  - clipboard.writeText exists:', typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText);
  console.log('  - isSecureContext:', typeof window !== 'undefined' && window.isSecureContext);
  
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText('test');
      console.log('  - Clipboard API works');
    } catch (error) {
      console.log('  - Clipboard API failed:', error.message);
    }
  }
}

// Run the test
testInvitationLink();

console.log('\n📋 Common Invitation Issues:');
console.log('1. Event ID not found in database');
console.log('2. Event status is cancelled/completed');
console.log('3. Supabase client not configured properly');
console.log('4. CORS issues with API calls');
console.log('5. Clipboard API requires HTTPS and user interaction');

console.log('\n🔧 Debugging Steps:');
console.log('1. Check if event exists in database');
console.log('2. Verify event status is "active"');
console.log('3. Test API endpoint directly');
console.log('4. Check browser console for errors');
console.log('5. Verify clipboard permissions');
