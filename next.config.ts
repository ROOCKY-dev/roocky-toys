import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enables standalone output for optimal VPS deployment (e.g., Docker or PM2)
  // Reduces the node_modules size to only what is strictly necessary.
  output: 'standalone',
  
  // Optimize images to save RAM & Bandwidth
  images: {
    unoptimized: true, // we'll use unoptimized unless we integrate an external image CDN to save server CPU
  },

  // experimental features for memory saving if needed
  experimental: {
    // optimizePackageImports: ['lucide-react', 'framer-motion'],
  }
};

export default nextConfig;
