import type { NextConfig } from 'next';

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/app-build-manifest\.json$/],
  publicExcludes: ['!noprecache/**/*'],
});

const nextConfig: NextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/**',
      },
      {
        protocol: 'https',
        hostname: '*.firebasestorage.app',
        port: '',
        pathname: '/v0/b/**',
      },
    ],
  },
  eslint: {
    // 未使用変数をエラーレベルに設定
    dirs: ['src'],
  },
};

export default withPWA(nextConfig);
