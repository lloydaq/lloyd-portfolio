// Renders /resume/ from the production build into public/lloyd-dsouza-resume.pdf,
// using the page's print styles (A4, light paper, one page). Run after editing
// src/content/resume.ts:  npm run resume:pdf
//
// Set CHROMIUM_PATH to use a Chromium other than Playwright's own.
//
// Private copy with a phone number (never committed: the site and its PDF are public):
//   RESUME_PHONE="+91 ..." RESUME_OUT=/somewhere/outside/public/resume.pdf npm run resume:pdf
import { readFile, stat } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { build, preview } from 'vite';

const PUBLIC_OUT = new URL('../public/lloyd-dsouza-resume.pdf', import.meta.url).pathname;
const PHONE = process.env.RESUME_PHONE?.trim();
const OUT = process.env.RESUME_OUT ?? PUBLIC_OUT;
if (PHONE && (OUT === PUBLIC_OUT || OUT.includes('/public/'))) {
  console.error('RESUME_PHONE needs RESUME_OUT outside public/: the public PDF must not carry a phone number.');
  process.exit(1);
}

await build({ logLevel: 'warn' });
const server = await preview({ preview: { port: 4174, strictPort: true, host: '127.0.0.1' }, logLevel: 'warn' });
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
try {
  const page = await browser.newPage();
  await page.emulateMedia({ media: 'print', colorScheme: 'light', reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:4174/resume/', { waitUntil: 'networkidle' });
  if (PHONE) {
    await page.evaluate((phone) => {
      const contact = document.querySelector('.cv-sheet__contact');
      const span = document.createElement('span');
      span.textContent = phone;
      contact?.firstElementChild?.after(span);
    }, PHONE);
  }
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: OUT, format: 'A4', printBackground: true, preferCSSPageSize: true, tagged: true, outline: true });
  const pdf = await readFile(OUT, 'latin1');
  const pages = (pdf.match(/\/Type\s*\/Page[^s]/g) ?? []).length;
  console.log(`Wrote ${OUT} (${Math.round((await stat(OUT)).size / 1024)} KB, ${pages} page${pages === 1 ? '' : 's'})`);
  if (pages !== 1) {
    console.error('The résumé no longer fits on one A4 page: shorten src/content/resume.ts.');
    process.exitCode = 1;
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
