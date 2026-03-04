/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['ipfs.io'],
  },
  transpilePackages: ['@stacks/connect', '@stacks/connect-ui', '@stacks/connect-react'],
};

module.exports = nextConfig;
