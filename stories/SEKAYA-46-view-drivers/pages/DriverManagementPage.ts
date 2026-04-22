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
    this.pageTitle = page.getByText(/Driver Management/i);
    this.addDriverBtn = page.getByRole('button', { name: /Add Driver/i });
    this.searchInput = page.locator('input[placeholder*="Search"]');
    this.filterDropdown = page.getByRole('combobox').first();
    this.driverTable = page.getByRole('table');
    this.tableRows = page.getByRole('row');
    this.driverIDLink = page.getByRole('link').first();
    this.editBtn = page.getByRole('button', { name: /Edit/i });
    this.deleteBtn = page.getByRole('button', { name: /Delete/i });
    this.totalDriversStat = page.getByText(/Total Drivers/).locator('..');
    this.assignedDriversStat = page.getByText(/Assigned Drivers/).locator('..');
    this.nonAssignedDriversStat = page.getByText(/Non-Assigned Drivers/).locator('..');
    this.newDriversThisMonthStat = page.getByText(/New Drivers This Month/).locator('..');
  }

  async goto() {
    await super.goto('/contractor/drivers');
  }

  async searchDriver(driverName: string) {
    await this.waitForElement(this.searchInput);
    await this.fillField(this.searchInput, driverName);
    await this.page.keyboard.press('Enter');
    await this.waitForPageLoad();
  }

  async filterByStatus(status: string) {
    await this.filterDropdown.click();
    await this.page.getByRole('option', { name: status }).click();
    await this.waitForPageLoad();
  }

  async clickDriverID(driverID: string) {
    await this.page.getByText(driverID, { exact: true }).click();
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
