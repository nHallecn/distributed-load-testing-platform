import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: [
    '@nestjs/common',
    '@nestjs/config',
    '@nestjs/core',
    '@nestjs/typeorm',
    'bullmq',
    'class-transformer',
    'class-validator',
    'ioredis',
    'pg',
    'typeorm',
  ],
};

export default nextConfig;
