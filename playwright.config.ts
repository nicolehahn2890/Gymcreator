import { defineConfig, devices } from '@playwright/test';

// In CI installiert der Workflow den passenden Chromium. Lokal/in der Sandbox kann ein vorhandener
// Chromium ueber PW_CHROMIUM_PATH genutzt werden (z. B. /opt/pw-browsers/chromium).
const executablePath = process.env.PW_CHROMIUM_PATH;
const launchOptions = executablePath ? { executablePath } : {};

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173/Gymcreator/',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'iphone-390', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, launchOptions } },
    { name: 'iphone-430', use: { ...devices['Desktop Chrome'], viewport: { width: 430, height: 932 }, launchOptions } },
  ],
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173/Gymcreator/',
    reuseExistingServer: !process.env.CI,
  },
});
