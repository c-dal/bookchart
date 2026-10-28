module.exports = {
  testEnvironment: "node",
  clearMocks: true,
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/app.js",
    "!src/server.js",
  ],
};