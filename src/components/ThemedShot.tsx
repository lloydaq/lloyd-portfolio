import { useEffect, useRef, useState } from 'react';
import variantWidths from '../content/imageVariants.json';
import type { Screenshot } from '../content/site';
import { ArrowUpRight } from './Icons';
import { useTheme } from './theme';

/** Widths of the AVIF/WebP copies made for each PNG (scripts/optimize-images.mjs). */
const variants: Record<string, number[] | undefined> = variantWidths;

/** `sizes` for a screenshot as wide as the page container (the home page's projects). */
export const SIZES_FULL = '(min-width: 90rem) 1344px, 94vw';
/** `sizes` for a case study's lead screenshot, beside the 12rem contents column. */
export const SIZES_GALLERY_LEAD = '(min-width: 90rem) 1080px, (min-width: 64rem) calc(100vw - 20rem), 94vw';
/** `sizes` for a case study's half-width screenshots. */
export const SIZES_GALLERY_TILE =
  '(min-width: 90rem) 530px, (min-width: 64rem) calc(50vw - 10rem), (min-width: 48rem) 46vw, 94vw';

function srcSet(png: string, format: 'avif' | 'webp'): string | undefined {
  const widths = variants[png];
  if (!widths) return undefined;
  const base = png.slice(0, -'.png'.length);
  return widths.map((w) => `${base}-${w}.${format} ${w}w`).join(', ');
}

/** `<source>` elements for one PNG: AVIF first, WebP for browsers without it. */
function sourcesFor(png: string) {
  return (['avif', 'webp'] as const).flatMap((format) => {
    const set = srcSet(png, format);
    return set ? [{ type: `image/${format}`, srcSet: set }] : [];
  });
}

/**
 * Fetches the file the browser would pick for `png` at this size, so a later theme switch
 * finds it in the cache. A detached <picture> runs the same source selection as the page.
 */
function preload(png: string, sizes: string): void {
  const picture = document.createElement('picture');
  for (const { type, srcSet } of sourcesFor(png)) {
    const source = document.createElement('source');
    source.type = type;
    source.srcset = srcSet;
    source.sizes = sizes;
    picture.append(source);
  }
  const img = document.createElement('img');
  img.decoding = 'async';
  picture.append(img);
  img.src = png;
}

interface ThemedShotProps {
  shot: Screenshot;
  className?: string;
  loading?: 'lazy' | 'eager';
  /** The rendered width, so the browser downloads no more pixels than it shows. */
  sizes?: string;
}

/**
 * A project screenshot that matches the site theme. The browser picks an AVIF (or WebP)
 * copy sized for the screen; the PNG is the fallback. Only the matching theme is
 * requested up front; once it has loaded, the other theme's file is fetched in the
 * background so a theme switch swaps the image without a blank frame.
 */
export function ThemedShot({ shot, className, loading = 'lazy', sizes = SIZES_FULL }: ThemedShotProps) {
  const theme = useTheme();
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  const png = shot[theme];
  const other = theme === 'dark' ? shot.light : shot.dark;

  // Served from cache, the image can finish before React listens for load.
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) preload(other, sizes);
  }, [loaded, other, sizes]);

  return (
    <picture>
      {sourcesFor(png).map((s) => (
        <source key={s.type} type={s.type} srcSet={s.srcSet} sizes={sizes} />
      ))}
      <img
        ref={ref}
        className={className}
        src={png}
        width={shot.width}
        height={shot.height}
        alt={shot.alt}
        loading={loading}
        decoding="async"
        data-loaded={loaded}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
    </picture>
  );
}

/** Opens the full-size file for the current theme; shown on phones only (see .figure__full). */
export function FullSizeLink({ shot }: { shot: Screenshot }) {
  const theme = useTheme();
  return (
    <a className="figure__full" href={shot[theme]}>
      Open full-size screenshot <ArrowUpRight />
    </a>
  );
}
