import { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  born: number;
}

type RGB = [number, number, number];

interface GridNode {
  pt: Point;
  proximity: number;
}

const CELL_SIZE = 55;
const INFLUENCE_RADIUS = 260;
const MAX_WARP = 24;
const DOT_SPACING = 28;
const LERP_SPEED = 0.08;
const NODE_BASE_RADIUS = 1.8;
const NODE_ACTIVE_RADIUS = 3.2;
const OFFSCREEN = -9999;
const TAU = Math.PI * 2;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (t: number) => t * t * (3 - 2 * t);
const rgba = ([r, g, b]: RGB, a: number) => `rgba(${r},${g},${b},${a.toFixed(3)})`;

function mix(base: RGB, baseAlpha: number, active: RGB, activeAlpha: number, t: number) {
  return rgba(
    [
      Math.round(lerp(base[0], active[0], t)),
      Math.round(lerp(base[1], active[1], t)),
      Math.round(lerp(base[2], active[2], t)),
    ],
    lerp(baseAlpha, activeAlpha, t),
  );
}

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.trim().slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Displaces one grid intersection away from the cursor and along any passing ripple. */
function warp(
  gx: number,
  gy: number,
  col: number,
  row: number,
  cols: number,
  rows: number,
  mouse: Point,
  ripples: Ripple[],
): GridNode {
  // Boundary rows and columns stay pinned so the grid never tears from the edge.
  const edgeMargin = 1.5;
  const colPin = Math.min(col / edgeMargin, (cols - 1 - col) / edgeMargin, 1);
  const rowPin = Math.min(row / edgeMargin, (rows - 1 - row) / edgeMargin, 1);
  const pin = colPin * colPin * rowPin * rowPin;

  const dx = gx - mouse.x;
  const dy = gy - mouse.y;
  const dist = Math.hypot(dx, dy);
  const proximity = Math.max(0, 1 - dist / INFLUENCE_RADIUS) * pin;

  let rx = 0;
  let ry = 0;
  for (const r of ripples) {
    const rdx = gx - r.x;
    const rdy = gy - r.y;
    const diff = Math.hypot(rdx, rdy) - r.radius;
    const waveWidth = 55;
    if (Math.abs(diff) < waveWidth) {
      const strength = (1 - Math.abs(diff) / waveWidth) * r.opacity * 18 * pin;
      const angle = Math.atan2(rdy, rdx);
      const sign = diff < 0 ? 1 : -1;
      rx += Math.cos(angle) * strength * sign;
      ry += Math.sin(angle) * strength * sign;
    }
  }

  if (dist < INFLUENCE_RADIUS && dist > 0 && pin > 0) {
    const t = dist / INFLUENCE_RADIUS;
    const eased = t < 0.01 ? 0 : (1 - t) * (1 - t) * Math.min(1, dist / 60);
    const amount = eased * MAX_WARP * pin;
    const angle = Math.atan2(dy, dx);
    return {
      pt: { x: gx - Math.cos(angle) * amount + rx, y: gy - Math.sin(angle) * amount + ry },
      proximity,
    };
  }
  return { pt: { x: gx + rx, y: gy + ry }, proximity };
}

/**
 * Page background: a hairline grid that bends away from the pointer and ripples on click.
 * Colours come from the theme tokens; with reduced motion it is drawn once and stays still.
 * The loop runs only while the grid is moving.
 */
export function KineticGrid() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mouse: Point = { x: OFFSCREEN, y: OFFSCREEN };
    const target: Point = { x: OFFSCREEN, y: OFFSCREEN };
    const ripples: Ripple[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let ink: RGB = [237, 230, 218];
    let accent: RGB = [224, 168, 79];

    const readColours = () => {
      const style = getComputedStyle(document.documentElement);
      ink = hexToRgb(style.getPropertyValue('--ink'));
      accent = hexToRgb(style.getPropertyValue('--accent'));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = rgba(ink, 0.05);
      ctx.beginPath();
      for (let x = DOT_SPACING / 2; x < w; x += DOT_SPACING) {
        for (let y = DOT_SPACING / 2; y < h; y += DOT_SPACING) {
          ctx.moveTo(x + 0.7, y);
          ctx.arc(x, y, 0.7, 0, TAU);
        }
      }
      ctx.fill();

      for (const r of ripples) {
        const age = (now - r.born) / 1000;
        r.radius = Math.max(0, age * 400);
        r.opacity = Math.max(0, 1 - age * 1.2);
      }
      ripples.splice(0, ripples.length, ...ripples.filter((r) => r.opacity > 0));

      const cols = Math.max(2, Math.ceil(w / CELL_SIZE)) + 1;
      const rows = Math.max(2, Math.ceil(h / CELL_SIZE)) + 1;
      const cellW = w / (cols - 1);
      const cellH = h / (rows - 1);
      const grid: GridNode[][] = [];
      for (let row = 0; row < rows; row++) {
        const line: GridNode[] = [];
        for (let col = 0; col < cols; col++) {
          line.push(warp(col * cellW, row * cellH, col, row, cols, rows, mouse, ripples));
        }
        grid.push(line);
      }

      // Resting segments share one path; only those near the pointer get their own stroke.
      const lit: [Point, Point, number][] = [];
      ctx.beginPath();
      const segment = (a: GridNode, b: GridNode) => {
        const t = smoothstep((a.proximity + b.proximity) / 2);
        if (t > 0.001) {
          lit.push([a.pt, b.pt, t]);
        } else {
          ctx.moveTo(a.pt.x, a.pt.y);
          ctx.lineTo(b.pt.x, b.pt.y);
        }
      };
      grid.forEach((line, row) => {
        const above = grid[row - 1];
        line.forEach((node, col) => {
          const left = line[col - 1];
          const up = above?.[col];
          if (left) segment(left, node);
          if (up) segment(up, node);
        });
      });
      ctx.lineCap = 'butt';
      ctx.strokeStyle = rgba(ink, 0.13);
      ctx.lineWidth = 0.8;
      ctx.stroke();
      for (const [a, b, t] of lit) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = mix(ink, 0.13, accent, 0.9, t);
        ctx.lineWidth = lerp(0.8, 1.5, t);
        ctx.stroke();
      }

      ctx.fillStyle = rgba(ink, 0.2);
      ctx.beginPath();
      const litNodes: [Point, number][] = [];
      for (const { pt: p, proximity } of grid.flat()) {
        const t = smoothstep(proximity);
        if (t > 0.001) {
          litNodes.push([p, t]);
        } else {
          ctx.moveTo(p.x + NODE_BASE_RADIUS, p.y);
          ctx.arc(p.x, p.y, NODE_BASE_RADIUS, 0, TAU);
        }
      }
      ctx.fill();
      for (const [p, t] of litNodes) {
        const r = lerp(NODE_BASE_RADIUS, NODE_ACTIVE_RADIUS, t);
        if (t > 0.3) {
          const glowR = r + lerp(0, 6, (t - 0.3) / 0.7);
          const glow = ctx.createRadialGradient(p.x, p.y, r * 0.5, p.x, p.y, glowR);
          glow.addColorStop(0, rgba(accent, t * 0.3));
          glow.addColorStop(1, rgba(accent, 0));
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowR, 0, TAU);
          ctx.fillStyle = glow;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, TAU);
        ctx.fillStyle = mix(ink, 0.2, accent, 1, t);
        ctx.fill();
      }

      ctx.lineWidth = 1.5;
      for (const r of ripples) {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, TAU);
        ctx.strokeStyle = rgba(accent, r.opacity * 0.28);
        ctx.stroke();
      }
    };

    const moving = () =>
      ripples.length > 0 || Math.abs(mouse.x - target.x) > 0.5 || Math.abs(mouse.y - target.y) > 0.5;

    const frame = (now: number) => {
      raf = 0;
      mouse.x = lerp(mouse.x, target.x, LERP_SPEED);
      mouse.y = lerp(mouse.y, target.y, LERP_SPEED);
      if (!moving()) {
        mouse.x = target.x;
        mouse.y = target.y;
      }
      draw(now);
      if (moving()) raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (reduce.matches || e.pointerType === 'touch') return;
      // Enter at the pointer instead of sweeping in from the off-screen rest position.
      if (target.x === OFFSCREEN) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      }
      target.x = e.clientX;
      target.y = e.clientY;
      wake();
    };

    const onPointerLeave = () => {
      mouse.x = target.x = OFFSCREEN;
      mouse.y = target.y = OFFSCREEN;
      wake();
    };

    const onClick = (e: MouseEvent) => {
      // detail is 0 for keyboard-activated clicks, which have no meaningful position.
      if (reduce.matches || e.detail === 0) return;
      ripples.push({ x: e.clientX, y: e.clientY, radius: 0, opacity: 1, born: performance.now() });
      wake();
    };

    const onResize = () => {
      resize();
      wake();
    };

    const onThemeChange = () => {
      readColours();
      wake();
    };

    const onMotionChange = () => {
      if (reduce.matches) {
        ripples.length = 0;
        onPointerLeave();
      }
    };

    readColours();
    resize();
    wake();

    const themeObserver = new MutationObserver(onThemeChange);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('click', onClick);
    reduce.addEventListener('change', onMotionChange);

    return () => {
      themeObserver.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('click', onClick);
      reduce.removeEventListener('change', onMotionChange);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} className="kinetic-grid" aria-hidden="true" />;
}
