/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  
  // Enable source maps for debugging in development
  // Next.js automatically enables source maps in dev mode, but we can ensure they're enabled
  productionBrowserSourceMaps: false, // Only in dev, not production
  
  // For better source map support in development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Use eval-source-map for faster rebuilds and better source mapping
      config.devtool = 'eval-source-map';
    }
    return config;
  },
  
  // Output configuration (for standalone deployment)
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  
  // Image configuration
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'przio.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.przio.com',
        pathname: '/**',
      },
    ],
    // Allow local images from public folder
    unoptimized: false,
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
    ];
  },
}

module.exports = nextConfig
