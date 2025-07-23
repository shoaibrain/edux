/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['geist'], // Required for Geist font to work correctly
};

export default nextConfig;