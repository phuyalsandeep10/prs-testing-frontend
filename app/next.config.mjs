/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  // Reduce font preloading warnings
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Additional performance optimizations
  poweredByHeader: false,
  compress: true,
  // Reduce resource hints that might cause preloading warnings
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ],
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
