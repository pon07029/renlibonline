import type { NextConfig } from "next";

export function parseAllowedDevOrigins(value = process.env.NEXT_ALLOWED_DEV_ORIGINS): string[] {
  return value
    ? value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];
}

const nextConfig: NextConfig = {
  compress: true,
  allowedDevOrigins: parseAllowedDevOrigins(),
  async headers() {
    return [
      {
        source: "/sequences/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
