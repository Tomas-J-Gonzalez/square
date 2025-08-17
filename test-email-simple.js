const testEmail = async () => {
  const token = "test-token-" + Date.now();
  const confirmationUrl = `http://localhost:3000/confirm-email?token=${token}`;
  
  const payload = {
    email: "tomachos08@gmail.com",
    name: "Test User", 
    confirmationUrl: confirmationUrl
  };

  console.log('🧪 Testing confirmation email...');
  console.log('📧 Payload:', payload);

  try {
    const response = await fetch('http://localhost:3000/api/send-confirmation-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('📋 Response:', data);
    
    if (data.success) {
      console.log('✅ Email sent successfully!');
      console.log('🔗 Confirmation URL:', data.confirmationUrl);
      console.log('\n📧 Check your email at: tomachos08@gmail.com');
      console.log('📱 The email should now display the new text-based logo and improved design');
    } else {
      console.error('❌ Failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testEmail();
