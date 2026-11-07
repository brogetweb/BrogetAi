import type { NextConfig } from "next";

// Same-origin /api/v1 on Vercel → proxy to EC2 HTTP API (avoids mixed content + bad sslip cert).
const apiUpstream = (process.env.API_UPSTREAM || "http://65.2.205.197").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiUpstream}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
