// Captures the light and dark project screenshots in public/ from the real,
// running applications. Both themes of a view use the same data, viewport and
// zoom, so the pair differs only in theme.
//
//   DataSentry: start it from its repository
//     python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
//   TND: start its backend (any free port) and serve frontend/ on 5500, then
//     run one real analysis, which is saved to TND_RESULT and reused for both
//     themes. Delete that file to analyse again.
//
//   FlowCast: serve its gh-pages branch (the static demo) under /flowcast/, e.g.
//     a folder holding a `flowcast` link to the checkout: python -m http.server 4310
//     Only the models view is captured here. The network and sensor views are
//     FlowCast's own captures (docs/assets/screens/, copied to public/flowcast/),
//     because they show OpenStreetMap tiles.
//   CampusSignal: run its backend and `npm run dev` against a disposable database
//     with `seed-demo`, then create the demo student, notices, issue and posts
//     through its API (see the comment in src/content/campussignal.ts). Signs in as
//     CS_EMAIL with CS_PASSWORD.
//
//   node scripts/project-shots.mjs [datasentry] [tnd] [flowcast] [campussignal]
//
// Env: DS_URL (http://127.0.0.1:8001), TND_URL (http://127.0.0.1:5500),
// TND_API (http://127.0.0.1:8000), TND_RESULT (.impeccable/tnd-result.json),
// FC_URL (http://127.0.0.1:4310/flowcast), CS_URL (http://localhost:5173),
// CS_EMAIL (mite-cse-001@mite.example), CS_PASSWORD (required for campussignal),
// CHROME_PATH (optional browser executable).
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { chromium } from '@playwright/test';

const DS_URL = process.env.DS_URL ?? 'http://127.0.0.1:8001';
const TND_URL = process.env.TND_URL ?? 'http://127.0.0.1:5500';
const TND_API = process.env.TND_API ?? 'http://127.0.0.1:8000';
const TND_RESULT = process.env.TND_RESULT ?? '.impeccable/tnd-result.json';
const FC_URL = process.env.FC_URL ?? 'http://127.0.0.1:4310/flowcast';
const CS_URL = process.env.CS_URL ?? 'http://localhost:5173';
const CS_EMAIL = process.env.CS_EMAIL ?? 'mite-cse-001@mite.example';
const CS_PASSWORD = process.env.CS_PASSWORD;
const THEMES = ['light', 'dark'];
const VIEWPORT = { width: 1440, height: 900 };

const targets = process.argv.slice(2);
const want = (name) => targets.length === 0 || targets.includes(name);

// CHROME_PATH: use an installed Chrome or Chromium instead of Playwright's own download.
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});

async function newPage(theme, init) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    colorScheme: theme,
    reducedMotion: 'reduce',
  });
  if (init) await context.addInitScript(init.fn, init.arg);
  const page = await context.newPage();
  page.on('pageerror', (e) => console.warn(`  page error: ${e}`));
  return page;
}

async function shot(page, path, options = {}) {
  await mkdir(dirname(path), { recursive: true });
  await page.mouse.move(0, VIEWPORT.height - 1);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path, ...options });
  console.log(`  wrote ${path}`);
}

// ---------- DataSentry ----------
// Synthetic customer churn sample, target "churned": the app's own demo path.
async function dataSentry() {
  for (const theme of THEMES) {
    const page = await newPage(theme, {
      fn: (t) => localStorage.setItem('datasentry-theme', t),
      arg: theme,
    });
    await page.goto(DS_URL, { waitUntil: 'networkidle' });
    await page.click('[data-sample="customer_churn.csv"]');
    await page.waitForSelector('#findings-list > *', { timeout: 60_000 });
    await page.waitForLoadState('networkidle');

    // Overview: dataset name, summary, checks by category, dataset overview.
    await page.evaluate(() => {
      const el = document.querySelector('#file-name');
      scrollTo(0, el.getBoundingClientRect().top + scrollY - 110);
    });
    await shot(page, `public/datasentry/datasentry-overview-${theme}.png`);

    // Findings: the leakage finding opened to show evidence and limitations.
    await page.click('#tab-findings');
    const leak = page.locator('#findings-list > *', { hasText: 'cancellation_code' }).first();
    const toggle = leak.locator('button[aria-expanded], summary').first();
    if (await toggle.count()) await toggle.click();
    await page.evaluate((y) => scrollTo(0, y), await leak.evaluate((el) => el.getBoundingClientRect().top + scrollY - 140));
    await shot(page, `public/datasentry/datasentry-findings-${theme}.png`);

    // ML checks: label review and the sample holdout overlap check.
    await page.click('#tab-ml');
    await page.click('#run-label-review');
    await page.waitForSelector('#label-review-results table', { timeout: 60_000 });
    await page.waitForSelector('#dashboard-busy', { state: 'hidden' });
    await page.click('#sample-holdout');
    await page.waitForFunction(() => {
      const out = document.querySelector('#overlap-results');
      return out.children.length && !out.textContent.includes('Comparing with');
    }, null, { timeout: 60_000 });
    await page.evaluate(() => {
      const el = document.querySelector('#panel-ml');
      scrollTo(0, el.getBoundingClientRect().top + scrollY - 140);
    });
    await shot(page, `public/datasentry/datasentry-ml-checks-${theme}.png`);
    await page.context().close();
  }
}

