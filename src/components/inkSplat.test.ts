import { describe, expect, it } from 'vitest';
import { farthestCorner, inkSplat, splatKeyframes, splatRadii } from './inkSplat';

const px = (value: string) => value.split(',').map((layer) => parseFloat(layer));

describe('inkSplat', () => {
  it('is deterministic per seed and varies between seeds', () => {
    expect(inkSplat(7).url).toBe(inkSplat(7).url);
    expect(inkSplat(7).url).not.toBe(inkSplat(8).url);
  });

  it('keeps the drop inside its box and reports a safe inner radius', () => {
    for (let seed = 0; seed < 200; seed++) {
      const radii = splatRadii(seed);
      const { minRadius, url } = inkSplat(seed);
      expect(Math.max(...radii)).toBeLessThanOrEqual(96);
      expect(minRadius).toBeLessThan(Math.min(...radii));
      expect(minRadius).toBeGreaterThan(30);
      const svg = decodeURIComponent(url.slice('url("data:image/svg+xml,'.length, -2));
      expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 -100 200 200">')).toBe(true);
      const shapes = svg.slice(svg.indexOf('<path'));
      const numbers = (shapes.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
      for (const n of numbers) expect(Math.abs(n)).toBeLessThanOrEqual(100);
    }
  });
});

describe('splatKeyframes', () => {
  const viewports = [
    { width: 1280, height: 800 },
    { width: 390, height: 844 },
  ];
  const origins = (w: number, h: number) => [
    { x: w - 30, y: 30 }, // the header toggle
    { x: w / 2, y: h / 2 },
    { x: 0, y: h },
  ];

  it('starts from nothing, only grows, and ends covering every corner', () => {
    for (const { width, height } of viewports) {
      for (const origin of origins(width, height)) {
        for (let seed = 0; seed < 25; seed++) {
          const splats = [inkSplat(seed), inkSplat(seed + 1000)] as [ReturnType<typeof inkSplat>, ReturnType<typeof inkSplat>];
          const frames = splatKeyframes(splats, origin, width, height);
          expect(frames[0]!.offset).toBe(0);
          expect(frames.at(-1)!.offset).toBe(1);
          expect(px(frames[0]!.maskSize as string)).toEqual([0, 0]);

          let previous = [0, 0];
          for (const frame of frames) {
            const [a, b] = px(frame.maskSize as string) as [number, number];
            expect(a).toBeGreaterThanOrEqual(previous[0]!);
            expect(b).toBeGreaterThanOrEqual(previous[1]!);
            previous = [a, b];
          }

          // Each layer alone reaches every corner with its innermost edge.
          const reach = farthestCorner(origin, width, height);
          splats.forEach((splat, layer) => {
            const size = previous[layer]!;
            expect((size / 2) * (splat.minRadius / 100)).toBeGreaterThanOrEqual(reach);
          });

          // Centred on the press point.
          const last = frames.at(-1)!;
          const position = px(last.maskPosition as string);
          expect(position[0]! + previous[0]! / 2).toBeCloseTo(origin.x, 1);
        }
      }
    }
  });
});
