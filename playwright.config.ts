import { defineConfig, devices } from '@playwright/test';

// Browser: PW_CHROMIUM_PATH (vorhandener Chromium, z. B. /opt/pw-browsers/chromium in der Sandbox),
// sonst PW_CHANNEL (in CI "chrome": das vorinstallierte Chrome des Runners, spart die Installation),
// sonst der von Playwright installierte Chromium.
const executablePath = process.env.PW_CHROMIUM_PATH;
const channel = process.env.PW_CHANNEL;
const launchOptions = executablePath ? { executablePath } : channel ? { channel } : {};

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
