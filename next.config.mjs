/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Allow importing of WebAssembly files
    config.experiments = { asyncWebAssembly: true, layers: true };
    return config;
  },
  reactStrictMode: true,
  swcMinify: true,
}

export default nextConfig;