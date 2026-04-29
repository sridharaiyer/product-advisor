import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [
    {
      name: "light-theme",
      use: { colorScheme: "light", browserName: "chromium" },
    },
    {
      name: "dark-theme",
      use: { colorScheme: "dark", browserName: "chromium" },
    },
  ],
});
