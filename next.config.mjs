/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next.js 16 以降では experimental ではなくトップレベルの typedRoutes を使う
  typedRoutes: true,
  // ルートディレクトリをこのプロジェクトに固定して、
  // 親ディレクトリの lockfile に引っ張られないようにする
  // ES Modules 環境なので __dirname の代わりに process.cwd() を使う
  turbopack: {
    root: process.cwd()
  }
};

export default nextConfig;

