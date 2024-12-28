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
      },
      {
        source: '/widget.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
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