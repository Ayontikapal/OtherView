import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow image domains if necessary
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
