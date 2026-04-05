import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.bstatic.com" },
      { protocol: "https", hostname: "**.travelapi.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
