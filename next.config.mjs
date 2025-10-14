/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // Nova sintaxe para server actions (sem boolean)
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  images: {
    domains: ["raw.githubusercontent.com", "vercel.app"],
  },
  eslint: {
    // Use ESLint CLI separately; avoid Next's deprecated lint wrapper during build
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        // Security headers for all routes
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://api.openai.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:",
          },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
        ],
      },
      {
        // Long cache for static assets under /assets
        source: "/assets/:all*(svg|png|jpg|jpeg|webp|gif|ico)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Long cache for common static file types at root
        source: "/:all*(svg|png|jpg|jpeg|webp|gif|ico|css|js|woff|woff2|ttf|otf)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Short cache for manifest
        source: "/manifest.json",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      {
        // Ensure SW always revalidates
        source: "/service-worker.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
