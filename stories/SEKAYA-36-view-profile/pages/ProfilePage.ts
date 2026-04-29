import { Page } from '@playwright/test';
import { BasePage } from '../../../core/BasePage';

export class ProfilePage extends BasePage {
  readonly personalInfoSection = this.page.getByText('Personal Information');
  readonly companyDataSection   = this.page.getByText('Company Data');
  readonly editButton           = this.page.getByRole('button', { name: /Edit/i });

  readonly nameLabel       = this.page.getByText('Name',                              { exact: true });
  readonly nationalIdLabel = this.page.getByText('National ID / Residence Number',    { exact: true });
  readonly phoneLabel      = this.page.getByText('Phone Number',                      { exact: true });
  readonly emailLabel      = this.page.getByText('Email',                             { exact: true });
  readonly crLabel         = this.page.getByText('Commercial Registration Number',    { exact: true });
  readonly taxLabel        = this.page.getByText('Tax Number',                        { exact: true });
  readonly ministryLabel   = this.page.getByText('Ministry Number',                   { exact: true });

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/contractor/settings');
    await this.switchToEnglishIfNeeded();
    await this.page.waitForLoadState('networkidle');
  }

  async assertPageLoaded() {
    await this.assertURL(/\/contractor\/settings/);
    await this.assertVisible(this.personalInfoSection);
  }

  private async getValueByLabel(labelText: string): Promise<string> {
    const container = this.page.locator('div').filter({
      has: this.page.getByText(labelText, { exact: true }),
    }).last();
    const full = await container.textContent() || '';
    return full.replace(labelText, '').trim();
  }

  async getNameValue():       Promise<string> { return this.getValueByLabel('Name'); }
  async getNationalIdValue(): Promise<string> { return this.getValueByLabel('National ID / Residence Number'); }
  async getPhoneValue():      Promise<string> { return this.getValueByLabel('Phone Number'); }
  async getEmailValue():      Promise<string> { return this.getValueByLabel('Email'); }
  async getCRValue():         Promise<string> { return this.getValueByLabel('Commercial Registration Number'); }
  async getTaxValue():        Promise<string> { return this.getValueByLabel('Tax Number'); }
  async getMinistryValue():   Promise<string> { return this.getValueByLabel('Ministry Number'); }

  async getCurrentURL(): Promise<string> { return this.page.url(); }

  async navigateTo(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async refreshPage() {
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
  }

  async clickEditButton() {
    await this.editButton.click();
    await this.delay(500);
  }
}
