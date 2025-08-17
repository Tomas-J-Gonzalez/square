const testSocialSharing = async () => {
  const eventId = 'test-event-123';
  const baseUrl = 'http://localhost:3000';
  const inviteUrl = `${baseUrl}/invite/${eventId}`;

  console.log('🧪 Testing social sharing metadata...');
  console.log('🔗 Invite URL:', inviteUrl);
  console.log('📱 This URL should display properly on Facebook when shared');

  try {
    // Fetch the page to check if it loads
    const response = await fetch(inviteUrl);
    
    if (response.ok) {
      const html = await response.text();
      
      // Check for Open Graph meta tags
      const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/);
      const ogDescription = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/);
      const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/);
      
      console.log('\n✅ Page loads successfully');
      console.log('📋 Meta tags found:');
      
      if (ogTitle) {
        console.log('  📝 og:title:', ogTitle[1]);
      } else {
        console.log('  ❌ og:title: Not found');
      }
      
      if (ogDescription) {
        console.log('  📝 og:description:', ogDescription[1]);
      } else {
        console.log('  ❌ og:description: Not found');
      }
      
      if (ogImage) {
        console.log('  🖼️  og:image:', ogImage[1]);
      } else {
        console.log('  ❌ og:image: Not found');
      }
      
      console.log('\n📱 To test Facebook sharing:');
      console.log('1. Go to https://developers.facebook.com/tools/debug/');
      console.log('2. Enter the URL:', inviteUrl);
      console.log('3. Click "Debug" to see how it will appear on Facebook');
      console.log('4. The image should be pink with "Show Up or Else" branding');
      
    } else {
      console.error('❌ Page failed to load:', response.status);
    }
  } catch (error) {
    console.error('❌ Error testing social sharing:', error.message);
  }
};

testSocialSharing();
