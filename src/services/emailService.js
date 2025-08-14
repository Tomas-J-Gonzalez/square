// Single endpoint strategy on Vercel
const VERCEL_CONFIRM_EMAIL_ENDPOINT = '/api/send-confirmation-email';

// Local dev endpoint (when running local Express email server)
const LOCAL_CONFIRM_EMAIL_ENDPOINT = 'http://localhost:3001/api/send-confirmation-email';

/**
 * Sends a confirmation email via the backend API
 * @param {Object} emailData - Email data
 * @param {string} emailData.email - Recipient email
 * @param {string} emailData.name - Recipient name
 * @param {string} emailData.token - Confirmation token
 * @returns {Promise<Object>} API response
 */
export const sendConfirmationEmail = async (emailData) => {
  const makeRequest = async (url) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });
    let data;
    try {
      data = await res.json();
    } catch (_) {
      data = { success: false, error: 'Invalid JSON from email service' };
    }
    return { ok: res.ok, status: res.status, data };
  };

  try {
    // Always use Vercel API in browser/runtime
    const vercel = await makeRequest(VERCEL_CONFIRM_EMAIL_ENDPOINT);
    if (vercel.ok) return vercel.data;
    console.error('Vercel email API failed:', vercel.status, vercel.data);

    return { success: false, error: vercel.data?.error || 'Failed to send email' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: 'Failed to send email. Please try again.' };
  }
};

/**
 * Checks if the email service is running
 * @returns {Promise<boolean>} True if service is running
 */
export const checkEmailService = async () => {
  try {
    const res = await fetch(VERCEL_CONFIRM_EMAIL_ENDPOINT, { method: 'OPTIONS' });
    return res.ok;
  } catch (error) {
    console.error('Email service not available:', error);
    return false;
  }
};
