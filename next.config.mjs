/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/hang-over',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}
export default nextConfig
