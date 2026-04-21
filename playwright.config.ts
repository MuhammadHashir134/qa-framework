import { defineConfig, devices } from '@playwright/test';
import { ENV_CONFIG } from './config/environments';

export default defineConfig({
  testDir: './stories',
  testMatch: '**/*.spec.ts',
  timeout:       ENV_CONFIG.timeout,
  retries:       ENV_CONFIG.retries,
  fullyParallel: false,
  workers:       2,

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
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'api-only',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/*.api.spec.ts',
    },
  ],

  outputDir: 'test-results',
});
