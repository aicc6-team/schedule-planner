/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://44.212.4.6:3001/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 
