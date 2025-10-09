// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {},
    },
  },
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://192.168.100.5:3000", // substitua pelo IP que aparece no terminal
  ],
};

export default nextConfig;
