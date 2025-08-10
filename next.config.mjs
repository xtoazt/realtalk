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
  // No rewrites needed for CORS proxy
}

export default nextConfig
