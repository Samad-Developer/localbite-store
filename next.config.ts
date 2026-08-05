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
        qualities: [75, 90], // add this line

  },
};

export default nextConfig;