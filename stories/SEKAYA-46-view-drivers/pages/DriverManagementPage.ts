import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../../core/BasePage';

export class DriverManagementPage extends BasePage {
  readonly pageTitle: Locator;
  readonly addDriverBtn: Locator;
  readonly searchInput: Locator;
  readonly filterDropdown: Locator;
  readonly driverTable: Locator;
  readonly tableRows: Locator;
  readonly driverIDLink: Locator;
  readonly editBtn: Locator;
  readonly deleteBtn: Locator;
  readonly totalDriversStat: Locator;
  readonly assignedDriversStat: Locator;
  readonly nonAssignedDriversStat: Locator;
  readonly newDriversThisMonthStat: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('h1, h2').filter({ hasText: /Driver Management/i });
    this.addDriverBtn = page.getByRole('button', { name: /Add Driver/i });
    this.searchInput = page.locator('input[placeholder*="Search for a driver"]').first();
    this.filterDropdown = page.locator('button').filter({ hasText: /^All$/ });
    this.driverTable = page.getByRole('table');
    this.tableRows = page.getByRole('row');
    this.driverIDLink = page.getByText(/DR-\d+/).first();
    this.editBtn = page.getByRole('button', { name: /Edit/i });
    this.deleteBtn = page.getByRole('button', { name: /Delete/i });
    this.totalDriversStat = page.locator('article').filter({ hasText: /Total Drivers/ }).first();
    this.assignedDriversStat = page.locator('article').filter({ hasText: /Assigned Drivers/ }).first();
    this.nonAssignedDriversStat = page.locator('article').filter({ hasText: /Non-Assigned Drivers/ }).first();
    this.newDriversThisMonthStat = page.locator('article').filter({ hasText: /New Drivers This Month/ }).first();
  }

  async goto() {
    await super.goto('/contractor/drivers');
  }

  async searchDriver(driverName: string) {
    await this.waitForElement(this.searchInput);
    await this.fillField(this.searchInput, driverName);
    await this.getLocator('input[placeholder*="Search for a driver"]').first().press('Enter');
    await this.waitForPageLoad();
  }

  async filterByStatus(status: string) {
    await this.clickElement(this.filterDropdown);
    await this.delay(800);
    const option = this.getLocator('div, button, [role="option"]').filter({ hasText: new RegExp(`^${status}$`, 'i') }).first();
    await this.clickElement(option);
    await this.delay(500);
    await this.waitForPageLoad();
  }

  async clickDriverID(driverID: string) {
    const driverLink = this.getByText(driverID, true);
    await this.clickElement(driverLink);
    await this.waitForPageLoad();
  }

  async getDriverCount(): Promise<string> {
    const count = await this.totalDriversStat.getByRole('heading').textContent();
    return count || '';
  }

  async getTableRowCount(): Promise<number> {
    const rows = await this.tableRows.count();
    return rows - 1; // Exclude header row
  }

  async assertPageLoaded() {
    await this.waitForElement(this.pageTitle);
    await this.assertVisible(this.addDriverBtn);
    await this.assertVisible(this.searchInput);
    await this.assertVisible(this.driverTable);
  }
}
