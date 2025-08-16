// Test direct access to invite page
const PRODUCTION_URL = 'https://showuporelse.com';

async function testInvitePageDirect() {
  console.log('🔍 Testing direct invite page access...\n');
  
  // Test with a known event ID
  const eventId = 'test-event-after-cancel-1755309759067';
  const inviteUrl = `${PRODUCTION_URL}/invite/${eventId}`;
  
  console.log('1️⃣ Testing invite page URL:', inviteUrl);
  
  try {
    const response = await fetch(inviteUrl);
    console.log('  - Response status:', response.status);
    console.log('  - Response headers:', response.headers);
    
    if (response.ok) {
      const html = await response.text();
      console.log('  - HTML length:', html.length);
      
      // Check for key content
      console.log('  - Contains "Event not found":', html.includes('Event not found'));
      console.log('  - Contains "You\'re invited":', html.includes("You're invited"));
      console.log('  - Contains "Loading invitation":', html.includes('Loading invitation'));
      console.log('  - Contains "Event After Cancellation":', html.includes('Event After Cancellation'));
      console.log('  - Contains "React":', html.includes('React'));
      console.log('  - Contains "useEffect":', html.includes('useEffect'));
      
      // Look for any JavaScript errors or issues
      console.log('  - Contains "console.log":', html.includes('console.log'));
      console.log('  - Contains "error":', html.includes('error'));
      
      // Check if it's a static page or React app
      if (html.includes('__NEXT_DATA__')) {
        console.log('✅ This is a Next.js page with React hydration');
      } else {
        console.log('⚠️  This appears to be a static page');
      }
      
      // Look for the actual event data in the HTML
      if (html.includes(eventId)) {
        console.log('✅ Event ID found in HTML');
      } else {
        console.log('❌ Event ID not found in HTML');
      }
      
    } else {
      console.log('❌ Page failed to load');
    }
  } catch (error) {
    console.log('❌ Error accessing invite page:', error.message);
  }
  
  // Test with a non-existent event ID
  console.log('\n2️⃣ Testing with non-existent event ID...');
  
  try {
    const response = await fetch(`${PRODUCTION_URL}/invite/non-existent-event-123`);
    console.log('  - Response status:', response.status);
    
    if (response.ok) {
      const html = await response.text();
      console.log('  - Contains "Event not found":', html.includes('Event not found'));
      console.log('  - Contains "You\'re invited":', html.includes("You're invited"));
    }
  } catch (error) {
    console.log('❌ Error accessing non-existent event:', error.message);
  }
}

// Run the test
testInvitePageDirect();

console.log('\n📋 Analysis:');
console.log('1. If HTML contains React/Next.js markers, the page should work');
console.log('2. If it\'s static HTML, there might be a build issue');
console.log('3. Check browser console for JavaScript errors');
console.log('4. The page should hydrate and fetch event data via API');
