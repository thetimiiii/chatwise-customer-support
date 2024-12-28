/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async headers() {
    return [
      {
        // Allow embedding in iframes from any domain
        source: '/embedded-chat',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' *"
          }
        ],
      }
    ];
  },
  async rewrites() {
    return [
      {
        source: '/public/widget.js',
        destination: '/widget.js',
      },
    ];
  },
};

module.exports = nextConfig;