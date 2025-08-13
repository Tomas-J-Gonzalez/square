// Endpoints: Netlify function (primary) and Vercel API (fallback)
const NETLIFY_CONFIRM_EMAIL_ENDPOINT = '/.netlify/functions/send-confirmation-email';
// Allow override via env; fallback to deployed Vercel URL
const VERCEL_CONFIRM_EMAIL_ENDPOINT =
  (import.meta.env && import.meta.env.VITE_VERCEL_API_BASE)
    ? `${import.meta.env.VITE_VERCEL_API_BASE.replace(/\/$/, '')}/send-confirmation-email`
    : 'https://square-pjzq9113x-qualityraros-projects.vercel.app/api/send-confirmation-email';

// Local dev endpoint
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
    // Prefer local during development
    if (!import.meta.env.PROD) {
      const local = await makeRequest(LOCAL_CONFIRM_EMAIL_ENDPOINT);
      if (local.ok) return local.data;
    }

    // Try Netlify function first
    const netlify = await makeRequest(NETLIFY_CONFIRM_EMAIL_ENDPOINT);
    if (netlify.ok) return netlify.data;
    console.warn('Netlify email function failed:', netlify.status, netlify.data);

    // Fallback to Vercel API
    const vercel = await makeRequest(VERCEL_CONFIRM_EMAIL_ENDPOINT);
    if (vercel.ok) return vercel.data;
    console.error('Vercel email API failed:', vercel.status, vercel.data);

    return { success: false, error: vercel.data?.error || netlify.data?.error || 'Failed to send email' };
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
    // In production, we assume the service is available since it's a Netlify function
    if (import.meta.env.PROD) {
      // Probe Netlify first, then Vercel
      try {
        const res = await fetch(NETLIFY_CONFIRM_EMAIL_ENDPOINT, { method: 'OPTIONS' });
        if (res.ok) return true;
      } catch (_) {}
      try {
        const res = await fetch(VERCEL_CONFIRM_EMAIL_ENDPOINT, { method: 'OPTIONS' });
        if (res.ok) return true;
      } catch (_) {}
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
