// ============================================================
// Story   : CLONE - Login Via Nafath  |  PROJ-42
// Tags    : @smoke @regression @ui
// Reporter: hashir.waheed
// ============================================================

import { test, expect } from '../../../core/BaseTest';
import { LoginPage } from '../pages/LoginPage';
import { VALID_IDS, INVALID_IDS } from '../fixtures/login.data';

const STORY = 'PROJ-42 | Login Via Nafath';

test.describe(`${STORY} — Tab behaviour @smoke @ui`, () => {

  let page: LoginPage;
  test.beforeEach(async ({ page: p }) => {
    page = new LoginPage(p);
    await page.goto();
  });

  test('TC-01 | Beneficiary tab is selected by default', async () => {
    expect(await page.isTabActive('Beneficiary')).toBe(true);
  });

  test('TC-02 | All 3 tabs are visible', async () => {
    await page.assertVisible(page.beneficiaryTab);
    await page.assertVisible(page.contractorTab);
    await page.assertVisible(page.driverTab);
  });

  for (const type of ['Beneficiary', 'Contractor', 'Driver'] as const) {
    test(`TC-03 | ${type} tab can be selected`, async () => {
      await page.selectUserType(type);
      expect(await page.isTabActive(type)).toBe(true);
    });
  }
});

test.describe(`${STORY} — Happy path @smoke @regression @ui`, () => {

  let page: LoginPage;
  test.beforeEach(async ({ page: p }) => {
    page = new LoginPage(p);
    await page.goto();
  });

  for (const [type, id] of Object.entries(VALID_IDS) as [string, string][]) {
    test(`TC-04 | ${type} login triggers Nafath verification`, async () => {
      const userType = (type.charAt(0).toUpperCase() + type.slice(1)) as 'Beneficiary' | 'Contractor' | 'Driver';
      await page.login(userType, id);
      await page.assertVisible(page.verificationNumber);
    });
  }
});

test.describe(`${STORY} — Validation @regression @ui`, () => {

  let page: LoginPage;
  test.beforeEach(async ({ page: p }) => {
    page = new LoginPage(p);
    await page.goto();
  });

  test('TC-05 | Empty ID shows validation error', async () => {
    await page.enterNationalId(INVALID_IDS.empty);
    await page.submitLogin();
    const err = await page.getValidationError();
    expect(err).not.toBeNull();
  });

  test('TC-06 | ID shorter than 10 digits shows error', async () => {
    await page.enterNationalId(INVALID_IDS.tooShort);
    await page.submitLogin();
    expect(await page.getValidationError()).not.toBeNull();
  });

  test('TC-07 | ID longer than 10 digits shows error', async () => {
    await page.enterNationalId(INVALID_IDS.tooLong);
    await page.submitLogin();
    expect(await page.getValidationError()).not.toBeNull();
  });

  test('TC-08 | Non-numeric ID shows error', async () => {
    await page.enterNationalId(INVALID_IDS.nonNumeric);
    await page.submitLogin();
    expect(await page.getValidationError()).not.toBeNull();
  });

  test('TC-09 | Special characters in ID shows error', async () => {
    await page.enterNationalId(INVALID_IDS.specialChars);
    await page.submitLogin();
    expect(await page.getValidationError()).not.toBeNull();
  });
});
