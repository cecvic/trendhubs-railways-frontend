/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports if needed
  output: 'standalone',
  
  // Add CORS configuration
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },

  // Add any necessary redirects or rewrites
  rewrites: async () => {
    return [];
  },

  // Make sure environment variables are properly exposed
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

module.exports = nextConfig; 