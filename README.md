# QA Universal Automation Framework

**Stack:** Playwright + TypeScript
**Pattern:** Page Object Model (POM)
**Scope:** UI testing, API testing, multi-browser, multi-environment
**CI/CD:** GitHub Actions (Chromium + Firefox in parallel)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Directory Structure](#directory-structure)
3. [Core Engine](#core-engine)
4. [Configuration](#configuration)
5. [Utilities](#utilities)
6. [Stories (Test Suites)](#stories-test-suites)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Setup & Installation](#setup--installation)
9. [Running Tests](#running-tests)
10. [Adding a New Story](#adding-a-new-story)
11. [Browser Isolation](#browser-isolation)
12. [Environments](#environments)
13. [Test Data Generation](#test-data-generation)
14. [Reports](#reports)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    TEST STORIES (stories/)                   │
│   PROJ-43  │  PROJ-44  │  SEKAYA-36  │  SEKAYA-46  │  ...  │
│  pages/    │  pages/   │  pages/     │  pages/     │        │
│  specs/    │  specs/   │  specs/     │  specs/     │        │
│  fixtures/ │ fixtures/ │  fixtures/  │  fixtures/  │        │
└────────────────────────┬────────────────────────────────────┘
                         │ extends / imports
┌────────────────────────▼────────────────────────────────────┐
│                     CORE ENGINE (core/)                      │
│   BasePage.ts       BaseTest.ts       ApiClient.ts           │
│   (40+ methods)     (fixtures +       (REST helper)          │
│                      auto-screenshot)                        │
└────────────────────────┬────────────────────────────────────┘
                         │ uses
┌────────────────────────▼────────────────────────────────────┐
│               CONFIGURATION & UTILITIES                      │
│   config/environments.ts    config/constants.ts              │
│   utils/DataHelper.ts       utils/WaitHelper.ts              │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                 PLAYWRIGHT + TYPESCRIPT                       │
│         playwright.config.ts    tsconfig.json                │
└─────────────────────────────────────────────────────────────┘
```

**Design Principle:** Stories only know about their own page objects and fixtures. All browser interaction, waiting, assertions, and retries are handled by the core engine — stories never import from `@playwright/test` directly (except for type annotations).

---

## Directory Structure

```
qa-framework/
│
├── .github/
│   └── workflows/
│       ├── playwright.yml        ← Story-specific or full-suite runs
│       └── qa.yml                ← Tag-based runs (smoke / regression)
│
├── core/                         ← ENGINE — never modify
│   ├── BasePage.ts               ← All page objects extend this (40+ methods)
│   ├── BaseTest.ts               ← All specs import test/expect from here
│   └── ApiClient.ts              ← REST API testing helper
│
├── config/
│   ├── environments.ts           ← dev / staging / prod URLs + settings
│   └── constants.ts              ← timeouts, HTTP status codes, test tags
│
├── utils/
│   ├── DataHelper.ts             ← Faker-based test data generator (40+ methods)
│   └── WaitHelper.ts             ← Smart polling and wait patterns
│
├── stories/                      ← ONE FOLDER PER JIRA STORY
│   ├── _TEMPLATE/                ← Copy this to start any new story
│   │   └── HOW_TO_ADD_STORY.ts
│   ├── PROJ-43-login-nafath/
│   │   ├── pages/LoginPage.ts
│   │   ├── fixtures/login-nafath.data.ts
│   │   └── specs/login-nafath.spec.ts
│   ├── PROJ-44-contractor-login/
│   │   ├── pages/ContractorLoginPage.ts
│   │   ├── fixtures/contractor-login.data.ts
│   │   └── specs/contractor-login.spec.ts
│   ├── SEKAYA-36-view-profile/
│   │   ├── pages/ProfilePage.ts
│   │   ├── fixtures/view-profile.data.ts
│   │   └── specs/view-profile.spec.ts
│   └── SEKAYA-46-view-drivers/
│       ├── pages/DriverManagementPage.ts
│       ├── fixtures/view-drivers.data.ts
│       └── specs/view-drivers.spec.ts
│
├── scripts/
│   └── generate-story.ts         ← AI-powered story generator (Claude API)
│
├── playwright.config.ts          ← Browser projects, workers, reporters
├── package.json                  ← Scripts + dependencies
├── tsconfig.json                 ← TypeScript compiler options
└── README.md
```

---

## Core Engine

### `core/BasePage.ts`

Abstract base class that all page objects extend. Provides:

| Category | Methods |
|---|---|
| **Navigation** | `goto()`, `reload()`, `goBack()`, `getCurrentURL()`, `getPageTitle()` |
| **Waits** | `waitForPageLoad()`, `waitForNetworkIdle()`, `waitForElement()`, `waitForElementToDisappear()`, `waitForURL()`, `delay()` |
| **Interactions** | `clickElement()`, `fillField()`, `selectDropdown()`, `uploadFile()`, `scrollToElement()`, `hoverElement()`, `clearField()` |
| **Assertions** | `assertVisible()`, `assertHidden()`, `assertEnabled()`, `assertDisabled()`, `assertText()`, `assertContainsText()`, `assertValue()`, `assertURL()`, `assertTitle()`, `assertCount()` |
| **Getters** | `getText()`, `getValue()`, `getAttribute()`, `isVisible()`, `isEnabled()`, `getCount()` |
| **Utilities** | `takeScreenshot()`, `getValidationError()`, `getToastMessage()`, `dismissModal()`, `acceptDialog()`, `switchToEnglishIfNeeded()` |

**Key design decisions:**
- `protected page` — stories access page only through inherited methods
- `switchToEnglishIfNeeded()` — auto-detects Arabic UI and switches to English
- `fillField()` — handles both standard inputs and number inputs (dispatches events)
- `getValidationError()` — covers 10+ error element patterns across different UI frameworks

### `core/BaseTest.ts`

Custom test fixture factory. Every spec file does:
```typescript
import { test, expect } from '../../../core/BaseTest';
```

Provides:
- **`apiClient` fixture** — pre-configured `ApiClient` injected into every test
- **`storyId` fixture** — story identifier for reporting
- **Auto environment annotation** — every test result includes the environment name
- **Auto screenshot on failure** — captures full-page screenshot and attaches to report

### `core/ApiClient.ts`

REST API wrapper for backend testing. Supports:
- `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- Auth: `setAuthToken()`, `setApiKey()`, `clearAuth()`
- Assertions: `assertStatus()`, `assertOK()`, `assertBodyContains()`, `assertBodyValue()`
- Shortcuts: `getAndAssertOK()`, `postAndAssertCreated()`

---

## Configuration

### `config/environments.ts`

Controls which environment tests run against. Set via the `ENV` variable:

```bash
ENV=dev npm test
ENV=staging npm test
ENV=prod npm test
```

| Setting | dev | staging | prod |
|---|---|---|---|
| `baseURL` | dev.your-app.com | uat-sp-frontoffice.sekaya.sa | your-app.com |
| `timeout` | 60s | 60s | 90s |
| `retries` | 0 | 1 | 2 |
| `headless` | false | true | true |

### `config/constants.ts`

Shared constants used across all stories:

```typescript
TIMEOUTS.short    = 3,000ms
TIMEOUTS.medium   = 10,000ms
TIMEOUTS.long     = 30,000ms
TIMEOUTS.nafath   = 60,000ms   // external auth provider

HTTP_STATUS.OK, CREATED, BAD_REQUEST, UNAUTHORIZED, NOT_FOUND ...

TEST_TAGS.smoke, .regression, .ui, .api, .critical, .wip
```

---

## Utilities

### `utils/DataHelper.ts`

Static class for generating realistic test data using `@faker-js/faker`:

| Category | Methods |
|---|---|
| Identity | `nationalId()`, `fullName()`, `firstName()`, `lastName()` |
| Contact | `email()`, `phone()`, `saudiPhone()` |
| Address | `address()`, `city()` |
| Credentials | `password()`, `username()` |
| Numbers | `randomInt()`, `randomFloat()` |
| Text | `sentence()`, `paragraph()`, `word()` |
| Dates | `futureDate()`, `pastDate()` |
| Boundary | `tooShort()`, `tooLong()`, `exactLength()` |
| Security | `sqlInjection()`, `xssPayload()`, `specialChars()`, `unicodeText()` |

Usage in fixtures:
```typescript
import { DataHelper } from '../../../utils/DataHelper';

export const INVALID_IDS = {
  tooShort:  DataHelper.tooShort(10),
  sql:       DataHelper.sqlInjection(),
  xss:       DataHelper.xssPayload(),
};
```

### `utils/WaitHelper.ts`

Smart wait utility for complex async scenarios:

```typescript
await WaitHelper.forPageLoad(page);
await WaitHelper.forNetworkIdle(page);
await WaitHelper.forAPIResponse(page, /api\/drivers/);
await WaitHelper.forURL(page, /\/dashboard/);
await WaitHelper.forCondition(async () => someCheck(), 10000);
```

---

## Stories (Test Suites)

Each story maps 1:1 to a Jira story and lives in its own folder under `stories/`.

### Story Folder Structure

```
stories/PROJ-XX-story-name/
├── pages/
│   └── YourPage.ts          ← Page Object (extends BasePage)
├── fixtures/
│   └── your-story.data.ts   ← Test data constants
└── specs/
    └── your-story.spec.ts   ← Test cases (imports from core/BaseTest)
```

### Active Stories

| Story | Folder | Tests | Coverage |
|---|---|---|---|
| PROJ-43 | `PROJ-43-login-nafath` | 18 | Beneficiary login via Nafath |
| PROJ-44 | `PROJ-44-contractor-login` | 18 | Contractor login |
| SEKAYA-36 | `SEKAYA-36-view-profile` | 26 | Profile / Settings page |
| SEKAYA-46 | `SEKAYA-46-view-drivers` | 18 | Driver Management |

**Total: 80 test cases across 4 stories**

### Test Organisation Pattern

Every spec file follows this structure:

```typescript
// ── Page Elements / Load ─────── @smoke @ui
// ── Happy Path ────────────────── @smoke @regression @ui
// ── Validation ────────────────── @regression @ui
// ── Edge Cases ────────────────── @regression @ui
```

---

## CI/CD Pipeline

### Workflows

| Workflow | Trigger | Purpose |
|---|---|---|
| `playwright.yml` | Push, PR, Manual | Run all or specific story |
| `qa.yml` | Push, PR, Manual | Run by tag (`@smoke`, `@regression`) |

### How It Works

```
Push to master
      │
      ▼
GitHub Actions
      │
      ├── Job: Playwright (chromium) ──── runs all stories
      └── Job: Playwright (firefox)  ──── runs all stories (parallel)
                    │
                    ▼
          Upload playwright-report/ as artifact (14 days)
          Upload test-results/ on failure (7 days)
```

### Manual Trigger Options

**playwright.yml** — run specific story or tag:
```
story: SEKAYA-36-view-profile
grep:  @smoke
```

**qa.yml** — run by tag + environment:
```
tags: @smoke
env:  staging
```

---

## Setup & Installation

```bash
# Clone the repo
git clone https://github.com/MuhammadHashir134/qa-framework.git
cd qa-framework

# Install dependencies
npm install

# Install browsers
npx playwright install

# Verify setup
npm test -- --project chromium stories/SEKAYA-36-view-profile
```

**Requirements:** Node.js 22+, npm 9+

---

## Running Tests

```bash
# Run all stories (Chromium + Firefox)
npm test

# Run specific story
npx playwright test stories/SEKAYA-36-view-profile

# Run specific browser
npx playwright test --project chromium
npx playwright test --project firefox

# Run by tag
npm run test:smoke
npm run test:regression

# Run in headed mode (see browser)
npm run test:headed

# Run in debug mode (step through)
npm run test:debug

# Run specific environment
ENV=dev npm test
ENV=staging npm test

# View HTML report
npm run report
```

---

## Adding a New Story

1. **Copy the template**
   ```bash
   cp -r stories/_TEMPLATE stories/SEKAYA-XX-your-story
   ```

2. **Create the Page Object** (`pages/YourPage.ts`)
   ```typescript
   import { Page } from '@playwright/test';
   import { BasePage } from '../../../core/BasePage';

   export class YourPage extends BasePage {
     readonly submitBtn = this.page.getByRole('button', { name: /submit/i });

     constructor(page: Page) { super(page); }

     async goto() {
       await this.page.goto('/your-route');
       await this.switchToEnglishIfNeeded();
       await this.page.waitForLoadState('networkidle');
     }
   }
   ```

3. **Create fixtures** (`fixtures/your-story.data.ts`)
   ```typescript
   export const VALID_DATA   = { id: '1000050326' };
   export const INVALID_DATA = { empty: '', tooLong: 'x'.repeat(300) };
   ```

4. **Write specs** (`specs/your-story.spec.ts`)
   ```typescript
   import { test, expect } from '../../../core/BaseTest';
   import { YourPage } from '../pages/YourPage';
   import { VALID_DATA } from '../fixtures/your-story.data';

   test.describe('SEKAYA-XX | Story Title @smoke @ui', () => {
     let page: YourPage;
     test.beforeEach(async ({ page: p }) => {
       page = new YourPage(p);
       await page.goto();
     });

     test('TC-01 | Page loads correctly', async () => {
       await page.assertURL(/\/your-route/);
     });
   });
   ```

5. **Run and verify**
   ```bash
   npx playwright test stories/SEKAYA-XX-your-story --project chromium
   ```

---

## Browser Isolation

Each test runs in a **fully isolated browser context**:

- No shared cookies, sessions, or localStorage between tests
- Parallel execution: `fullyParallel: true`
- Workers: 4 locally, 2 in CI (resource-constrained)
- Each `beforeEach` creates a fresh login session

This means tests are independent — a failing test cannot affect other tests.

```
Worker 1 ── Chromium ── TC-01 (isolated context)
Worker 2 ── Chromium ── TC-02 (isolated context)
Worker 3 ── Firefox  ── TC-01 (isolated context)
Worker 4 ── Firefox  ── TC-02 (isolated context)
```

---

## Environments

| Env | URL | Retries | Headless |
|---|---|---|---|
| `dev` | dev.your-app.com | 0 | No |
| `staging` | uat-sp-frontoffice.sekaya.sa | 1 | Yes |
| `prod` | your-app.com | 2 | Yes |

Override at runtime: `ENV=staging npm test`

---

## Test Data Generation

Use `DataHelper` for dynamic, realistic test data:

```typescript
import { DataHelper } from '../../../utils/DataHelper';

// Saudi-specific
DataHelper.saudiPhone()     // "0551234567"
DataHelper.nationalId()     // "1234567890"
DataHelper.unicodeText()    // "مرحبا بالعالم"

// Security testing
DataHelper.sqlInjection()   // "' OR '1'='1"
DataHelper.xssPayload()     // "<script>alert('xss')</script>"

// Boundary testing
DataHelper.tooShort(10)     // 9-char string
DataHelper.tooLong(50)      // 51-char string
```

---

## Reports

### HTML Report (interactive)
```bash
npm run report
# Opens playwright-report/index.html in browser
# Shows: test timeline, screenshots, videos, traces
```

### JUnit XML (for CI integrations)
```
playwright-report/results.xml
```

### Failure Artifacts
On test failure, automatically captured:
- **Screenshot** — full-page PNG
- **Video** — WebM recording of the test
- **Trace** — step-by-step Playwright trace (on retry)

All artifacts uploaded to GitHub Actions for 7–14 days.

---

## AI Story Generator

Generate a complete story (Page Object + fixtures + spec) from a description:

```bash
npm run generate
```

Uses the Claude API to analyse the story requirements and generate all 3 files following the exact framework conventions. Output is placed in the correct `stories/` folder automatically.
