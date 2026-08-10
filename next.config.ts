import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['lucide-react'],
  serverExternalPackages: ['@prisma/client', '.prisma/client', 'pg', '@prisma/adapter-pg'],
};

export default nextConfig;
