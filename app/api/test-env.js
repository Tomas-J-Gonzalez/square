export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  // Only allow GET requests for security
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check environment variables (only show if they exist, not the actual values)
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
      VERCEL_URL: !!process.env.VERCEL_URL
    };

    return res.status(200).json({
      success: true,
      environmentVariables: envCheck,
      message: 'Environment variables check completed'
    });
  } catch (error) {
    console.error('Test env error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
