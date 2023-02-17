/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/@:handle',
        destination: '/profiles/:handle',
      },
      {
        source: '/@:handle/:package',
        destination: '/profiles/:handle/:package',
      },
    ]
  },
}

module.exports = nextConfig
