import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],

  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/migrations/**",
    "!src/types/**",
    "!src/server.ts",
  ],
  coverageDirectory: "coverage",
  clearMocks: true,
};

export default config;
