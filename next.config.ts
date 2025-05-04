import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
    LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,
  },
};

export default nextConfig;
