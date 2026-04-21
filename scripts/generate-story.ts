/**
 * generate-story — AI-powered QA lifecycle automation
 *
 * Given a user story, runs a full pipeline:
 *   1. Analyse requirements  → structured JSON (scenarios, test cases, fixtures, UI elements)
 *   2. Generate Playwright code → PageObject, fixtures, and spec files
 *   3. Write files to stories/{id}-{slug}/
 *
 * Usage:
 *   npm run generate -- --id PROJ-55 --title "User Registration" --story "As a new user..."
 *   npm run generate -- --id PROJ-55 --title "User Registration" --file story.md
 *
 * Requires: ANTHROPIC_API_KEY env var
 */

import Anthropic from '@anthropic-ai/sdk';
import * as fs   from 'fs';
import * as path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const MODEL      = 'claude-opus-4-7';
const STORIES_DIR = path.join(__dirname, '..', 'stories');

// ─────────────────────────────────────────────────────────────────────────────
// Cached system prompt — identical across all calls to maximise cache hits
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `\
You are a senior QA automation engineer working with a Playwright + TypeScript framework.
Your job is to produce complete, immediately-runnable test artifacts that follow the project
conventions exactly. Every import path, class name, tag, and coding style must match the
reference implementation below.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FRAMEWORK FILE STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  stories/
    {STORY-ID}-{slug}/
      pages/{PageName}Page.ts        ← Page Object Model (extends BasePage)
      fixtures/{slug}.data.ts        ← exported test-data constants
      specs/{slug}.spec.ts           ← Playwright test specifications

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BASE CLASS — BasePage  (core/BasePage.ts)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All Page Objects MUST extend BasePage and call super(page) in their constructor.

  Navigation    goto(path?), reload(), goBack(), getCurrentURL(), getPageTitle()

  Waits         waitForPageLoad(), waitForNetworkIdle()
                waitForElement(locator, timeout?), waitForElementToDisappear(locator, timeout?)
                waitForURL(urlPattern, timeout?)

  Interactions  clickElement(locator), fillField(locator, value), selectDropdown(locator, value)
                uploadFile(locator, filePath), scrollToElement(locator), hoverElement(locator)
                clearField(locator)

  Assertions    assertVisible(locator, msg?), assertHidden(locator, msg?)
                assertEnabled(locator, msg?), assertDisabled(locator, msg?)
                assertText(locator, text|RegExp), assertContainsText(locator, text)
                assertValue(locator, value), assertURL(pattern), assertTitle(pattern)
                assertCount(locator, count), assertChecked(locator), assertNotChecked(locator)

  Getters       getText(locator), getValue(locator), getAttribute(locator, attr)
                isVisible(locator), isEnabled(locator), getCount(locator)

  Utilities     takeScreenshot(name), getValidationError(selector?): Promise<string|null>
                getToastMessage(selector?): Promise<string|null>
                dismissModal(selector?), acceptDialog(), dismissDialog()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BASE TEST — BaseTest  (core/BaseTest.ts)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL RULE: spec files MUST use —
  import { test, expect } from '../../../core/BaseTest';
NEVER import from '@playwright/test' directly.

Custom fixtures:
  apiClient : ApiClient   — pre-wired HTTP client for API tests
  storyId   : string      — story identifier

Auto-behaviours: environment annotation, failure screenshot.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API CLIENT — ApiClient  (core/ApiClient.ts)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Auth    setAuthToken(token), setApiKey(key), clearAuth()
  HTTP    get(ep, params?), post(ep, body), put(ep, body), patch(ep, body), delete(ep)
  Assert  assertStatus(res, status), assertOK(res), assertBodyContains(res, key)
          assertBodyValue(res, key, value), getJson(res)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REFERENCE IMPLEMENTATION — PROJ-42 Login Via Nafath
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

=== pages/LoginPage.ts ===
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../../../core/BasePage';

export type UserType = 'Beneficiary' | 'Contractor' | 'Driver';

export class LoginPage extends BasePage {
  readonly beneficiaryTab:     Locator;
  readonly contractorTab:      Locator;
  readonly driverTab:          Locator;
  readonly nationalIdInput:    Locator;
  readonly loginWithNafathBtn: Locator;
  readonly verificationNumber: Locator;

  constructor(page: Page) {
    super(page);
    this.beneficiaryTab     = page.getByRole('tab', { name: /beneficiary/i });
    this.contractorTab      = page.getByRole('tab', { name: /contractor/i });
    this.driverTab          = page.getByRole('tab', { name: /driver/i });
    this.nationalIdInput    = page.getByPlaceholder(/enter your id/i);
    this.loginWithNafathBtn = page.getByRole('button', { name: /login with nafath/i });
    this.verificationNumber = page.locator('[data-testid="verification-number"]');
  }

  async goto() { await super.goto('/login'); }

  async selectUserType(type: UserType) {
    const tabs = { Beneficiary: this.beneficiaryTab, Contractor: this.contractorTab, Driver: this.driverTab };
    await this.clickElement(tabs[type]);
  }

  async enterNationalId(id: string) { await this.fillField(this.nationalIdInput, id); }
  async submitLogin()                { await this.clickElement(this.loginWithNafathBtn); }

  async login(type: UserType, id: string) {
    await this.selectUserType(type);
    await this.enterNationalId(id);
    await this.submitLogin();
  }

  async isTabActive(type: UserType): Promise<boolean> {
    const tab = { Beneficiary: this.beneficiaryTab, Contractor: this.contractorTab, Driver: this.driverTab }[type];
    const selected = await this.getAttribute(tab, 'aria-selected');
    const cls      = await this.getAttribute(tab, 'class');
    return selected === 'true' || (cls?.includes('active') ?? false);
  }
}

=== fixtures/login.data.ts ===
export const VALID_IDS = {
  beneficiary: '1234567890',
  contractor:  '9876543210',
  driver:      '1122334455',
};

export const INVALID_IDS = {
  empty:        '',
  tooShort:     '12345',
  tooLong:      '12345678901',
  nonNumeric:   'ABCD123456',
  specialChars: '123-456-789',
  withSpaces:   '123 456 789',
};

=== specs/login.spec.ts ===
import { test, expect } from '../../../core/BaseTest';
import { LoginPage }    from '../pages/LoginPage';
import { VALID_IDS, INVALID_IDS } from '../fixtures/login.data';

const STORY = 'PROJ-42 | Login Via Nafath';

test.describe(\`\${STORY} — Tab behaviour @smoke @ui\`, () => {
  let page: LoginPage;
  test.beforeEach(async ({ page: p }) => { page = new LoginPage(p); await page.goto(); });

  test('TC-01 | Beneficiary tab is selected by default', async () => {
    expect(await page.isTabActive('Beneficiary')).toBe(true);
  });

  test('TC-02 | All 3 tabs are visible', async () => {
    await page.assertVisible(page.beneficiaryTab);
    await page.assertVisible(page.contractorTab);
    await page.assertVisible(page.driverTab);
  });

  for (const type of ['Beneficiary', 'Contractor', 'Driver'] as const) {
    test(\`TC-03 | \${type} tab can be selected\`, async () => {
      await page.selectUserType(type);
      expect(await page.isTabActive(type)).toBe(true);
    });
  }
});

test.describe(\`\${STORY} — Happy path @smoke @regression @ui\`, () => {
  let page: LoginPage;
  test.beforeEach(async ({ page: p }) => { page = new LoginPage(p); await page.goto(); });

  for (const [type, id] of Object.entries(VALID_IDS) as [string, string][]) {
    test(\`TC-04 | \${type} login triggers Nafath verification\`, async () => {
      const userType = (type.charAt(0).toUpperCase() + type.slice(1)) as 'Beneficiary' | 'Contractor' | 'Driver';
      await page.login(userType, id);
      await page.assertVisible(page.verificationNumber);
    });
  }
});

test.describe(\`\${STORY} — Validation @regression @ui\`, () => {
  let page: LoginPage;
  test.beforeEach(async ({ page: p }) => { page = new LoginPage(p); await page.goto(); });

  test('TC-05 | Empty ID shows validation error', async () => {
    await page.enterNationalId(INVALID_IDS.empty);
    await page.submitLogin();
    expect(await page.getValidationError()).not.toBeNull();
  });

  test('TC-06 | ID shorter than 10 digits shows error', async () => {
    await page.enterNationalId(INVALID_IDS.tooShort);
    await page.submitLogin();
    expect(await page.getValidationError()).not.toBeNull();
  });
});

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY RULES — MUST BE FOLLOWED IN ALL OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LOCATORS (use in priority order — NEVER CSS class or XPath):
  1. page.getByRole('button', { name: /text/i })
  2. page.getByPlaceholder(/text/i)
  3. page.getByLabel(/text/i)
  4. page.getByText(/text/i)
  5. page.getByTestId('value')
  6. page.locator('[data-testid="exact-id"]')

SPEC FILE:
  - Import { test, expect } from '../../../core/BaseTest'
  - test.describe blocks with tags in the title string: @smoke @regression @ui
  - test.beforeEach to instantiate the Page Object and call goto()
  - TC-IDs sequential: TC-01, TC-02, TC-03 …

FIXTURES FILE:
  - SCREAMING_SNAKE_CASE exported constants
  - Realistic non-trivial values
  - Cover: valid, boundary-low, boundary-high, empty, too-short, too-long,
           special chars, SQL injection, XSS payload, Arabic/unicode

PAGE OBJECT:
  - extends BasePage, super(page) in constructor
  - readonly Locator properties, all defined in the constructor
  - Action methods that call BasePage helpers (fillField, clickElement, …)
  - No page.waitForTimeout()
`;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface StoryInput {
  id:          string;
  title:       string;
  description: string;
}

