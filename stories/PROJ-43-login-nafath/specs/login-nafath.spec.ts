// ============================================================
// Story   : Beneficiary Login Via Nafath  |  PROJ-43
// URL     : /beneficiary/login
// Tags    : @smoke @regression @ui
// Reporter: hashir.waheed
// ============================================================

import { test, expect } from '../../../core/BaseTest';
import { LoginPage } from '../pages/LoginPage';
import { VALID_IDS, INVALID_IDS } from '../fixtures/login-nafath.data';

const STORY = 'PROJ-43 | Beneficiary Login Via Nafath';

// ── Page load & UI elements ───────────────────────────────────────────────

test.describe(`${STORY} — Page elements @smoke @ui`, () => {

  let page: LoginPage;
  test.beforeEach(async ({ page: p }) => {
    page = new LoginPage(p);
    await page.goto();
  });

  test('TC-01 | Page loads at /beneficiary/login', async () => {
    await page.assertURL(/\/beneficiary\/login/);
  });

  test('TC-02 | National ID input is visible and enabled', async () => {
    await page.assertVisible(page.nationalIdInput);
    await page.assertEnabled(page.nationalIdInput);
  });

  test('TC-03 | Login via Nafath button is visible and enabled', async () => {
    await page.assertVisible(page.loginViaNafathBtn);
    await page.assertEnabled(page.loginViaNafathBtn);
  });

  test('TC-04 | Need help link is visible', async () => {
    await page.assertVisible(page.needHelpLink);
  });

  test('TC-05 | Language toggle is visible', async () => {
    await page.assertVisible(page.languageToggle);
  });

});

// ── Happy path ────────────────────────────────────────────────────────────

test.describe(`${STORY} — Happy path @smoke @regression @ui`, () => {

  let page: LoginPage;
  test.beforeEach(async ({ page: p }) => {
    page = new LoginPage(p);
    await page.goto();
  });

  test('TC-06 | Valid 10-digit ID logs in successfully', async () => {
    await page.login(VALID_IDS.standard);
    await page.assertVisible(page.postLoginIndicator);
  });

  test('TC-07 | Same valid ID accepted on repeat login', async () => {
    await page.login(VALID_IDS.leadingZero);
    await page.assertVisible(page.postLoginIndicator);
  });

});

// ── Validation ────────────────────────────────────────────────────────────

test.describe(`${STORY} — Validation @regression @ui`, () => {

  let page: LoginPage;
  test.beforeEach(async ({ page: p }) => {
    page = new LoginPage(p);
    await page.goto();
  });

  const cases: [string, string, string][] = [
    ['TC-08', 'Empty ID shows validation error',           INVALID_IDS.empty],
    ['TC-09', '9-digit ID (too short) shows error',        INVALID_IDS.tooShort],
    ['TC-10', '11-digit ID (too long) shows error',        INVALID_IDS.tooLong],
    ['TC-11', 'Alphabetic ID shows error',                 INVALID_IDS.allAlpha],
    ['TC-12', 'Mixed alphanumeric ID shows error',         INVALID_IDS.alphanumeric],
    ['TC-13', 'ID with hyphens shows error',               INVALID_IDS.withHyphens],
    ['TC-14', 'ID with spaces shows error',                INVALID_IDS.withSpaces],
    ['TC-15', 'Whitespace-only input shows error',         INVALID_IDS.whitespaceOnly],
  ];

  for (const [id, title, input] of cases) {
    test(`${id} | ${title}`, async () => {
      await page.enterNationalId(input);
      await page.submitLogin();
      expect(await page.getValidationError()).not.toBeNull();
    });
  }

});

// ── Edge cases ────────────────────────────────────────────────────────────

test.describe(`${STORY} — Edge cases @regression @ui`, () => {

  let page: LoginPage;
  test.beforeEach(async ({ page: p }) => {
    page = new LoginPage(p);
    await page.goto();
  });

  test('TC-16 | SQL injection is rejected — stays on login page', async () => {
    await page.enterNationalId(INVALID_IDS.sqlInjection);
    await page.submitLogin();
    expect(await page.getValidationError()).not.toBeNull();
    await page.assertURL(/\/beneficiary\/login/);
  });

  test('TC-17 | XSS payload is rejected — script not executed', async () => {
    await page.enterNationalId(INVALID_IDS.xssPayload);
    await page.submitLogin();
    expect(await page.getValidationError()).not.toBeNull();
    await page.assertURL(/\/beneficiary\/login/);
  });

  test('TC-18 | Arabic-Indic digits are rejected', async () => {
    await page.enterNationalId(INVALID_IDS.arabicDigits);
    await page.submitLogin();
    expect(await page.getValidationError()).not.toBeNull();
  });

});
