/** @type {import('next').NextConfig} */

const cspHeader = `
  default-src 'self' https://api.database.dev/;
  style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com/ https://fonts.google.com/;
  img-src 'self' data: https://api.database.dev/storage/;
  object-src 'none';
  base-uri 'none';
  frame-ancestors 'none';
`

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          }
        ],
      },
    ]
  },
}

module.exports = nextConfig
