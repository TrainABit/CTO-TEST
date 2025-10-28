const isStaticExport = process.env.STATIC_EXPORT === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  images: {
    unoptimized: isStaticExport,
  },
};

if (isStaticExport) {
  nextConfig.output = 'export';
  nextConfig.trailingSlash = true;
}

module.exports = nextConfig;
