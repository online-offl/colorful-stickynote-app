/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: 'build',
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true
  },
  swcMinify: false,
  productionBrowserSourceMaps: false,
  experimental: {
    forceSwcTransforms: true
  },
  generateBuildId: () => 'build',
  eslint: {
    ignoreDuringBuilds: true,
    ignoreDevelopment: true
  }
}

module.exports = nextConfig 