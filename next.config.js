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
  }
};

export default nextConfig;

