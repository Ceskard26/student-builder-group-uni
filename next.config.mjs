/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Necesario en Next 14.x para que src/instrumentation.ts se ejecute.
    instrumentationHook: true,
  },
};

export default nextConfig;
