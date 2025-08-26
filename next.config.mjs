/** @type {import('next').NextConfig} */
const nextConfig = {
  async generateBuildId() {
    // bikin ID unik setiap build
    return String(Date.now());
  },
};

export default nextConfig;
