import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
    ],
    unoptimized: true,
  },
  // ✅ Tambahkan untuk production
  output: 'standalone', // Optimasi deployment
  poweredByHeader: false, // Security: hide X-Powered-By
};

export default nextConfig;