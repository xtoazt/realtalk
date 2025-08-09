/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  serverExternalPackages: ['@neondatabase/serverless'],
  async rewrites() {
    const bare = process.env.BARE_URL || ''
    const rules = []
    if (bare) {
      rules.push({
        source: '/bare/:path*',
        destination: `${bare.replace(/\/$/, '')}/:path*`,
      })
    }
    return rules
  },
}

export default nextConfig
