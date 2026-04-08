import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@pxlkit/core',
    '@pxlkit/gamification',
    '@pxlkit/feedback',
    '@pxlkit/social',
    '@pxlkit/weather',
    '@pxlkit/effects',
    '@pxlkit/ui',
    '@pxlkit/voxel',
  ],
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
