/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    // Completely remove all minimizers that could cause issues
    if (!dev && !isServer) {
      config.optimization.minimizer = [];
      config.optimization.minimize = false;
    }

    // Also handle any worker files specifically
    config.module.rules.push({
      test: /HeartbeatWorker\.js$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/workers/[name].[hash][ext]',
      },
    });

    return config;
  },

  // Disable all minification to avoid the issue
  swcMinify: false,

  // Additional safety measures
  experimental: {
    esmExternals: 'loose',
  },

  // Ensure proper handling of static files
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
};

export default nextConfig;
