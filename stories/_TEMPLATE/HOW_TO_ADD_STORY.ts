// ─────────────────────────────────────────────────────────
// NEW STORY TEMPLATE
// Copy this folder to: stories/PROJ-XX-your-story-name/
// Then fill in the 3 files below
// ─────────────────────────────────────────────────────────

// ── 1. pages/YourPage.ts ──────────────────────────────────
/*
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../../core/BasePage';

export class YourPage extends BasePage {
  readonly someButton: Locator;
  readonly someInput:  Locator;

  constructor(page: Page) {
    super(page);
    this.someButton = page.getByRole('button', { name: /submit/i });
    this.someInput  = page.getByPlaceholder(/enter value/i);
  }

  async goto() {
    await super.goto('/your-route');
  }

  async doSomeAction(value: string) {
    await this.fillField(this.someInput, value);
    await this.clickElement(this.someButton);
  }
}
*/

// ── 2. fixtures/your-story.data.ts ────────────────────────
/*
export const VALID_DATA = {
  example: 'value1',
};

export const INVALID_DATA = {
  empty:   '',
  tooLong: 'x'.repeat(300),
};
*/

// ── 3. specs/your-story.spec.ts ───────────────────────────
/*
import { test, expect } from '../../../core/BaseTest';
import { YourPage } from '../pages/YourPage';
import { VALID_DATA, INVALID_DATA } from '../fixtures/your-story.data';

const STORY = 'PROJ-XX | Your Story Title';

test.describe(`${STORY} @smoke @ui`, () => {

  let page: YourPage;
  test.beforeEach(async ({ page: p }) => {
    page = new YourPage(p);
    await page.goto();
  });

  test('TC-01 | Happy path description', async () => {
    await page.doSomeAction(VALID_DATA.example);
    await page.assertURL(/expected-route/);
  });

  test('TC-02 | Empty input shows error', async () => {
    await page.doSomeAction(INVALID_DATA.empty);
    const err = await page.getValidationError();
    expect(err).not.toBeNull();
  });
});
*/