interface StoryAnalysis {
  pageClassName: string;
  pageRoute:     string;
  slug:          string;
  summary:       string;
  uiElements:    { property: string; locator: string; description: string }[];
  testGroups:    { name: string; tags: string; tests: AnalysedTest[] }[];
  validFixtures: Record<string, Record<string, string>>;
  invalidFixtures: Record<string, string | Record<string, string>>;
  apiEndpoints:  { method: string; path: string; description: string }[];
  riskAreas:     string[];
}

interface AnalysedTest {
  id:          string;
  title:       string;
  steps:       string[];
  expected:    string;
  testDataKey?: string;
  priority:    'P1' | 'P2' | 'P3';
}

interface GeneratedCode {
  pageObject: string;
  fixtures:   string;
  spec:       string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI argument parser
// ─────────────────────────────────────────────────────────────────────────────

function parseArgs(): StoryInput {
  const args = process.argv.slice(2);

  const flag = (name: string): string | undefined => {
    const i = args.indexOf(name);
    return i !== -1 && i + 1 < args.length ? args[i + 1] : undefined;
  };

  const id    = flag('--id');
  const title = flag('--title');
  const file  = flag('--file');
  let   description = flag('--story');

  if (file) {
    description = fs.readFileSync(path.resolve(file), 'utf-8').trim();
  }

  if (!id || !title || !description) {
    process.stderr.write(
      'Usage:\n' +
      '  npm run generate -- --id PROJ-XX --title "Story title" --story "User story text"\n' +
      '  npm run generate -- --id PROJ-XX --title "Story title" --file story.md\n'
    );
    process.exit(1);
  }

  return { id, title, description };
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Requirement analysis → structured JSON
// ─────────────────────────────────────────────────────────────────────────────

async function analyseStory(
  client: Anthropic,
  story: StoryInput,
): Promise<StoryAnalysis> {
  const systemBlock: Anthropic.TextBlockParam = {
    type: 'text',
    text: SYSTEM_PROMPT,
    cache_control: { type: 'ephemeral' },   // cache the large framework context
  };

  const userPrompt = `\
Analyse the following user story and return ONLY a JSON object (no markdown, no explanation).
The JSON must conform exactly to this schema:

{
  "pageClassName": "PascalCase name for the Page Object class (e.g. RegistrationPage)",
  "pageRoute": "/path used in goto()",
  "slug": "kebab-case slug (e.g. user-registration)",
  "summary": "One sentence describing what is being tested",
  "uiElements": [
    { "property": "camelCase locator property name", "locator": "full page.getBy… expression", "description": "what it is" }
  ],
  "testGroups": [
    {
      "name": "Group name (Happy path | Validation | Negative | Edge cases | API)",
      "tags": "@smoke @regression @ui",
      "tests": [
        {
          "id": "TC-01",
          "title": "Short readable test title",
          "steps": ["Step 1 description", "Step 2 description"],
          "expected": "What should happen",
          "testDataKey": "FIXTURE_KEY or null",
          "priority": "P1"
        }
      ]
    }
  ],
  "validFixtures": {
    "VALID_USER": { "email": "user@example.com", "password": "SecureP@ss1" }
  },
  "invalidFixtures": {
    "EMPTY_EMAIL":   "",
    "INVALID_EMAIL": "not-an-email"
  },
  "apiEndpoints": [
    { "method": "POST", "path": "/api/auth/register", "description": "Creates user account" }
  ],
  "riskAreas": ["Risk area 1", "Risk area 2"]
}

Generate at least:
- 3 UI elements
- A "Happy path" test group with 2+ tests tagged @smoke @regression @ui
- A "Validation" group with negative tests tagged @regression @ui
- An "Edge cases" group
- Realistic fixture data (no 'test', 'foo', '123' placeholders)
- Boundary values, special chars, SQL injection, and XSS payload in invalidFixtures

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STORY ID:    ${story.id}
STORY TITLE: ${story.title}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${story.description}
`;

  process.stdout.write('  Calling Claude (analysis)... ');

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 4096,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    thinking: { type: 'adaptive' } as any,
    system: [systemBlock],
    messages: [{ role: 'user', content: userPrompt }],
  });

