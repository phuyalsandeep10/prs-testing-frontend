/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  // :white_check_mark: Experimental features
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons"],
  },
  // :white_check_mark: Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // :white_check_mark: Performance and security optimizations
  poweredByHeader: false,
  compress: true,
  // Image optimization settings - enable with proper Sharp support
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Reduce resource hints that might cause preloading warnings
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
    ];
  },
  // API proxy for backend communication
  async rewrites() {
    return process.env.NODE_ENV === "development"
      ? [
          {
            source: "/api/:path*",
            destination:
              process.env.NEXT_PUBLIC_API_URL + "/api/:path*", // backend URL from env
          },
        ]
      : [];
  },
  // :white_check_mark: Ignore build issues (for dev only, not recommended in prod)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};
export default nextConfig;
