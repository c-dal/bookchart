module.exports = {
  testEnvironment: "node",
  clearMocks: true,
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/app.js",
    "!src/server.js"
  ]
};