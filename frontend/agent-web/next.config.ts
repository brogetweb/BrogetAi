import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the floating DevTools badge in local UI (errors still show).
  devIndicators: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