// ---------- TND ----------
async function tndResult() {
  if (existsSync(TND_RESULT)) return readFile(TND_RESULT, 'utf8');
  console.log('  running one real analysis (up to 3 minutes)...');
  const page = await newPage('dark', { fn: (api) => (window.TND_API_BASE_URL = api), arg: TND_API });
  await page.goto(`${TND_URL}/index.html`, { waitUntil: 'networkidle' });
  await page.getByRole('tab', { name: /text/i }).click();
  await page.fill(
    '#newsInput',
    'The James Webb Space Telescope launched on 25 December 2021 aboard an Ariane 5 rocket from Kourou, French Guiana. ' +
      'It operates near the second Sun-Earth Lagrange point, about 1.5 million kilometres from Earth. ' +
      'Its primary mirror is 6.5 metres across and is made of 18 hexagonal gold-coated beryllium segments.',
  );
  const terms = page.locator('#terms');
  if (await terms.count() && !(await terms.isChecked())) await terms.check();
  await page.click('#analyzeButton');
  await page.waitForURL(/results\.html/, { timeout: 200_000 });
  const saved = await page.evaluate(() => sessionStorage.getItem('tndAnalysisResult'));
  await mkdir(dirname(TND_RESULT), { recursive: true });
  await writeFile(TND_RESULT, saved);
  await page.context().close();
  return saved;
}

async function tnd() {
  const result = await tndResult();
  for (const theme of THEMES) {
    const page = await newPage(theme, {
      fn: ([t, r]) => {
        localStorage.setItem('tnd-theme', t);
        sessionStorage.setItem('tndAnalysisResult', r);
      },
      arg: [theme, result],
    });
    await page.goto(`${TND_URL}/results.html`, { waitUntil: 'networkidle' });
    await shot(page, `public/tnd/tnd-results-${theme}.png`);
    // The page is short, so clip from the claims card instead of scrolling to it.
    const top = await page.evaluate(() => {
      const el = document.querySelector('#claimsList').parentElement;
      return Math.max(0, el.getBoundingClientRect().top + scrollY - 32);
    });
    await shot(page, `public/tnd/tnd-evidence-${theme}.png`, { fullPage: true, clip: { x: 0, y: top, ...VIEWPORT } });
    await page.goto(`${TND_URL}/index.html`, { waitUntil: 'networkidle' });
    await shot(page, `public/tnd/tnd-home-${theme}.png`);
    await page.context().close();
  }
}

// ---------- FlowCast ----------
// The replay moment FlowCast's own screenshots use: Tuesday 12 June 2012, 16:30, 30 minutes.
async function flowCast() {
  for (const theme of THEMES) {
    const page = await newPage(theme);
    await page.goto(`${FC_URL}/models?t=2012-06-12T16:30&h=30&theme=${theme}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // entrance animations
    await shot(page, `public/flowcast/flowcast-models-${theme}.png`);
    await page.context().close();
  }
}

// ---------- CampusSignal ----------
// The demo student's view: home, their issue, and the notices list.
async function campusSignal() {
  if (!CS_PASSWORD) throw new Error('Set CS_PASSWORD to the demo accounts\' password.');
  for (const theme of THEMES) {
    const page = await newPage(theme, { fn: (t) => localStorage.setItem('campussignal.theme', t), arg: theme });
    await page.goto(`${CS_URL}/sign-in`, { waitUntil: 'networkidle' });
    await page.getByLabel('Email').fill(CS_EMAIL);
    await page.getByLabel('Password').fill(CS_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/\/home/);
    const issueId = await page.evaluate(async () => (await (await fetch('/api/v1/campus/issues')).json()).items[0].id);
    for (const [name, path] of [
      ['home', '/home'],
      ['issue', `/issues/${issueId}`],
      ['notices', '/notices'],
    ]) {
      await page.goto(`${CS_URL}${path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await shot(page, `public/campussignal/campussignal-${name}-${theme}.png`);
    }
    await page.context().close();
  }
}

if (want('datasentry')) {
  console.log('DataSentry');
  await dataSentry();
}
if (want('tnd')) {
  console.log('TND');
  await tnd();
}
if (want('flowcast')) {
  console.log('FlowCast');
  await flowCast();
}
if (want('campussignal')) {
  console.log('CampusSignal');
  await campusSignal();
}
await browser.close();
