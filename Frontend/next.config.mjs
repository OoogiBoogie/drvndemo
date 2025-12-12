import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow cross-origin requests from ngrok during development
  allowedDevOrigins: ["drvn.ngrok.dev", "drvn.ngrok.io", "localhost:3000", "127.0.0.1:3000"],
  
  // External packages for server components (works with both webpack and turbopack)
  serverExternalPackages: ["pino-pretty", "lokijs", "encoding"],
  
  // Turbopack configuration
  turbopack: {
    // Explicitly set the root to silence multi-lockfile warnings
    root: __dirname,
    resolveAlias: {
      fs: { browser: "./empty-module.js" },
      path: { browser: "./empty-module.js" },
      os: { browser: "./empty-module.js" },
    },
  },
  
  // Webpack fallback (only used when not using Turbopack)
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    return config;
  },
  // Configure allowed image domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drvnlabo.mypinata.cloud",
        port: "",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  // Add CORS headers for all responses
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
