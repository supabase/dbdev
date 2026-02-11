import { createMDX } from 'fumadocs-mdx/next'

const cspHeader = `
  default-src 'self' 'unsafe-eval' ${process.env.NEXT_PUBLIC_SUPABASE_URL};
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com/ https://fonts.google.com/;
  img-src 'self' data: ${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/ https://img.shields.io https://github.com;
  object-src 'none';
  base-uri 'none';
  frame-ancestors 'none';
`

/** @type {import('next').NextConfig} */
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

const withMDX = createMDX()

export default withMDX(nextConfig)
