import { describe, expect, it } from 'vitest';
import { screenshots as dataSentryShots } from './datasentry';
import { dataSentryRepo, profile, skills, tndRepo } from './site';
import { edges, screenshots as tndShots, stages, tnd } from './tnd';

// Every source file, read raw, so the exclusion and honesty checks cover
// components and pages as well as content.
const sources = import.meta.glob(['/src/**/*.{ts,tsx,css}', '/index.html', '/work/*/index.html'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// Paths of the images shipped in public/, for checking screenshot references.
const publicImages = Object.keys(import.meta.glob('/public/**/*.png'));

describe('content integrity', () => {
  it('scans the whole source tree (guards against a vacuous pass)', () => {
    const files = Object.keys(sources);
    expect(files.length).toBeGreaterThan(12);
    expect(files).toContain('/src/pages/Home.tsx');
    expect(files).toContain('/work/tnd/index.html');
    expect(files).toContain('/work/datasentry/index.html');
  });

  it('never mentions CampusSignal anywhere in the site source', () => {
    for (const [file, text] of Object.entries(sources)) {
      if (file.endsWith('.test.ts')) continue;
      expect(text.toLowerCase(), file).not.toContain('campussignal');
      expect(text.toLowerCase(), file).not.toContain('campus signal');
    }
  });

  it('never claims a database TND does not have', () => {
    for (const [file, text] of Object.entries(sources)) {
      if (file.endsWith('.test.ts')) continue;
      expect(text, file).not.toMatch(/sqlite/i);
    }
  });

  it('uses the confirmed contact details', () => {
    expect(profile.email).toBe('lloyd25dsouza@gmail.com');
    expect(profile.github).toBe('https://github.com/lloydaq');
    expect(profile.linkedin).toBe('https://www.linkedin.com/in/lloyddso');
    expect(tndRepo).toBe('https://github.com/lloydaq/TND-The-News-Detector');
    expect(dataSentryRepo).toBe('https://github.com/lloydaq/DataSentry');
  });

  it('uses the canonical TND name', () => {
    expect(tnd.name).toBe('Trustworthy News Detector');
  });

  it('has no skill scores or percentages', () => {
    for (const group of skills) {
      for (const item of group.items) expect(item).not.toMatch(/\d+\s*%|★|\/10/);
    }
  });

  it('has a diagram edge only between real stages, and every stage is connected', () => {
    const ids = new Set(stages.map((s) => s.id));
    for (const edge of edges) {
      expect(ids.has(edge.from)).toBe(true);
      expect(ids.has(edge.to)).toBe(true);
    }
    for (const stage of stages) {
      expect(edges.some((e) => e.from === stage.id || e.to === stage.id), stage.id).toBe(true);
    }
  });

  it('points every stage at at least one TND source file', () => {
    for (const stage of stages) {
      expect(stage.files.length).toBeGreaterThan(0);
      for (const file of stage.files) expect(file).toMatch(/^(backend\/app|frontend)\//);
    }
  });

  it('gives every project screenshot a distinct, existing file for each theme', () => {
    for (const shot of [...tndShots, ...dataSentryShots]) {
      expect(shot.light, shot.alt).not.toBe(shot.dark);
      for (const src of [shot.light, shot.dark]) {
        expect(publicImages, src).toContain(`/public${src}`);
      }
      expect(shot.alt).not.toMatch(/\b(dark|light) mode\b/i);
    }
  });
});
