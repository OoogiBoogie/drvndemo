import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration for Replit environment
  // Replit serves the app through a proxy with dynamic domains (*.replit.dev, *.id.repl.co)
  // Host checking is disabled via HOSTNAME environment variable in package.json scripts
  
  // Allow all Replit dev origins to prevent chunk loading errors
  allowedDevOrigins: [
    '*.replit.dev',
    '*.riker.replit.dev', 
    '*.id.repl.co',
    '*.repl.co',
    '*.picard.replit.dev',
    '*.kirk.replit.dev',
    '*.janeway.replit.dev',
    '*.sisko.replit.dev',
    '*.archer.replit.dev',
    '*.pike.replit.dev',
  ],
  
  // External packages for server components (works with both webpack and turbopack)
  serverExternalPackages: ["pino-pretty", "lokijs", "encoding"],
  
  // Turbopack configuration
  turbopack: {
    // Explicitly set the root to silence multi-lockfile warnings
    root: __dirname,
    resolveAlias: {
      fs: { browser: './empty-module.js' },
      path: { browser: './empty-module.js' },
      os: { browser: './empty-module.js' },
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
        protocol: 'https',
        hostname: 'drvnlabo.mypinata.cloud',
        port: '',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  // Add CORS headers for all responses
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
