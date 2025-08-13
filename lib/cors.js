/**
 * CORS helper function for Vercel serverless functions
 * Applies CORS headers to allow requests from Netlify-hosted frontend
 */
export function cors(req, res) {
  // Allow requests from any origin (you can restrict this to your Netlify domain)
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Allow specific headers
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Allow specific methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Allow credentials (if needed)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Cache preflight response for 24 hours
  res.setHeader('Access-Control-Max-Age', '86400');
}
