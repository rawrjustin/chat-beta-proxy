/** @type {import('next').NextConfig} */
const ESLintPlugin = require('eslint-webpack-plugin');
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    if (dev) {
      // Add the Case Sensitive Paths plugin
      const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
      config.plugins.push(new CaseSensitivePathsPlugin());

      config.plugins.push(
        new ESLintPlugin({
          emitError: false,
          failOnError: false,
        }),
      );
    }
    return config;
  },
  typescript: {
    /*
     Temporarily disable type check for build
     Dangerously allow production builds to successfully complete even if
     your project has type errors.
     Remove this config after finish WAR-1732
     */
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/users',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
