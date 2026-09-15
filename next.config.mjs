/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['node-ical', 'pg'],
  images: {
    domains: ['images.unsplash.com', 'upload.wikimedia.org'],
    unoptimized: false,
  },
};

export default nextConfig;
