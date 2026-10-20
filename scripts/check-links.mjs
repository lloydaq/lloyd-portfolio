// Checks every external URL the site links to. Reads them from the built HTML
// and JS in dist/, so run `npm run build` first.
//   node scripts/check-links.mjs
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

async function files(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await files(path)));
    else if (/\.(html|js)$/.test(entry.name)) out.push(path);
  }
  return out;
}

const text = (await Promise.all((await files('dist')).map((f) => readFile(f, 'utf8')))).join('\n');
// Trailing punctuation belongs to the surrounding sentence (e.g. the noscript text).
const urls = [
  ...new Set(
    (text.match(/https:\/\/(?:github\.com|www\.linkedin\.com)\/[^\s"'`<>)\\]+/g) ?? []).map((u) =>
      u.replace(/[.,;:]+$/, ''),
    ),
  ),
];
const mailtos = [...new Set(text.match(/mailto:[\w.+-]+@[\w.-]+\w/g) ?? [])];

// LinkedIn answers automated requests with status 999 whatever the URL, so a
// script cannot verify it; it is reported, not failed.
const unverifiable = (status) => status === 999;

let failed = 0;
for (const url of urls) {
  let status;
  try {
    const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'link-check' } });
    status = res.status;
  } catch (error) {
    status = `error: ${error.cause?.code ?? error.message}`;
  }
  const ok = status === 200;
  const note = unverifiable(status) ? ' (blocked for bots; check by hand)' : '';
  if (!ok && !unverifiable(status)) failed++;
  console.log(`${ok ? 'ok  ' : unverifiable(status) ? 'skip' : 'FAIL'} ${status} ${url}${note}`);
}
for (const m of mailtos) console.log(`info mailto ${m}`);
process.exitCode = failed ? 1 : 0;
