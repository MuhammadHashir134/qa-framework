import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../../core/BasePage';

export class DriverManagementPage extends BasePage {
  readonly pageTitle: Locator;
  readonly addDriverBtn: Locator;
  readonly searchInput: Locator;
  readonly filterDropdown: Locator;
  readonly driverTable: Locator;
  readonly tableBodyRows: Locator;
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
    this.filterDropdown = page.locator('button[aria-haspopup="true"]').filter({ hasText: 'All' }).first();
    this.driverTable = page.getByRole('table');
    this.tableBodyRows = page.locator('table tbody tr');
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
    await this.searchInput.clear();
    await this.searchInput.fill(driverName);
    await this.delay(300);
    await this.searchInput.press('Enter');
    await this.delay(1000);
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

  async clickDriverID(employeeID: string) {
    const driverRow = this.getLocator(`table tbody tr`).filter({ hasText: employeeID }).first();
    const driverNameCell = driverRow.locator('td').first();
    await this.clickElement(driverNameCell);
    await this.waitForPageLoad();
  }

  async getDriverCount(): Promise<string> {
    const count = await this.totalDriversStat.getByRole('heading').textContent();
    return count || '';
  }

  async getTableRowCount(): Promise<number> {
    const rows = await this.tableBodyRows.count();
    return rows; // tbody rows don't include header
  }

  async assertPageLoaded() {
    await this.waitForElement(this.pageTitle);
    await this.assertVisible(this.addDriverBtn);
    await this.assertVisible(this.searchInput);
    await this.assertVisible(this.driverTable);
  }
}
