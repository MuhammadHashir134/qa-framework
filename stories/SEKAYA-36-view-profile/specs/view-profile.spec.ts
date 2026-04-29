// ============================================================
// Story   : View Profile (Settings) | SEKAYA-36
// URL     : /contractor/settings
// Tags    : @smoke @regression @ui
// Reporter: azm-dev
// ============================================================

import { test, expect } from '../../../core/BaseTest';
import { Page } from '@playwright/test';
import { ProfilePage } from '../pages/ProfilePage';
import { ContractorLoginPage } from '../../PROJ-44-contractor-login/pages/ContractorLoginPage';
import { CONTRACTOR_ID, EXPECTED_LABELS, FIELD_VALIDATIONS } from '../fixtures/view-profile.data';

const STORY = 'SEKAYA-36 | View Profile';

async function loginAndNavigate(p: Page) {
  const login = new ContractorLoginPage(p);
  await login.goto();
  await login.login(CONTRACTOR_ID);
  await p.waitForTimeout(2000);
  await p.waitForURL(/\/contractor\/(dashboard|home)?/);
  await p.waitForLoadState('networkidle');
  await p.waitForTimeout(1500);
  await p.goto('/contractor/settings');
  await p.waitForLoadState('networkidle');
  await p.waitForTimeout(1000);
}

// ── Page Load ─────────────────────────────────────────────────

test.describe(`${STORY} — Page load @smoke @ui`, () => {
  let page: ProfilePage;

  test.beforeEach(async ({ page: p }) => {
    await loginAndNavigate(p);
    page = new ProfilePage(p);
  });

  test('TC-01 | Page loads at /contractor/settings', async () => {
    await page.assertPageLoaded();
  });

  test('TC-02 | Personal Information section heading is visible', async () => {
    await page.assertVisible(page.personalInfoSection);
  });

  test('TC-03 | Company Data section heading is visible', async () => {
    await page.assertVisible(page.companyDataSection);
  });

  test('TC-04 | Edit button is visible and enabled', async () => {
    await page.assertVisible(page.editButton);
    await page.assertEnabled(page.editButton);
  });
});

// ── Personal Information Labels ───────────────────────────────

test.describe(`${STORY} — Personal Information labels @regression @ui`, () => {
  let page: ProfilePage;

  test.beforeEach(async ({ page: p }) => {
    await loginAndNavigate(p);
    page = new ProfilePage(p);
  });

  test('TC-05 | Name label is visible', async () => {
    await page.assertVisible(page.nameLabel);
  });

  test('TC-06 | National ID / Residence Number label is visible', async () => {
    await page.assertVisible(page.nationalIdLabel);
  });

  test('TC-07 | Phone Number label is visible', async () => {
    await page.assertVisible(page.phoneLabel);
  });

  test('TC-08 | Email label is visible', async () => {
    await page.assertVisible(page.emailLabel);
  });
});

// ── Personal Information Values ───────────────────────────────

