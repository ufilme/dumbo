/** @type {import('next').NextConfig} */
const nextConfig = {
    compiler: {
        styledComponents: true
    },
    output: 'standalone',
    distDir: 'build',
};

export default nextConfig;
