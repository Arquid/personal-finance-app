const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  webServer: [
    {
      // Runs the backend against the test database (same finance_test_db
      // used by server/tests), so E2E runs never touch dev data.
      command: "npx dotenv -e .env.test -- npm run dev",
      cwd: "../server",
      url: "http://localhost:4000/api/accounts",
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
    {
      command: "npm run dev",
      cwd: "../client",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
  ],
});