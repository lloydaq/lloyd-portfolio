import { createContext, domToCanvas } from 'modern-screenshot';

/**
 * Snapshot of the visible part of the page, as currently rendered.
 *
 * ink-bleed-theme-changer captures with html2canvas, which redraws text itself and so drops
 * this site's `font-stretch` widths and `color-mix()` colours. modern-screenshot renders a
 * clone through an SVG foreignObject, i.e. with the browser's own engine, so the snapshot
 * matches the page. It copies computed styles, so it can only capture the theme that is
 * live; the ink therefore covers the page with the old theme and reveals the real page.
 */
export interface Snapshot {
  canvas: HTMLCanvasElement;
  /** Texture px per CSS px. */
  scale: number;
  /** Page scroll (CSS px) at capture. */
  scrollX: number;
  scrollY: number;
}

/** Device-pixel ratio used for both the snapshots and the overlay canvas. */
export function renderScale(): number {
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  return Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
}

/** Elements drawn live above the overlay (the toggle): left as a hole in the snapshot. */
const LIVE_ATTR = 'data-ink-live';
/** Elements never captured (the overlay canvas itself). */
const IGNORE_ATTR = 'data-ink-ignore';
/** Marks sticky elements while cloning so the clone can pin them in place. */
const PIN_ATTR = 'data-ink-pin';
/** Content this far outside the viewport (CSS px) is still cloned: shadows, overflow. */
const CULL_MARGIN = 160;
const MEDIA_TIMEOUT_MS = 8000;

/** True when the element's own padding, border or formatting context stops child margins collapsing through it. */
function containsChildMargins(el: Element, cs: CSSStyleDeclaration): boolean {
  if (/flex|grid|flow-root|inline-block|table/.test(cs.display)) return true;
  if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') return true;
  if (cs.position === 'absolute' || cs.position === 'fixed' || cs.float !== 'none') return true;
  const top = parseFloat(cs.paddingTop) > 0 || parseFloat(cs.borderTopWidth) > 0;
  const bottom = parseFloat(cs.paddingBottom) > 0 || parseFloat(cs.borderBottomWidth) > 0;
  if (top && bottom) return true;
  // Only in-flow block children have vertical margins that can collapse through it.
  for (const child of Array.from(el.children)) {
    const c = getComputedStyle(child);
    if (c.display === 'none' || c.position === 'absolute' || c.position === 'fixed' || c.float !== 'none') continue;
    if (c.display === 'contents' || !c.display.startsWith('inline')) return false;
  }
  return true;
}

interface Plan {
  /** Elements cloned as sized empty boxes: entirely off screen, so their content can't show. */
  culled: Set<Element>;
  /** Elements left out of the clone entirely (display: none, so they take no space). */
  dropped: Set<Element>;
  /** Sticky elements and the offset (CSS px) at which they currently sit. */
  pins: Map<Element, number>;
}

/**
 * Walks the live DOM once. Skipping off-screen subtrees keeps the clone (the slow part)
 * small; an element is only emptied when its computed size can't depend on its children's
 * margins, so the layout of what is visible is unchanged.
 */
function plan(viewportHeight: number): Plan {
  const culled = new Set<Element>();
  const dropped = new Set<Element>();
  const pins = new Map<Element, number>();
  const keep = new Set<Element>();

  // Fixed elements are visible whatever their ancestors' boxes: never empty those.
  for (const el of document.body.querySelectorAll('*')) {
    if (getComputedStyle(el).position !== 'fixed') continue;
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) keep.add(a);
  }

  const walk = (parent: Element): void => {
    for (const el of Array.from(parent.children)) {
      if (el.hasAttribute(IGNORE_ATTR)) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none') {
        dropped.add(el);
        continue;
      }
      const rect = el.getBoundingClientRect();

      if (cs.position === 'sticky' && el instanceof HTMLElement) {
        // Its in-flow position, measured with stickiness off (static ignores the insets).
        const inline = el.style.getPropertyValue('position');
        const priority = el.style.getPropertyPriority('position');
        el.style.setProperty('position', 'static', 'important');
        const flow = el.getBoundingClientRect();
        if (inline) el.style.setProperty('position', inline, priority);
        else el.style.removeProperty('position');
        pins.set(el, rect.top - flow.top);
      }

      const offscreen = rect.bottom < -CULL_MARGIN || rect.top > viewportHeight + CULL_MARGIN;
      if (
        offscreen &&
        !keep.has(el) &&
        cs.position !== 'fixed' &&
        cs.position !== 'sticky' &&
        !cs.display.startsWith('inline') &&
        cs.display !== 'contents' &&
        containsChildMargins(el, cs)
      ) {
        culled.add(el);
        continue;
      }
      walk(el);
    }
  };
  walk(document.body);
  return { culled, dropped, pins };
}

