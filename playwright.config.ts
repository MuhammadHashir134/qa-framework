import { defineConfig, devices } from '@playwright/test';
import { ENV_CONFIG } from './config/environments';

export default defineConfig({
  testDir: './stories',
  testMatch: '**/*.spec.ts',
  timeout:       ENV_CONFIG.timeout,
  retries:       ENV_CONFIG.retries,

  // Single worker — one browser opens, all tests run sequentially inside it
  // Prevents multiple browser instances and reduces server load
  fullyParallel: false,
  workers:       1,

  expect: { timeout: 10_000 },

  reporter: [
    ['html',  { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }],
    ['list'],
  ],

  use: {
    baseURL:    ENV_CONFIG.baseURL,
    headless:   ENV_CONFIG.headless,
    screenshot: 'only-on-failure',
    video:      'retain-on-failure',
    trace:      'on-first-retry',
    locale:     'en-US',
    timezoneId: 'Asia/Riyadh',

    // Each test gets a completely isolated browser context
    // No shared state (cookies, localStorage) between tests
    contextOptions: {
      ignoreHTTPSErrors: true,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'api-only',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/*.api.spec.ts',
    },
  ],

  outputDir: 'test-results',
});
