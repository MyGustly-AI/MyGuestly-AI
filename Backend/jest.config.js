export default {
  rootDir: ".",
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  setupFiles: ["<rootDir>/tests/setup.js"],
  transform: {},
  moduleFileExtensions: ["js", "mjs"],
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,
  testTimeout: 10000,
  verbose: true,
};
