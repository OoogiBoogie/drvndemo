/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable host check for Replit proxy
  // Allow cross-origin requests from ngrok and Replit
  allowedDevOrigins: [
    'drvn.ngrok.dev',
    'drvn.ngrok.io',
    'localhost:3000',
    'localhost:5000',
    '127.0.0.1:3000',
    '127.0.0.1:5000',
    '0.0.0.0:5000'
  ],
  // Silence warnings
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    // Exclude Hardhat and contract files from webpack compilation
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    
    return config;
  },
  // Configure allowed image domains for IPFS
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drvnlabo.mypinata.cloud',
        port: '',
        pathname: '/ipfs/**',
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
