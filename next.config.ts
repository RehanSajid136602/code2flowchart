import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix for monorepo/multi-lockfile situations where Next picks the wrong root
  // and therefore does not load the correct .env.local.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
