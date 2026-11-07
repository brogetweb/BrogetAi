import type { NextConfig } from "next";

// Browser calls same-origin /api/v1 (HTTPS on Vercel). Next proxies to the EC2 API over HTTP
// so we don't need a valid public TLS cert on the Elastic IP for the web apps.
const apiUpstream = (process.env.API_UPSTREAM || "http://65.2.205.197").replace(/\/+$/, "");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  // Hide the floating DevTools badge in local UI (errors still show).
  devIndicators: false,
  poweredByHeader: false,
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
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // The agent panel and login are private: keep them out of search results.
      { source: "/(app|login)(.*)", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