test.describe(`${STORY} — Personal Information values @regression @ui`, () => {
  let page: ProfilePage;

  test.beforeEach(async ({ page: p }) => {
    await loginAndNavigate(p);
    page = new ProfilePage(p);
  });

  test('TC-09 | Name field has a non-empty value', async () => {
    const value = await page.getNameValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('TC-10 | National ID field matches expected format', async () => {
    const value = await page.getNationalIdValue();
    expect(value).toMatch(FIELD_VALIDATIONS.nationalIdRegex);
  });

  test('TC-11 | Phone Number field matches expected format', async () => {
    const value = await page.getPhoneValue();
    expect(value).toMatch(FIELD_VALIDATIONS.phoneRegex);
  });

  test('TC-12 | Email field matches expected format', async () => {
    const value = await page.getEmailValue();
    expect(value).toMatch(FIELD_VALIDATIONS.emailRegex);
  });
});

// ── Company Data Labels ───────────────────────────────────────

test.describe(`${STORY} — Company Data labels @regression @ui`, () => {
  let page: ProfilePage;

  test.beforeEach(async ({ page: p }) => {
    await loginAndNavigate(p);
    page = new ProfilePage(p);
  });

  test('TC-13 | Commercial Registration Number label is visible', async () => {
    await page.assertVisible(page.crLabel);
  });

  test('TC-14 | Tax Number label is visible', async () => {
    await page.assertVisible(page.taxLabel);
  });

  test('TC-15 | Ministry Number label is visible', async () => {
    await page.assertVisible(page.ministryLabel);
  });
});

// ── Company Data Values ───────────────────────────────────────

test.describe(`${STORY} — Company Data values @regression @ui`, () => {
  let page: ProfilePage;

  test.beforeEach(async ({ page: p }) => {
    await loginAndNavigate(p);
    page = new ProfilePage(p);
  });

  test('TC-16 | Commercial Registration Number has a non-empty value', async () => {
    const value = await page.getCRValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('TC-17 | Tax Number has a non-empty value', async () => {
    const value = await page.getTaxValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('TC-18 | Ministry Number has a non-empty value', async () => {
    const value = await page.getMinistryValue();
    expect(value.length).toBeGreaterThan(0);
  });
});

// ── Edit Button ───────────────────────────────────────────────

test.describe(`${STORY} — Edit button @regression @ui`, () => {
  let page: ProfilePage;

  test.beforeEach(async ({ page: p }) => {
    await loginAndNavigate(p);
    page = new ProfilePage(p);
  });

  test('TC-19 | Clicking Edit button stays within /contractor', async () => {
    await page.clickEditButton();
    await page.delay(1500);
    const url = await page.getCurrentURL();
    expect(url).toContain('/contractor');
  });
});

// ── Data Persistence ──────────────────────────────────────────

test.describe(`${STORY} — Data persistence @regression @ui`, () => {
  let page: ProfilePage;

  test.beforeEach(async ({ page: p }) => {
    await loginAndNavigate(p);
    page = new ProfilePage(p);
  });

  test('TC-20 | Name value is unchanged after page refresh', async () => {
    const before = await page.getNameValue();
    await page.refreshPage();
    const after = await page.getNameValue();
    expect(after).toBe(before);
  });

  test('TC-21 | National ID value is unchanged after page refresh', async () => {
    const before = await page.getNationalIdValue();
    await page.refreshPage();
    const after = await page.getNationalIdValue();
    expect(after).toBe(before);
  });

  test('TC-22 | Email value is unchanged after page refresh', async () => {
    const before = await page.getEmailValue();
    await page.refreshPage();
    const after = await page.getEmailValue();
    expect(after).toBe(before);
  });

  test('TC-23 | Company data is unchanged after page refresh', async () => {
    const before = await page.getCRValue();
    await page.refreshPage();
    const after = await page.getCRValue();
    expect(after).toBe(before);
  });

  test('TC-24 | All sections visible after navigating away and back', async () => {
    await page.navigateTo('/contractor/dashboard');
    await page.delay(1000);
    await page.goto();
    await page.assertVisible(page.personalInfoSection);
    await page.assertVisible(page.companyDataSection);
  });
});

// ── Security ──────────────────────────────────────────────────

test.describe(`${STORY} — Security @regression @ui`, () => {
  let page: ProfilePage;

  test.beforeEach(async ({ page: p }) => {
    await loginAndNavigate(p);
    page = new ProfilePage(p);
  });

  test('TC-25 | Authenticated contractor can view profile data', async () => {
    const name = await page.getNameValue();
    expect(name.length).toBeGreaterThan(0);
  });

  test('TC-26 | Page remains stable after rapid refresh', async () => {
    const email = await page.getEmailValue();
    await page.refreshPage();
    await page.refreshPage();
    const emailAfter = await page.getEmailValue();
    expect(emailAfter).toBe(email);
  });
});
