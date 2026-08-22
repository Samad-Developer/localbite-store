import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    qualities: [75, 90],
  },
  experimental: {
    serverComponentsHmrCache: false,
  },
};

export default nextConfig;
