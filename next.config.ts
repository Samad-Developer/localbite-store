// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // TODO: narrow this once you confirm your image host
      },
    ],
  },
};

export default nextConfig;