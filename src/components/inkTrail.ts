/**
 * Ink drawn on the background grid: hold the mouse down on empty page and drag to leave a
 * trail, pause to let a blot pool, and watch both dry back into the paper.
 *
 * Ink is drawn opaque and its colour moves from the accent to the page ground as it dries,
 * rather than fading its alpha. Overlapping round joints then never show as darker beads,
 * and the grid (drawn on top) reads as printed over the ink.
 */

/** Event that splashes ink at random on the grid (the `ink` easter egg). */
export const INK_SPLASH_EVENT = 'ink:splash';

export type RGB = [number, number, number];

interface InkPoint {
  x: number;
  y: number;
  t: number;
  /** Stroke width at this point (px): slow strokes pool wider, fast ones run thin. */
  w: number;
}

interface Blot {
  x: number;
  y: number;
  born: number;
  /** Radius when fully spread (px). */
  r: number;
  life: number;
}

/** How long a stroke takes to dry completely (ms). */
export const TRAIL_LIFE = 2600;
const BLOT_LIFE = 3400;
const SPREAD_MS = 650;
const MIN_W = 1.6;
const MAX_W = 7;
/** Still for this long while pressed, the pen pools a blot. */
const POOL_MS = 160;
const MAX_POINTS = 600;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const easeOut = (t: number) => 1 - (1 - t) ** 3;

/** Accent at age 0, ground once dry; drying slows towards the end like real ink. */
export function inkColour(accent: RGB, ground: RGB, age: number, life: number): string {
  const t = clamp(age / life, 0, 1) ** 1.6;
  const c = accent.map((a, i) => Math.round(a + (ground[i]! - a) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

/** Width from pointer speed (px/ms), smoothed against the previous width. */
export function widthFor(speed: number, previous: number): number {
  const target = clamp(MAX_W - speed * 3.2, MIN_W, MAX_W);
  return previous + (target - previous) * 0.35;
}

export class InkLayer {
  private strokes: InkPoint[][] = [];
  private blots: Blot[] = [];
  private stroke: InkPoint[] | null = null;
  private lastMove = 0;
  private pooled = false;
  /** Distance the current stroke has travelled, to tell a drag from a click. */
  travelled = 0;

  get drawing(): boolean {
    return this.stroke !== null;
  }

  start(x: number, y: number, now: number): void {
    this.stroke = [{ x, y, t: now, w: MAX_W * 0.7 }];
    this.strokes.push(this.stroke);
    this.lastMove = now;
    this.pooled = false;
    this.travelled = 0;
  }

  move(x: number, y: number, now: number): void {
    const stroke = this.stroke;
    if (!stroke) return;
    const last = stroke[stroke.length - 1]!;
    const dist = Math.hypot(x - last.x, y - last.y);
    if (dist < 1.5) return;
    const dt = Math.max(1, now - last.t);
    stroke.push({ x, y, t: now, w: widthFor(dist / dt, last.w) });
    this.travelled += dist;
    this.lastMove = now;
    this.pooled = false;
    if (stroke.length > MAX_POINTS) stroke.splice(0, stroke.length - MAX_POINTS);
  }

  end(): void {
    this.stroke = null;
  }

  /** A few blots and droplets at random spots, for the `ink` easter egg. */
  splash(width: number, height: number, now: number, random = Math.random): void {
    for (let i = 0; i < 3; i++) {
      const x = width * (0.15 + random() * 0.7);
      const y = height * (0.2 + random() * 0.6);
      const r = 26 + random() * 34;
      this.blots.push({ x, y, born: now + i * 140, r, life: BLOT_LIFE + 800 });
      for (let j = 0, n = 5 + Math.floor(random() * 6); j < n; j++) {
        const angle = random() * Math.PI * 2;
        const dist = r * (1.25 + random() * 1.1);
        this.blots.push({
          x: x + Math.cos(angle) * dist,
          y: y + Math.sin(angle) * dist,
          born: now + i * 140 + 60,
          r: 1.5 + random() * 4,
          life: BLOT_LIFE,
        });
      }
    }
  }

  /** True while anything is still wet or a stroke is in progress. */
  active(): boolean {
    return this.stroke !== null || this.strokes.length > 0 || this.blots.length > 0;
  }

  /** Drops dried ink and pools a blot under a pen held still. */
  update(now: number): void {
    const stroke = this.stroke;
    if (stroke && !this.pooled && now - this.lastMove > POOL_MS) {
      const p = stroke[stroke.length - 1]!;
      this.blots.push({ x: p.x, y: p.y, born: now, r: p.w * 1.9 + 3, life: BLOT_LIFE });
      this.pooled = true;
    }
    for (const s of this.strokes) {
      // A held stroke keeps its points; others lose them as they dry.
      if (s === stroke) continue;
      while (s.length > 0 && now - s[0]!.t > TRAIL_LIFE) s.shift();
    }
    this.strokes = this.strokes.filter((s) => s.length > 0);
    this.blots = this.blots.filter((b) => now - b.born < b.life);
  }

  draw(ctx: CanvasRenderingContext2D, now: number, accent: RGB, ground: RGB): void {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const s of this.strokes) {
      if (s.length === 1) {
        const p = s[0]!;
        ctx.fillStyle = inkColour(accent, ground, now - p.t, TRAIL_LIFE);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      for (let i = 1; i < s.length; i++) {
        const a = s[i - 1]!;
        const b = s[i]!;
        const age = now - b.t;
        // Ink thins slightly as it soaks in.
        ctx.lineWidth = b.w * (1 - 0.35 * clamp(age / TRAIL_LIFE, 0, 1));
        ctx.strokeStyle = inkColour(accent, ground, age, TRAIL_LIFE);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
    for (const b of this.blots) {
      const age = now - b.born;
      if (age < 0) continue;
      const r = b.r * (0.35 + 0.65 * easeOut(Math.min(1, age / SPREAD_MS)));
      ctx.fillStyle = inkColour(accent, ground, age, b.life);
      ctx.beginPath();
      ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
