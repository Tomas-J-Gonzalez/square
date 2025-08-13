const EMAIL_API_BASE_URL = 'http://localhost:3001/api';

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
    const response = await fetch(`${EMAIL_API_BASE_URL}/send-confirmation-email`, {
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
    const response = await fetch(`${EMAIL_API_BASE_URL}/health`);
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Email service not available:', error);
    return false;
  }
};
