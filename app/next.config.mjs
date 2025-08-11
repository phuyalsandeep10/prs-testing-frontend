/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  // :white_check_mark: Experimental features for better tree shaking
  experimental: {
    optimizePackageImports: [
      "@radix-ui/react-icons",
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "lucide-react",
      "chart.js",
      "date-fns",
      "zustand"
    ],
    // Enable better tree shaking
    swcMinify: true,
    // Optimize CSS imports
    optimizeCss: true,
  },
  // :white_check_mark: Compiler options for production optimization
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
    // Remove React DevTools in production
    reactRemoveProperties: process.env.NODE_ENV === "production",
    // Remove data-testid attributes in production
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // :white_check_mark: Webpack configuration for better tree shaking
  webpack: (config, { dev }) => {
    // Optimize for production builds
    if (!dev) {
      // Enable tree shaking for ES modules
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Split chunks more efficiently
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            chunks: 'all',
            enforce: true,
          },
          radixui: {
            test: /[\\/]node_modules[\\/]@radix-ui/,
            name: 'radix-ui',
            chunks: 'all',
            priority: 10,
          },
          tanstack: {
            test: /[\\/]node_modules[\\/]@tanstack/,
            name: 'tanstack',
            chunks: 'all',
            priority: 10,
          },
          charts: {
            test: /[\\/]node_modules[\\/](chart\.js|d3)/,
            name: 'charts',
            chunks: 'all',
            priority: 10,
          },
        },
      };
    }
    
    return config;
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
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
    ],
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
  // API proxy for backend communication - exclude NextAuth routes
  async rewrites() {
    return process.env.NODE_ENV === "development"
      ? [
          {
            source: "/api/((?!auth).*)",
            destination:
              process.env.NEXT_PUBLIC_API_URL + "/:match*", // backend URL from env
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
