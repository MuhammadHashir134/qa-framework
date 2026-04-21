// ─────────────────────────────────────────────────────────
// WaitHelper — smart waits for any story
// ─────────────────────────────────────────────────────────

import { Page } from '@playwright/test';
import { TIMEOUTS } from '../config/constants';

export class WaitHelper {

  static async forPageLoad(page: Page) {
    await page.waitForLoadState('domcontentloaded');
  }

  static async forNetworkIdle(page: Page) {
    await page.waitForLoadState('networkidle');
  }

  static async forAPIResponse(page: Page, urlPattern: string | RegExp) {
    return page.waitForResponse(urlPattern, { timeout: TIMEOUTS.long });
  }

  static async forAPIRequest(page: Page, urlPattern: string | RegExp) {
    return page.waitForRequest(urlPattern, { timeout: TIMEOUTS.long });
  }

  static async forURL(page: Page, pattern: string | RegExp, timeout = TIMEOUTS.medium) {
    await page.waitForURL(pattern, { timeout });
  }

  static async forText(page: Page, text: string, timeout = TIMEOUTS.medium) {
    await page.waitForSelector(`text=${text}`, { timeout });
  }

  static async forSelector(page: Page, selector: string, timeout = TIMEOUTS.medium) {
    await page.waitForSelector(selector, { state: 'visible', timeout });
  }

  static async forSelectorHidden(page: Page, selector: string, timeout = TIMEOUTS.medium) {
    await page.waitForSelector(selector, { state: 'hidden', timeout });
  }

  static async forNavigation(page: Page) {
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long });
  }

  static async seconds(n: number) {
    await new Promise(resolve => setTimeout(resolve, n * 1000));
  }

  // Polls a condition until it returns true or timeout
  static async forCondition(
    condition: () => Promise<boolean>,
    timeout = TIMEOUTS.medium,
    interval = 500
  ): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await condition()) return;
      await WaitHelper.seconds(interval / 1000);
    }
    throw new Error(`Condition not met within ${timeout}ms`);
  }
}
