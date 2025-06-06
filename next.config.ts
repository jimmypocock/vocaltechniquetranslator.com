import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Note: Port configuration is handled via package.json scripts
  // Dev server runs on port 4062 via: npm run dev
  // Production server runs on port 4062 via: npm start
};

export default nextConfig;
