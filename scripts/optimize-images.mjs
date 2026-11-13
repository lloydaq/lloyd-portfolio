// Builds responsive AVIF and WebP copies of every project screenshot in public/,
// next to the PNG they come from (tnd-home-dark.png -> tnd-home-dark-1280.avif, ...),
// and writes src/content/imageVariants.json listing the widths made for each PNG.
//
// The PNGs stay the source of truth and the fallback (and the full-size links).
// Run after adding or replacing a screenshot:  npm run images
import { readdir, stat, unlink, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import sharp from 'sharp';

const PUBLIC = new URL('../public/', import.meta.url).pathname;
const MANIFEST = new URL('../src/content/imageVariants.json', import.meta.url).pathname;
const WIDTHS = [640, 960, 1440, 1920, 2880];
const AVIF = { quality: 55, effort: 6 };
const WEBP = { quality: 80, effort: 5 };

const dirs = (await readdir(PUBLIC, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name);
const manifest = {};
let before = 0;
let after = 0;

for (const dir of dirs.sort()) {
  const files = await readdir(join(PUBLIC, dir));
  // Clear old variants so a removed width never lingers.
  for (const f of files) if (/-\d+\.(avif|webp)$/.test(f)) await unlink(join(PUBLIC, dir, f));
  for (const file of files.filter((f) => f.endsWith('.png')).sort()) {
    const src = join(PUBLIC, dir, file);
    const { width } = await sharp(src).metadata();
    const widths = WIDTHS.filter((w) => w < width).concat(width);
    const base = src.slice(0, -'.png'.length);
    for (const w of widths) {
      const img = sharp(src).resize({ width: w, withoutEnlargement: true });
      await img.clone().avif(AVIF).toFile(`${base}-${w}.avif`);
      await img.clone().webp(WEBP).toFile(`${base}-${w}.webp`);
    }
    manifest[`/${relative(PUBLIC, src)}`] = widths;
    before += (await stat(src)).size;
    after += (await stat(`${base}-${widths.at(-1)}.avif`)).size;
    console.log(`${dir}/${file}: ${widths.join(', ')}`);
  }
}

await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`\nFull-size PNG ${Math.round(before / 1024)} KB -> full-size AVIF ${Math.round(after / 1024)} KB`);