  const msg = await stream.finalMessage();

  process.stdout.write('done\n');

  // Log cache stats
  const u = msg.usage as Anthropic.Usage & {
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
  if (u.cache_read_input_tokens || u.cache_creation_input_tokens) {
    process.stdout.write(
      `  Cache: ${u.cache_read_input_tokens ?? 0} read / ${u.cache_creation_input_tokens ?? 0} written\n`
    );
  }

  const textBlock = msg.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
  if (!textBlock) throw new Error('No text block in analysis response');

  // Strip optional markdown code fences
  const raw = textBlock.text
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/```\s*$/m, '')
    .trim();

  try {
    return JSON.parse(raw) as StoryAnalysis;
  } catch {
    throw new Error(`Failed to parse analysis JSON:\n${raw.slice(0, 400)}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Code generation → 3 TypeScript files (streamed)
// ─────────────────────────────────────────────────────────────────────────────

async function generateCode(
  client: Anthropic,
  story: StoryInput,
  analysis: StoryAnalysis,
): Promise<GeneratedCode> {
  const systemBlock: Anthropic.TextBlockParam = {
    type: 'text',
    text: SYSTEM_PROMPT,
    cache_control: { type: 'ephemeral' },   // same prefix → cache hit
  };

  const analysisJson = JSON.stringify(analysis, null, 2);

  const userPrompt = `\
Using the analysis below, generate the three TypeScript files for this story.

Output EXACTLY three fenced code blocks with the labels shown:

\`\`\`typescript PAGE_OBJECT
// … Page Object file content …
\`\`\`

\`\`\`typescript FIXTURES
// … fixtures data file content …
\`\`\`

\`\`\`typescript SPEC
// … spec file content …
\`\`\`

Rules:
- The spec MUST import from '../../../core/BaseTest', not '@playwright/test'
- All TC-IDs must be sequential from TC-01 within the spec file
- Page Object class name: ${analysis.pageClassName}
- Fixtures file exports must use SCREAMING_SNAKE_CASE
- No other text outside the three code blocks

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STORY ID:    ${story.id}
STORY TITLE: ${story.title}
ANALYSIS:
${analysisJson}
`;

  process.stdout.write('  Calling Claude (code generation, streaming)...\n');

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    thinking: { type: 'adaptive' } as any,
    system: [systemBlock],
    messages: [{ role: 'user', content: userPrompt }],
  });

  // Stream characters as they arrive so the user sees progress
  stream.on('text', (delta) => process.stdout.write(delta));

  const msg = await stream.finalMessage();
  process.stdout.write('\n');

  const u = msg.usage as Anthropic.Usage & {
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
  if (u.cache_read_input_tokens || u.cache_creation_input_tokens) {
    process.stdout.write(
      `  Cache: ${u.cache_read_input_tokens ?? 0} read / ${u.cache_creation_input_tokens ?? 0} written\n`
    );
  }

  const textBlock = msg.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
  if (!textBlock) throw new Error('No text block in code generation response');

  return parseCodeBlocks(textBlock.text);
}

// ─────────────────────────────────────────────────────────────────────────────
// Parser — extract labelled TypeScript code blocks
// ─────────────────────────────────────────────────────────────────────────────

function parseCodeBlocks(text: string): GeneratedCode {
  const extract = (label: string): string => {
    // Match ```typescript LABEL\n...\n```
    const re = new RegExp('```typescript\\s+' + label + '\\s*\\n([\\s\\S]*?)\\n?```', 'm');
    const m  = text.match(re);
    if (!m) throw new Error(`Could not find code block: ${label}\n\nFull response:\n${text.slice(0, 600)}`);
    return m[1].trim();
  };

  return {
    pageObject: extract('PAGE_OBJECT'),
    fixtures:   extract('FIXTURES'),
    spec:       extract('SPEC'),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// File writer
// ─────────────────────────────────────────────────────────────────────────────

function writeStoryFiles(
  story: StoryInput,
  analysis: StoryAnalysis,
  code: GeneratedCode,
): string {
  const storyDir = path.join(STORIES_DIR, `${story.id}-${analysis.slug}`);

  const files: Record<string, string> = {
    [`pages/${analysis.pageClassName}.ts`]: code.pageObject,
    [`fixtures/${analysis.slug}.data.ts`]: code.fixtures,
    [`specs/${analysis.slug}.spec.ts`]:    code.spec,
  };

  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(storyDir, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content + '\n', 'utf-8');
    process.stdout.write(`  Written: ${abs.replace(STORIES_DIR + path.sep, 'stories/')}\n`);
  }

  // Also save the analysis JSON for reference / debugging
  const analysisPath = path.join(storyDir, 'analysis.json');
  fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2) + '\n', 'utf-8');
  process.stdout.write(`  Written: ${analysisPath.replace(STORIES_DIR + path.sep, 'stories/')}\n`);

  return storyDir;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const story  = parseArgs();
  const client = new Anthropic();  // reads ANTHROPIC_API_KEY automatically

  process.stdout.write(`\n${'─'.repeat(60)}\n`);
  process.stdout.write(`QA Story Generator\n`);
  process.stdout.write(`Story : ${story.id} — ${story.title}\n`);
  process.stdout.write(`Model : ${MODEL}\n`);
  process.stdout.write(`${'─'.repeat(60)}\n\n`);

  // ── Step 1: Analyse ──────────────────────────────────────────────────────
  process.stdout.write('[1/3] Analysing requirements...\n');
  const analysis = await analyseStory(client, story);

  process.stdout.write(`      Page class : ${analysis.pageClassName}\n`);
  process.stdout.write(`      Route      : ${analysis.pageRoute}\n`);
  process.stdout.write(`      Test cases : ${analysis.testGroups.flatMap(g => g.tests).length}\n`);
  process.stdout.write(`      Risk areas : ${analysis.riskAreas.length}\n\n`);

  // ── Step 2: Generate code ────────────────────────────────────────────────
  process.stdout.write('[2/3] Generating Playwright code...\n');
  const code = await generateCode(client, story, analysis);

  // ── Step 3: Write files ──────────────────────────────────────────────────
  process.stdout.write('\n[3/3] Writing files...\n');
  const storyDir = writeStoryFiles(story, analysis, code);

  // ── Summary ───────────────────────────────────────────────────────────────
  const totalTests = analysis.testGroups.flatMap(g => g.tests).length;

  process.stdout.write(`\n${'─'.repeat(60)}\n`);
  process.stdout.write(`Story ${story.id} generated successfully.\n\n`);
  process.stdout.write(`  Directory : ${storyDir}\n`);
  process.stdout.write(`  Tests     : ${totalTests}\n`);
  process.stdout.write(`  Groups    :\n`);
  for (const g of analysis.testGroups) {
    process.stdout.write(`              ${g.name.padEnd(20)} ${g.tests.length} tests  ${g.tags}\n`);
  }
  process.stdout.write(`\nRun with:\n`);
  process.stdout.write(`  npx playwright test stories/${story.id}-${analysis.slug}/\n`);
  process.stdout.write(`${'─'.repeat(60)}\n\n`);
}

main().catch((err: Error) => {
  process.stderr.write(`\nError: ${err.message}\n`);
  process.exit(1);
});
