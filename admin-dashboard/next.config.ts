import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external images from Unsplash (used in seed data)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
};

export default nextConfig;
