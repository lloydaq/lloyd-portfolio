// Renders public/og.png (1200x630), the social preview image, from HTML using
// the site's own fonts and palette. Re-run after changing the name or headline.
//   node scripts/make-og.mjs
import { readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const font = (await readFile('node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2')).toString('base64');

const html = `<!doctype html><html><head><style>
@font-face { font-family: A; src: url(data:font/woff2;base64,${font}) format('woff2'); font-weight: 100 900; font-stretch: 62% 125%; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #16161a; color: #ede6da; font-family: A; padding: 72px 80px; display: flex; flex-direction: column; }
.top { display: flex; justify-content: space-between; color: #a39e94; font-size: 22px; font-stretch: 78%; font-weight: 600; border-bottom: 1px solid #4d4d55; padding-bottom: 18px; }
h1 { margin-top: 64px; font-size: 128px; font-stretch: 125%; font-weight: 700; letter-spacing: -0.035em; line-height: 0.92; }
p { margin-top: 36px; font-size: 44px; font-weight: 560; letter-spacing: -0.015em; }
.rule { margin-top: auto; display: flex; align-items: center; gap: 0; }
.rule span { width: 120px; height: 36px; border: 1.5px solid #4d4d55; }
.rule span.on { border: 2px solid #e0a84f; }
.rule i { width: 40px; border-top: 1.5px solid #4d4d55; }
</style></head><body>
<div class="top"><span>AI/ML engineering student</span><span>github.com/lloydaq</span></div>
<h1>Lloyd D'Souza</h1>
<p>I build AI software that shows its work.</p>
<div class="rule"><span></span><i></i><span></span><i></i><span class="on"></span><i></i><span></span><i></i><span></span><i></i><span></span></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og.png' });
await browser.close();
console.log('wrote public/og.png');
