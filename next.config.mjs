'use strict'
import nrExternals from '@newrelic/next/load-externals.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['newrelic']
  },
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    nrExternals(config)
    return config
  }
}

export default nextConfig;