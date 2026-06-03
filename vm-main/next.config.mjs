/** @type {import('next').NextConfig} */
const hostImage = process.env.NEXT_PUBLIC_HOST_IMAGE;
const config = {
    eslint: {
        // Lint errors are style-level and should not block a production deploy on Vercel.
        ignoreDuringBuilds: true,
    },
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost'
            },
            ...(hostImage ? [{
                protocol: 'https',
                hostname: hostImage
            }] : [])
        ],
    },
};

export default config;
