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
  ],
};

export default nextConfig;
