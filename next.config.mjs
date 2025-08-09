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
  // Provide a safe 200 fallback for /uv/* so if SW isn't controlling yet, the iframe won't show a Next 404
  async rewrites() {
    return [
      { source: '/uv/:path*', destination: '/uv-blank.html' },
    ]
  },
}

export default nextConfig
