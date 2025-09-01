import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
    output: 'export',
    webpack: (config) => {
        config.resolve.alias = {
            ...(config.resolve.alias || {}),
            '@': path.resolve(__dirname, 'src'),
            '@public': path.resolve(__dirname, 'public'),
        };
        return config;
    },
};

export default nextConfig;