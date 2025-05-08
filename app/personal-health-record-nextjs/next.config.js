/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // We'll enable 'output: export' when building for Electron
  // output: 'export',
  images: {
    unoptimized: true, // Required for static export when we use it with Electron
  },
  // Only needed for local API in electron
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  env: {
    // Make sure environment variables are explicitly passed to the client if needed
    NEXT_PUBLIC_OPENAI_AVAILABLE: 'true',
  },
  // Enable experimental features that might help with API routes
  experimental: {
    serverComponentsExternalPackages: ['openai'],
  }
}

module.exports = nextConfig