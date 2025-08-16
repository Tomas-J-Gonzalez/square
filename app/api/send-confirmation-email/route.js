import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, name, confirmationUrl } = body;

    if (!email || !name || !confirmationUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // For now, just log the confirmation URL since email service might not be configured
    console.log('Confirmation email would be sent to:', email);
    console.log('Confirmation URL:', confirmationUrl);
    console.log('User name:', name);

    // In production, you would use Resend or another email service here
    // For now, we'll just return success and log the details
    return NextResponse.json({ 
      success: true, 
      message: 'Confirmation email sent (logged for development)',
      confirmationUrl // Return this for development purposes
    });

  } catch (error) {
    console.error('Send confirmation email error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send confirmation email' 
    }, { status: 500 });
  }
}