function setImportant(style: CSSStyleDeclaration, props: Record<string, string>): void {
  for (const [name, value] of Object.entries(props)) style.setProperty(name, value, 'important');
}

/** Captures the viewport exactly as it is on screen now. */
export async function captureViewport(maxTextureSize: number): Promise<Snapshot> {
  const root = document.documentElement;
  const width = root.clientWidth;
  const height = root.clientHeight;
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  const scale = Math.min(renderScale(), maxTextureSize / width, maxTextureSize / height);
  const ground = getComputedStyle(root).getPropertyValue('--ground').trim() || getComputedStyle(document.body).backgroundColor;

  const { culled, dropped, pins } = plan(height);
  const pinned: Element[] = [];
  pins.forEach((_, el) => {
    el.setAttribute(PIN_ATTR, String(pinned.length));
    pinned.push(el);
  });

  try {
    // The context is created on an empty element: modern-screenshot would otherwise wait
    // for every <img> in the page, including lazy ones that are not due to load yet.
    const context = await createContext<HTMLElement>(document.createElement('div'), {
      width,
      height,
      scale,
      backgroundColor: ground,
      timeout: MEDIA_TIMEOUT_MS,
      autoDestruct: true,
      // The page is cloned in document coordinates; shift it so the viewport is at 0,0.
      style: { transform: `translate(${-scrollX}px, ${-scrollY}px)`, margin: '0' },
      filter: (node) => {
        if (node instanceof Element) {
          if (node.hasAttribute(IGNORE_ATTR) || dropped.has(node)) return false;
          if (node instanceof HTMLIFrameElement && node.id.startsWith('__SANDBOX__')) return false;
        }
        const parent = node.parentElement;
        return !(parent && culled.has(parent));
      },
      onCloneEachNode: (clone) => {
        if (!(clone instanceof HTMLElement || clone instanceof SVGElement)) return;
        const style = clone.style;
        if (clone.hasAttribute(LIVE_ATTR)) {
          // Keep its box (so nothing shifts) but leave it out of the picture.
          setImportant(style, { visibility: 'hidden' });
        }
        const pin = clone.getAttribute(PIN_ATTR);
        if (pin !== null) {
          clone.removeAttribute(PIN_ATTR);
          const el = pinned[Number(pin)];
          const offset = el ? (pins.get(el) ?? 0) : 0;
          // Nothing scrolls inside the clone, so stickiness becomes a fixed offset.
          setImportant(style, {
            position: 'relative',
            top: `${offset}px`,
            'inset-block-start': `${offset}px`,
            bottom: 'auto',
            'inset-block-end': 'auto',
          });
        } else if (style.getPropertyValue('position') === 'fixed') {
          // The clone's root is transformed, so fixed boxes sit in document coordinates.
          const top = parseFloat(style.getPropertyValue('top')) || 0;
          const left = parseFloat(style.getPropertyValue('left')) || 0;
          setImportant(style, {
            top: `${top + scrollY}px`,
            'inset-block-start': `${top + scrollY}px`,
            left: `${left + scrollX}px`,
            'inset-inline-start': `${left + scrollX}px`,
            bottom: 'auto',
            'inset-block-end': 'auto',
            right: 'auto',
            'inset-inline-end': 'auto',
          });
        }
        // Current animated values are already copied in; a running animation would restart
        // from its first keyframe (or, scroll-driven, from the clone's zero scroll).
        const animation = style.getPropertyValue('animation-name');
        if (animation && animation !== 'none') setImportant(style, { 'animation-name': 'none' });
        // Table boxes re-laid out from copied sizes come out taller (a table's computed
        // height includes its caption, but `height` sizes the grid without it). Let the
        // table lay itself out again from the same content and its own copied width.
        const display = style.getPropertyValue('display');
        if (/^(inline-)?table/.test(display)) {
          const names = display === 'table' || display === 'inline-table' ? ['height', 'block-size'] : ['width', 'inline-size', 'height', 'block-size'];
          for (const name of names) style.removeProperty(name);
        }
      },
    });
    context.node = document.body;
    const canvas = await domToCanvas(context);
    return { canvas, scale: canvas.width / width, scrollX, scrollY };
  } finally {
    for (const el of pinned) el.removeAttribute(PIN_ATTR);
  }
}
