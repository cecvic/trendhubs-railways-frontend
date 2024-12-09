/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other config
  async headers() {
    return [
      {
        // Allow CORS for your API domain
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_API_URL,
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig 