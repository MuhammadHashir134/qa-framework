# QA Universal Automation Framework
**Stack:** Playwright + TypeScript  
**Pattern:** Page Object Model  
**Scope:** Any story, any module, UI + API  

---

## Structure

```
qa-framework/
│
├── core/                        ← ENGINE — never modify
│   ├── BasePage.ts              ← All pages extend this
│   ├── BaseTest.ts              ← All tests import from here
│   └── ApiClient.ts             ← REST API helper
│
├── config/
│   ├── environments.ts          ← dev / staging / prod URLs
│   └── constants.ts             ← timeouts, HTTP codes, tags
│
├── utils/
│   ├── DataHelper.ts            ← generate test data (faker)
│   └── WaitHelper.ts            ← smart waits
│
├── stories/                     ← ONE FOLDER PER JIRA STORY
│   ├── _TEMPLATE/               ← copy this for every new story
│   └── PROJ-42-login-nafath/
│       ├── pages/LoginPage.ts
│       ├── fixtures/login.data.ts
│       └── specs/login.spec.ts
│
├── playwright.config.ts
├── package.json
└── .github/workflows/qa.yml    ← CI/CD
```

---

## Setup

```bash
npm install
npx playwright install
```

---

## Run Tests

```bash
# All stories
npm test

# Specific story
npx playwright test stories/PROJ-42-login-nafath

# By tag
npm run test:smoke
npm run test:regression
npm run test:api

# Specific environment
ENV=dev npm test
ENV=staging npm test
ENV=prod npm test

# Headed (see the browser)
npm run test:headed

# View report
npm run report
```

---

## Adding a New Story

1. Copy `stories/_TEMPLATE/` folder
2. Rename it to `stories/PROJ-XX-story-name/`
3. Create 3 files:
   - `pages/YourPage.ts` — extends `BasePage`
   - `fixtures/your.data.ts` — test data
   - `specs/your.spec.ts` — imports from `core/BaseTest`
4. Run `npx playwright test stories/PROJ-XX-story-name`

---

## What Each Layer Does

| Layer | What you do |
|-------|-------------|
| `core/BasePage.ts` | Never touch — gives all pages: click, fill, assert, wait, screenshot |
| `core/BaseTest.ts` | Never touch — auto-screenshots on fail, injects API client |
| `core/ApiClient.ts` | Never touch — GET/POST/PUT/DELETE + assertions |
| `config/` | Update URLs per environment |
| `utils/DataHelper.ts` | Call `DataHelper.nationalId()`, `DataHelper.email()` etc |
| `stories/PROJ-XX/` | Your work — one folder per story |

---

## CI/CD

Push to `main` or `develop` → GitHub Actions runs all tests on Chromium + Firefox → HTML report uploaded as artifact.

Manually trigger with specific tags:
- Go to Actions → QA Universal Framework → Run workflow
- Enter tag: `@smoke` or `@regression`
- Enter env: `dev` / `staging` / `prod`
