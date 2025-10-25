import nextPlugin from "@next/eslint-plugin-next";

const config = [
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];

export default config;
