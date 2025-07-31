import type { NextConfig } from 'next';

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
    ],
  },
  eslint: {
    // 未使用変数をエラーレベルに設定
    dirs: ['src'],
  },
};

export default nextConfig;
