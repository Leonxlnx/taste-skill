import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@react-three/drei$": path.resolve(process.cwd(), "lib/three-drei-bridge.ts"),
      "victory-vendor/d3-scale": "d3-scale",
      "victory-vendor/d3-shape": "d3-shape",
    };
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      ".js": [".ts", ".tsx", ".js"],
      ".jsx": [".tsx", ".jsx"],
    };
    config.resolve.preferRelative = true;
    return config;
  },
};

export default nextConfig;
