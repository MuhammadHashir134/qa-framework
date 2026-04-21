// ─────────────────────────────────────────────────────────
// BasePage — every Page Object extends this class
// Provides: navigation, waits, assertions, screenshots
// ─────────────────────────────────────────────────────────

import { Page, Locator, expect } from '@playwright/test';
import { TIMEOUTS } from '../config/constants';

export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ── Navigation ─────────────────────────────────────────

  async goto(path: string = '/') {
    await this.page.goto(path);
    await this.waitForPageLoad();
    await this.switchToEnglishIfNeeded();
  }

  async switchToEnglishIfNeeded() {
    const engBtn = this.page.getByRole('button', { name: /^en$/i });
    try {
      await engBtn.waitFor({ state: 'visible', timeout: 3000 });
      await engBtn.click();
      await this.waitForPageLoad();
    } catch {
      // already in English or button not present
    }
  }

  async reload() {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  async goBack() {
    await this.page.goBack();
  }

  async getCurrentURL(): Promise<string> {
    return this.page.url();
  }

  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  // ── Waits ──────────────────────────────────────────────

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForElement(locator: Locator, timeout = TIMEOUTS.medium) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async waitForElementToDisappear(locator: Locator, timeout = TIMEOUTS.medium) {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  async waitForURL(urlPattern: string | RegExp, timeout = TIMEOUTS.medium) {
    await this.page.waitForURL(urlPattern, { timeout });
  }

  async waitSeconds(seconds: number) {
    await this.page.waitForTimeout(seconds * 1000);
  }

  // ── Interactions ───────────────────────────────────────

  async clickElement(locator: Locator) {
    await this.waitForElement(locator);
    await locator.click();
  }

  async fillField(locator: Locator, value: string) {
    await this.waitForElement(locator);
    await locator.click();
    const inputType = await locator.evaluate((el: any) => el.type);
    if (inputType === 'number') {
      await locator.evaluate((el: any, val: string) => {
        el.value = val;
        el.dispatchEvent(new Event('input',  { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, value);
    } else {
      await locator.clear();
      await locator.fill(value);
    }
  }

  async selectDropdown(locator: Locator, value: string) {
    await this.waitForElement(locator);
    await locator.selectOption(value);
  }

  async uploadFile(locator: Locator, filePath: string) {
    await locator.setInputFiles(filePath);
  }

  async scrollToElement(locator: Locator) {
    await locator.scrollIntoViewIfNeeded();
  }

  async hoverElement(locator: Locator) {
    await locator.hover();
  }

  async clearField(locator: Locator) {
    await locator.clear();
  }

  // ── Assertions ─────────────────────────────────────────

  async assertVisible(locator: Locator, message?: string) {
    await expect(locator, message).toBeVisible();
  }

  async assertHidden(locator: Locator, message?: string) {
    await expect(locator, message).toBeHidden();
  }

  async assertEnabled(locator: Locator, message?: string) {
    await expect(locator, message).toBeEnabled();
  }

  async assertDisabled(locator: Locator, message?: string) {
    await expect(locator, message).toBeDisabled();
  }

  async assertText(locator: Locator, text: string | RegExp) {
    await expect(locator).toHaveText(text);
  }

  async assertContainsText(locator: Locator, text: string) {
    await expect(locator).toContainText(text);
  }

  async assertValue(locator: Locator, value: string) {
    await expect(locator).toHaveValue(value);
  }

  async assertURL(urlPattern: string | RegExp) {
    await expect(this.page).toHaveURL(urlPattern);
  }

  async assertTitle(titlePattern: string | RegExp) {
    await expect(this.page).toHaveTitle(titlePattern);
  }

  async assertCount(locator: Locator, count: number) {
    await expect(locator).toHaveCount(count);
  }

  async assertChecked(locator: Locator) {
    await expect(locator).toBeChecked();
  }

  async assertNotChecked(locator: Locator) {
    await expect(locator).not.toBeChecked();
  }

  // ── Getters ────────────────────────────────────────────

  async getText(locator: Locator): Promise<string> {
    return (await locator.textContent()) ?? '';
  }

  async getValue(locator: Locator): Promise<string> {
    return locator.inputValue();
  }

  async getAttribute(locator: Locator, attr: string): Promise<string | null> {
    return locator.getAttribute(attr);
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  async isEnabled(locator: Locator): Promise<boolean> {
    return locator.isEnabled();
  }

  async getCount(locator: Locator): Promise<number> {
    return locator.count();
  }

  // ── Utilities ──────────────────────────────────────────

  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  async getValidationError(selector = '[role="alert"], .error-message, .field-error, [data-testid*="error"], .text-red-500, .text-red-600, .text-red-700, .invalid-feedback, p.error, span.error, .mat-error, .validation-error, small.text-danger'): Promise<string | null> {
    try {
      const el = this.page.locator(selector).first();
      await el.waitFor({ timeout: TIMEOUTS.short });
      return el.textContent();
    } catch {
      return null;
    }
  }

  async getToastMessage(selector = '[role="status"], .toast, [data-testid*="toast"], .notification'): Promise<string | null> {
    try {
      const el = this.page.locator(selector).first();
      await el.waitFor({ timeout: TIMEOUTS.medium });
      return el.textContent();
    } catch {
      return null;
    }
  }

  async dismissModal(selector = '[data-testid="modal-close"], .modal-close, [aria-label="Close"]') {
    const btn = this.page.locator(selector).first();
    if (await btn.isVisible()) await btn.click();
  }

  async acceptDialog() {
    this.page.once('dialog', dialog => dialog.accept());
  }

  async dismissDialog() {
    this.page.once('dialog', dialog => dialog.dismiss());
  }
}
