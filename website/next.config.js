/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/@:handle',
        destination: '/content/:handle',
      },
      {
        source: '/@:handle/:package',
        destination: '/content/:handle/:package',
      },
    ]
  },
}

module.exports = nextConfig
