/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://highfocus.netlify.app"
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://highfocus.netlify.app'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig