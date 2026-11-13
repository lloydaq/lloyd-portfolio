import { useEffect, useRef, useState } from 'react';
import type { Screenshot } from '../content/site';
import { ArrowUpRight } from './Icons';
import { useTheme } from './theme';

interface ThemedShotProps {
  shot: Screenshot;
  className?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * A project screenshot that matches the site theme. Only the matching file is
 * requested up front; once it has loaded, the other theme's file is fetched in
 * the background so a theme switch swaps the image without a blank frame.
 */
export function ThemedShot({ shot, className, loading = 'lazy' }: ThemedShotProps) {
  const theme = useTheme();
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  const other = theme === 'dark' ? shot.light : shot.dark;

  // Served from cache, the image can finish before React listens for load.
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const img = new Image();
    img.decoding = 'async';
    img.src = other;
  }, [loaded, other]);

  return (
    <img
      ref={ref}
      className={className}
      src={shot[theme]}
      width={shot.width}
      height={shot.height}
      alt={shot.alt}
      loading={loading}
      decoding="async"
      data-loaded={loaded}
      onLoad={() => setLoaded(true)}
      onError={() => setLoaded(true)}
    />
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
