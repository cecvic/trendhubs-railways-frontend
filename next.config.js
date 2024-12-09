/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Disable source maps in production for smaller bundle size
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig 