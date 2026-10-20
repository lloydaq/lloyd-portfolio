// Captures every page at the five review viewports in both themes and reports
// horizontal overflow and console errors. Expects `npm run preview` running.
//   node scripts/screenshots.mjs [outDir]
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const out = process.argv[2] ?? '.impeccable/review';
const viewports = [
  ['desktop', 1440, 900],
  ['laptop', 1280, 800],
  ['tablet', 768, 1024],
  ['mobile', 390, 844],
  ['narrow', 360, 800],
];
const pages = [
  ['home', '/'],
  ['case', '/work/tnd/'],
  ['datasentry', '/work/datasentry/'],
];
const themes = (process.env.THEMES ?? 'dark,light').split(',');

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
let problems = 0;

for (const theme of themes) {
  for (const [vp, width, height] of viewports) {
    const context = await browser.newContext({
      viewport: { width, height },
      colorScheme: theme,
      reducedMotion: 'reduce',
    });
    for (const [name, path] of pages) {
      const page = await context.newPage();
      const errors = [];
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      page.on('pageerror', (e) => errors.push(String(e)));
      await page.goto(base + path, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `${out}/${name}-${vp}-${theme}-fold.png` });
      // Scroll through so lazy images load before the full-page capture.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += innerHeight) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        scrollTo(0, 0);
      });
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: `${out}/${name}-${vp}-${theme}.png`, fullPage: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (overflow > 0 || errors.length) problems++;
      console.log(`${name} ${vp} ${theme}: overflowX=${overflow} errors=${errors.length} ${errors.join(' | ')}`);
      await page.close();
    }
    await context.close();
  }
}

await browser.close();
process.exitCode = problems ? 1 : 0;
