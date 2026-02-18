import type { NextConfig } from "next";
import { config } from "dotenv";
import { resolve } from "path";

// 루트 .env 파일 로드
config({ path: resolve(__dirname, "../.env") });

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
};

export default nextConfig;
