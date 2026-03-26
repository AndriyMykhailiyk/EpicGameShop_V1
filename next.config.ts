import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".next",

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.icons8.com",
      },
      {
        protocol: "https",
        hostname: "assets-prd.ignimgs.com",
      },
      {
        protocol: "https",
        hostname: "*.ignimgs.com",
      },
      {
        protocol: "https",
        hostname: "www.topgames.com",
      },
      {
        protocol: "https",
        hostname: "*.topgames.com",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@reduxjs/toolkit",
      "framer-motion",
    ],
  },
};

export default nextConfig;
