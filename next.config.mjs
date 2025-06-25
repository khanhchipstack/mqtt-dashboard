/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // ✅ Đây là phần bạn cần thêm:
  watchOptions: {
    poll: 1000, // kiểm tra thay đổi mỗi 1 giây
    aggregateTimeout: 300,
  },
}

export default nextConfig
