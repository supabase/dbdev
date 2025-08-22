/** @type {import('next').NextConfig} */

const cspHeader = `
  default-src 'self' 'unsafe-eval' ${process.env.NEXT_PUBLIC_SUPABASE_URL};
  style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com/ https://fonts.google.com/;
  img-src 'self' data: ${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/;
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
            value: 'SAMEORIGIN',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
