import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['tsdav', 'node-ical'],
};

export default nextConfig;
