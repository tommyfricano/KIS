import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // For GitHub Pages deployment with repository name
  basePath: process.env.NODE_ENV === 'production' ? '/KIS' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/KIS' : '',
};

export default nextConfig;
