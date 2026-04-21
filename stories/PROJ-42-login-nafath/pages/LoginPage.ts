// Story  : CLONE - Login Via Nafath
// Extends: BasePage (universal framework)

import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../../core/BasePage';

export type UserType = 'Beneficiary' | 'Contractor' | 'Driver';

export class LoginPage extends BasePage {

  // Tabs
  readonly beneficiaryTab: Locator;
  readonly contractorTab:  Locator;
  readonly driverTab:      Locator;

  // Form
  readonly nationalIdInput:    Locator;
  readonly loginWithNafathBtn: Locator;

  // Post-login
  readonly verificationNumber: Locator;

  constructor(page: Page) {
    super(page);   // ← BasePage gives us all helpers for free
    this.beneficiaryTab    = page.getByRole('tab', { name: /beneficiary/i });
    this.contractorTab     = page.getByRole('tab', { name: /contractor/i });
    this.driverTab         = page.getByRole('tab', { name: /driver/i });
    this.nationalIdInput   = page.getByPlaceholder(/enter your id/i);
    this.loginWithNafathBtn = page.getByRole('button', { name: /login with nafath/i });
    this.verificationNumber = page.locator('[data-testid="verification-number"]');
  }

  async goto() {
    await super.goto('/login');
  }

  async selectUserType(type: UserType) {
    const tabs = {
      Beneficiary: this.beneficiaryTab,
      Contractor:  this.contractorTab,
      Driver:      this.driverTab,
    };
    await this.clickElement(tabs[type]);
  }

  async enterNationalId(id: string) {
    await this.fillField(this.nationalIdInput, id);
  }

  async submitLogin() {
    await this.clickElement(this.loginWithNafathBtn);
  }

  async login(type: UserType, id: string) {
    await this.selectUserType(type);
    await this.enterNationalId(id);
    await this.submitLogin();
  }

  async isTabActive(type: UserType): Promise<boolean> {
    const tab = { Beneficiary: this.beneficiaryTab, Contractor: this.contractorTab, Driver: this.driverTab }[type];
    const selected = await this.getAttribute(tab, 'aria-selected');
    const cls      = await this.getAttribute(tab, 'class');
    return selected === 'true' || (cls?.includes('active') ?? false);
  }
}
