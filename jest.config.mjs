import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
  tsconfigPath: "./tsconfig.jest.json",
});

const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: [
    "**/__tests__/**/*.test.ts?(x)",
    "**/__tests__/**/*.spec.ts?(x)",
  ],
};

export default createJestConfig(config);
