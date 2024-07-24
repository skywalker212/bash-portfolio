/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  redirects: async () => ([
    {
      source: '/infosys-equinox-studio',
      destination: 'https://www.infosysequinox.com/offerings/infosys-equinox-studio.html',
      permanent: true
    }
  ])
}

export default nextConfig;