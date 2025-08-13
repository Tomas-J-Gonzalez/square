// Use Netlify function in production, localhost in development
const EMAIL_API_BASE_URL = import.meta.env.PROD 
  ? '/.netlify/functions/send-confirmation-email'
  : 'http://localhost:3001/api/send-confirmation-email';

/**
 * Sends a confirmation email via the backend API
 * @param {Object} emailData - Email data
 * @param {string} emailData.email - Recipient email
 * @param {string} emailData.name - Recipient name
 * @param {string} emailData.token - Confirmation token
 * @returns {Promise<Object>} API response
 */
export const sendConfirmationEmail = async (emailData) => {
  try {
    const response = await fetch(EMAIL_API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: 'Failed to send email. Please try again.'
    };
  }
};

/**
 * Checks if the email service is running
 * @returns {Promise<boolean>} True if service is running
 */
export const checkEmailService = async () => {
  try {
    // In production, we assume the service is available since it's a Netlify function
    if (import.meta.env.PROD) {
      return true;
    }
    
    // In development, check the local server
    const response = await fetch('http://localhost:3001/api/health');
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Email service not available:', error);
    return false;
  }
};
