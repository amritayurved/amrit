import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/sapi/:path*",
        destination: "https://api.websitepublisher.ai/sapi/:path*",
      },
    ];
  },
};

export default nextConfig;
