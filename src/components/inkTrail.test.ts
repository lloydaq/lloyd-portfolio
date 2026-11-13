import { describe, expect, it } from 'vitest';
import { InkLayer, TRAIL_LIFE, inkColour, widthFor } from './inkTrail';

const accent: [number, number, number] = [224, 168, 79];
const ground: [number, number, number] = [22, 22, 26];

describe('inkColour', () => {
  it('starts at the accent and dries to the page ground', () => {
    expect(inkColour(accent, ground, 0, 1000)).toBe('rgb(224,168,79)');
    expect(inkColour(accent, ground, 1000, 1000)).toBe('rgb(22,22,26)');
    expect(inkColour(accent, ground, 5000, 1000)).toBe('rgb(22,22,26)');
  });
});

describe('widthFor', () => {
  it('runs thin when fast and pools when slow, within bounds', () => {
    let fast = 5;
    let slow = 5;
    for (let i = 0; i < 20; i++) {
      fast = widthFor(5, fast);
      slow = widthFor(0.05, slow);
    }
    expect(fast).toBeCloseTo(1.6, 1);
    expect(slow).toBeGreaterThan(6.5);
    expect(slow).toBeLessThanOrEqual(7);
  });
});

describe('InkLayer', () => {
  it('records a stroke while drawing and lets it dry away afterwards', () => {
    const ink = new InkLayer();
    expect(ink.active()).toBe(false);
    ink.start(10, 10, 0);
    ink.move(40, 10, 16);
    ink.move(80, 30, 32);
    expect(ink.drawing).toBe(true);
    expect(ink.travelled).toBeGreaterThan(70);
    ink.end();
    expect(ink.drawing).toBe(false);
    ink.update(100);
    expect(ink.active()).toBe(true);
    ink.update(32 + TRAIL_LIFE + 1);
    expect(ink.active()).toBe(false);
  });

  it('pools a blot when the pen is held still, once', () => {
    const ink = new InkLayer();
    ink.start(0, 0, 0);
    ink.update(400);
    ink.update(800);
    ink.end();
    // The stroke's single point dries; the blot outlives it.
    ink.update(TRAIL_LIFE + 10);
    expect(ink.active()).toBe(true);
    ink.update(10_000);
    expect(ink.active()).toBe(false);
  });

  it('splashes blots inside the viewport', () => {
    const ink = new InkLayer();
    let seed = 1;
    const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    ink.splash(1000, 800, 0, random);
    expect(ink.active()).toBe(true);
  });
});
