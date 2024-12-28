/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
  }
};

module.exports = nextConfig; 