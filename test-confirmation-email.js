const testConfirmationEmail = async () => {
  const email = 'tomachos08@gmail.com';
  const name = 'Test User';
  const token = 'test-token-' + Date.now();
  
  // Use the production URL since local server isn't running
  const baseUrl = 'https://square-tomas-j-gonzalez.vercel.app';

  console.log('🧪 Testing confirmation email with new design...');
  console.log('📧 Sending to:', email);
  console.log('👤 Name:', name);
  console.log('🔑 Token:', token);
  console.log('🌐 Base URL:', baseUrl);

  try {
    const response = await fetch(`${baseUrl}/api/send-confirmation-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name,
        token
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Confirmation email sent successfully!');
      console.log('📋 Response data:', data);
      console.log('🔗 Confirmation URL:', data.confirmationUrl);
      console.log('\n📧 Check your email at:', email);
      console.log('📱 The email should now display the new text-based logo and improved design');
    } else {
      console.error('❌ Failed to send confirmation email:', data.error);
    }
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
  }
};

// Run the test
testConfirmationEmail();
