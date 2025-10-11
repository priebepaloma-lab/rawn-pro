// next.config.mjs — RAWN PRO ⚡ Configuração PWA + Turbopack (Next.js 15)
// -------------------------------------------------------
// Configuração otimizada para performance, cache, segurança e suporte PWA.

import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ Otimizações gerais
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,

  // ✅ Configurações de imagens (caso use <Image /> futuramente)
  images: {
    unoptimized: true, // evita build com otimização automática
    formats: ["image/avif", "image/webp"],
  },

  // ✅ Cabeçalhos de segurança e cache
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  // ✅ Regras de cache específicas para o Service Worker e manifest
  async rewrites() {
    return [
      { source: "/service-worker.js", destination: "/service-worker.js" },
      { source: "/manifest.json", destination: "/manifest.json" },
    ];
  },

  // ✅ Compatibilidade local e deploy
  env: {
    NEXT_PUBLIC_APP_NAME: "RAWN PRO",
    NEXT_PUBLIC_VERSION: "1.0.0",
  },

  // ✅ Novo formato Turbopack (substitui experimental.turbo)
  turbopack: {
    rules: {},
  },

  // ✅ Permitir desenvolvimento em rede local
  allowedDevOrigins: ["http://192.168.100.5:3000"],

  // ✅ Saída standalone (ótimo para builds no Vercel)
  output: "standalone",
};

export default nextConfig;
