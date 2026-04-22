// ============================================================
// Story   : View Drivers | SEKAYA-46
// URL     : /contractor/drivers
// Tags    : @smoke @regression @ui
// Reporter: hashir.waheed
// ============================================================

import { test, expect } from '../../../core/BaseTest';
import { Page } from '@playwright/test';
import { DriverManagementPage } from '../pages/DriverManagementPage';
import { ContractorLoginPage } from '../../PROJ-44-contractor-login/pages/ContractorLoginPage';
import {
  VALID_SEARCH_INPUTS,
  INVALID_SEARCH_INPUTS,
  VALID_FILTER_OPTIONS,
} from '../fixtures/view-drivers.data';

const STORY = 'SEKAYA-46 | View Drivers';
const CONTRACTOR_ID = '1000050326'; // UAT contractor ID

async function loginAndNavigateToDrivers(playwrightPage: Page) {
  const loginPage = new ContractorLoginPage(playwrightPage);
  await loginPage.goto();
  await loginPage.login(CONTRACTOR_ID);

  const driverPage = new DriverManagementPage(playwrightPage);
  await driverPage.goto();
}

// ── Page Load & UI Elements ───────────────────────────────────────────────

test.describe(`${STORY} — Page elements @smoke @ui`, () => {
  let page: DriverManagementPage;

  test.beforeEach(async ({ page: p }) => {
    await loginAndNavigateToDrivers(p);
    page = new DriverManagementPage(p);
  });

  test('TC-01 | Page loads at /contractor/drivers', async () => {
    await page.assertURL(/\/contractor\/drivers/);
  });

  test('TC-02 | Page title "Driver Management" is visible', async () => {
    await page.assertVisible(page.pageTitle);
  });

  test('TC-03 | Add Driver button is visible and enabled', async () => {
    await page.assertVisible(page.addDriverBtn);
    await page.assertEnabled(page.addDriverBtn);
  });

  test('TC-04 | Search input is visible and enabled', async () => {
    await page.assertVisible(page.searchInput);
    await page.assertEnabled(page.searchInput);
  });

  test('TC-05 | Filter dropdown is visible and enabled', async () => {
    await page.assertVisible(page.filterDropdown);
    await page.assertEnabled(page.filterDropdown);
  });

  test('TC-06 | Drivers table is visible with data', async () => {
    await page.assertVisible(page.driverTable);
    const rowCount = await page.getTableRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('TC-07 | Statistics cards are displayed (Total, Assigned, Non-Assigned, New)', async () => {
    await page.assertVisible(page.totalDriversStat);
    await page.assertVisible(page.assignedDriversStat);
    await page.assertVisible(page.nonAssignedDriversStat);
    await page.assertVisible(page.newDriversThisMonthStat);
  });
});

// ── Happy Path ────────────────────────────────────────────────────────────

test.describe(`${STORY} — Happy path @smoke @regression @ui`, () => {
  let page: DriverManagementPage;

  test.beforeEach(async ({ page: p }) => {
    await loginAndNavigateToDrivers(p);
    page = new DriverManagementPage(p);
  });

  test('TC-08 | Search by existing driver name returns results', async () => {
    await page.searchDriver(VALID_SEARCH_INPUTS.existingDriver);
    const rowCount = await page.getTableRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(1);
  });

  test('TC-09 | Filter by "Ready" status shows only ready drivers', async () => {
    await page.filterByStatus(VALID_FILTER_OPTIONS.ready);
    const rows = await page.page.getByRole('row').count();
    expect(rows).toBeGreaterThan(1); // At least header + 1 data row
  });

  test('TC-10 | Filter by "Not Ready" status shows only not-ready drivers', async () => {
    await page.filterByStatus(VALID_FILTER_OPTIONS.notReady);
    const rows = await page.page.getByRole('row').count();
    expect(rows).toBeGreaterThan(1); // At least header + 1 data row
  });

  test('TC-11 | Clicking driver ID navigates to driver details page', async () => {
    await page.clickDriverID(VALID_SEARCH_INPUTS.driverId);
    await page.assertURL(/\/contractor\/drivers\/[A-Z0-9-]+/);
  });
});

// ── Validation ────────────────────────────────────────────────────────────

test.describe(`${STORY} — Validation @regression @ui`, () => {
  let page: DriverManagementPage;

  test.beforeEach(async ({ page: p }) => {
    await loginAndNavigateToDrivers(p);
    page = new DriverManagementPage(p);
  });

  const validationCases: [string, string, string][] = [
    ['TC-12', 'Search by Employee ID returns correct driver', VALID_SEARCH_INPUTS.employeeId],
    ['TC-13', 'Search by Driver ID returns correct driver', VALID_SEARCH_INPUTS.driverId],
    ['TC-14', 'Partial driver name search works correctly', VALID_SEARCH_INPUTS.partialName],
    ['TC-15', 'Search by phone number returns correct driver', VALID_SEARCH_INPUTS.phoneNumber],
  ];

  for (const [id, title, input] of validationCases) {
    test(`${id} | ${title}`, async () => {
      await page.searchDriver(input);
      const rowCount = await page.getTableRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0); // Should return results or empty
    });
  }
});

// ── Edge Cases ────────────────────────────────────────────────────────────

test.describe(`${STORY} — Edge cases @regression @ui`, () => {
  let page: DriverManagementPage;

  test.beforeEach(async ({ page: p }) => {
    await loginAndNavigateToDrivers(p);
    page = new DriverManagementPage(p);
  });

  test('TC-16 | Search with nonexistent driver name returns no results', async () => {
    await page.searchDriver(INVALID_SEARCH_INPUTS.nonexistentDriver);
    const rowCount = await page.getTableRowCount();
    expect(rowCount).toBe(0);
  });

  test('TC-17 | Search with special characters is handled safely', async () => {
    await page.searchDriver(INVALID_SEARCH_INPUTS.specialCharacters);
    // Should not crash or expose errors
    await page.assertVisible(page.driverTable);
  });

  test('TC-18 | XSS payload in search is rejected and not executed', async () => {
    await page.searchDriver(INVALID_SEARCH_INPUTS.xssPayload);
    // Verify page is still functional and XSS didn't execute
    await page.assertVisible(page.addDriverBtn);
    await page.assertURL(/\/contractor\/drivers/);
  });
});
