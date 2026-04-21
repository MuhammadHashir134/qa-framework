// Story  : Contractor Login Via Nafath  |  PROJ-44
// Route  : /contractor/login
// Extends: BasePage (universal framework)

import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../../core/BasePage';

export class ContractorLoginPage extends BasePage {

  // ── Form ───────────────────────────────────────────────────────────────────
  readonly nationalIdInput:  Locator;
  readonly loginViaNafathBtn: Locator;

  // ── Utility ────────────────────────────────────────────────────────────────
  readonly needHelpLink:      Locator;
  readonly languageToggle:    Locator;

  // ── Post-login ─────────────────────────────────────────────────────────────
  readonly postLoginIndicator: Locator;

  constructor(page: Page) {
    super(page);

    this.nationalIdInput    = page.locator('input').first();
    this.loginViaNafathBtn  = page.getByRole('button', { name: /login via nafath/i });
    this.needHelpLink       = page.getByRole('link',   { name: /need help/i });
    this.languageToggle     = page.getByRole('button', { name: /عربي|english/i });
    this.postLoginIndicator = page.getByText(/personal information/i).first();
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  async goto() {
    await super.goto('/contractor/login');
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  async enterNationalId(id: string) {
    await this.fillField(this.nationalIdInput, id);
  }

  async submitLogin() {
    await this.clickElement(this.loginViaNafathBtn);
  }

  async login(nationalId: string) {
    await this.enterNationalId(nationalId);
    await this.submitLogin();
  }
}
