/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // :white_check_mark: Custom headers for all routes
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
  // :white_check_mark: Local dev proxy to avoid CORS/NAT/ngrok warnings
  async rewrites() {
    return process.env.NODE_ENV === "development"
      ? [
          {
            source: "/api/:path*",
            destination:
              "https://1209-2404-7c00-41-310a-6431-5f3b-7466-2bfc.ngrok-free.app/api/:path*", // local backend
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
