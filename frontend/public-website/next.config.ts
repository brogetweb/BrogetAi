import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/cibil", destination: "https://cibil.brogetai.com/", permanent: false },
      { source: "/services/payment-gateway", destination: "https://brogetpay.com/", permanent: false },
      { source: "/services/payment-link", destination: "https://brogetpay.com/", permanent: false },
      { source: "/services/payout", destination: "https://brogetpay.com/", permanent: false },
      { source: "/services/builder-ships", destination: "https://www.builderbroget.com/", permanent: false },
    ];
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
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
