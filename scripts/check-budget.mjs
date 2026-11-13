// Performance budget for the built site (run after `npm run build`; `npm run build` runs it).
// Fails when a page's JavaScript or CSS grows past its budget, when a screenshot has no
// AVIF/WebP copies, or when any copy is larger than it should be.
import { readFile, readdir, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const KB = 1024;

/** Gzipped bytes a first visit downloads for each page, excluding fonts and images. */
const BUDGET = {
  js: 110 * KB,
  css: 16 * KB,
  html: 4 * KB,
};
/** Largest any single responsive copy may be. */
const MAX_VARIANT = 220 * KB;
/** Largest copy a phone (up to 960px of image) should be served. */
const MAX_PHONE_VARIANT = 90 * KB;

const failures = [];
const gz = async (file) => gzipSync(await readFile(file), { level: 9 }).length;
const fmt = (n) => `${(n / KB).toFixed(1)} KB`;

// ---------- Pages ----------
const pages = ['index.html', 'resume/index.html', ...(await readdir(join(DIST, 'work'))).map((d) => `work/${d}/index.html`)];
const rows = [];
for (const page of pages) {
  const html = await readFile(join(DIST, page), 'utf8');
  const assets = new Set(
    [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.(?:js|css))"/g)].map((m) => m[1]),
  );
  // Follow static imports between chunks, which the browser fetches too.
  const queue = [...assets].filter((a) => a.endsWith('.js'));
  while (queue.length) {
    const js = await readFile(join(DIST, queue.pop()), 'utf8');
    for (const [, dep] of js.matchAll(/(?:from|import)\s*"\.\/([^"]+\.js)"/g)) {
      const path = `/assets/${dep}`;
      if (!assets.has(path)) {
        assets.add(path);
        queue.push(path);
      }
    }
  }
  const size = { js: 0, css: 0, html: await gz(join(DIST, page)) };
  for (const a of assets) size[a.endsWith('.js') ? 'js' : 'css'] += await gz(join(DIST, a));
  rows.push({ page, ...size });
  for (const kind of /** @type {const} */ (['js', 'css', 'html'])) {
    if (size[kind] > BUDGET[kind]) failures.push(`${page}: ${kind} ${fmt(size[kind])} gzipped, budget ${fmt(BUDGET[kind])}`);
  }
}

console.log('Page                              JS (gz)    CSS (gz)   HTML (gz)');
for (const r of rows) console.log(`${r.page.padEnd(32)} ${fmt(r.js).padStart(9)} ${fmt(r.css).padStart(10)} ${fmt(r.html).padStart(10)}`);

// ---------- Screenshots ----------
const manifest = JSON.parse(await readFile(new URL('../src/content/imageVariants.json', import.meta.url), 'utf8'));
let largestPhone = 0;
for (const dir of await readdir(join(DIST))) {
  const full = join(DIST, dir);
  if (dir === 'assets' || dir === 'work' || dir === 'resume' || !(await stat(full)).isDirectory()) continue;
  for (const file of await readdir(full)) {
    if (!file.endsWith('.png')) continue;
    const png = `/${dir}/${file}`;
    const widths = manifest[png];
    if (!widths) {
      failures.push(`${png}: no AVIF/WebP copies (run npm run images)`);
      continue;
    }
    for (const w of widths) {
      for (const format of ['avif', 'webp']) {
        const variant = join(full, `${file.slice(0, -4)}-${w}.${format}`);
        const bytes = await stat(variant).then((s) => s.size, () => -1);
        if (bytes < 0) failures.push(`${png}: missing ${w}w ${format}`);
        else if (bytes > MAX_VARIANT) failures.push(`${png}: ${w}w ${format} is ${fmt(bytes)}, limit ${fmt(MAX_VARIANT)}`);
        else if (w <= 960 && format === 'avif') {
          largestPhone = Math.max(largestPhone, bytes);
          if (bytes > MAX_PHONE_VARIANT) failures.push(`${png}: ${w}w avif is ${fmt(bytes)}, phone limit ${fmt(MAX_PHONE_VARIANT)}`);
        }
      }
    }
  }
}
console.log(`\nScreenshots: ${Object.keys(manifest).length} with responsive copies; largest phone-size AVIF ${fmt(largestPhone)}`);

if (failures.length) {
  console.error(`\nPerformance budget exceeded:\n  ${failures.join('\n  ')}`);
  process.exit(1);
}
console.log('Performance budget: OK');
