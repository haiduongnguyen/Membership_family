import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3010",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npx next dev -p 3010",
    url: "http://localhost:3010",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
