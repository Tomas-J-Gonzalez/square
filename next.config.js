/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  experimental: {
    optimizeCss: false
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  images: (() => {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : null;
      if (!url) return {};
      return {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: url.hostname,
            pathname: '/storage/v1/object/public/**'
          }
        ]
      };
    } catch (_) {
      return {};
    }
  })()
};

module.exports = nextConfig;

