// ─────────────────────────────────────────────────────────
// BaseTest — custom test fixtures
// Every test file imports { test, expect } from here
// instead of from @playwright/test directly
// ─────────────────────────────────────────────────────────

import { test as base, expect, Page } from '@playwright/test';
import { ApiClient } from './ApiClient';
import { ENV_CONFIG, CURRENT_ENV } from '../config/environments';

// Define what extra fixtures each test gets
type QAFixtures = {
  apiClient: ApiClient;
  storyId:   string;
};

export const test = base.extend<QAFixtures>({

  // Inject API client into every test automatically
  apiClient: async ({ request }, use) => {
    const client = new ApiClient(request, ENV_CONFIG.apiURL);
    await use(client);
  },

  // Provide a default storyId (override per test file)
  storyId: async ({}, use) => {
    await use('STORY-000');
  },
});

// Attach environment info to every test result
test.beforeEach(async ({}, testInfo) => {
  testInfo.annotations.push({
    type: 'Environment',
    description: CURRENT_ENV,
  });
});

// Auto-screenshot on failure
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const screenshot = await page.screenshot({ fullPage: true });
    await testInfo.attach('failure-screenshot', {
      body: screenshot,
      contentType: 'image/png',
    });
  }
});

export { expect };
export type { Page };
