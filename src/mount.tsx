import { StrictMode, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

/**
 * Renders a page synchronously. Each page's script is render-blocking (`blocking="render"`
 * in its HTML), so the browser paints, and a cross-page view transition snapshots, the
 * finished page rather than an empty root.
 */
export function mount(page: ReactNode): void {
  const root = createRoot(document.getElementById('root')!);
  flushSync(() => root.render(<StrictMode>{page}</StrictMode>));
}
