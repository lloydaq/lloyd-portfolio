import { describe, expect, it } from 'vitest';
import { campusSignal, screenshots as campusSignalShots } from './campussignal';
import { dataSentry, screenshots as dataSentryShots } from './datasentry';
import { flowCast, features as flowCastFeatures, results, screenshots as flowCastShots } from './flowcast';
import {
  campusSignalRepo,
  dataSentryRepo,
  flowCastPath,
  flowCastRepo,
  nextProject,
  profile,
  projectOrder,
  skills,
  tndRepo,
} from './site';
import { projectSummaryText } from './summary';
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
    expect(files).toContain('/work/flowcast/index.html');
    expect(files).toContain('/work/campussignal/index.html');
  });

  it('links CampusSignal only through its current repository, never the older one', () => {
    for (const [file, text] of Object.entries(sources)) {
      if (file.endsWith('.test.ts')) continue;
      for (const url of text.match(/github\.com\/lloydaq\/campussignal[\w-]*/gi) ?? []) {
        expect(url, file).toBe('github.com/lloydaq/CampusSignal-pro');
      }
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
    expect(flowCastRepo).toBe('https://github.com/lloydaq/flowcast');
    expect(campusSignalRepo).toBe('https://github.com/lloydaq/CampusSignal-pro');
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
    for (const shot of [...tndShots, ...dataSentryShots, ...flowCastShots, ...campusSignalShots]) {
      expect(shot.light, shot.alt).not.toBe(shot.dark);
      for (const src of [shot.light, shot.dark]) {
        expect(publicImages, src).toContain(`/public${src}`);
      }
      expect(shot.alt).not.toMatch(/\b(dark|light) mode\b/i);
    }
  });

  it('reports FlowCast errors that are ordered as its metrics say', () => {
    // Error grows with the horizon for the learned models, and DCRNN is lowest at each one.
    const mae = (model: string) => results.find(([m]) => m === model)!.slice(1).map(Number);
    for (const model of ['LightGBM', 'DCRNN']) {
      const row = mae(model);
      for (let i = 1; i < row.length; i++) expect(row[i]!).toBeGreaterThan(row[i - 1]!);
    }
    for (let h = 0; h < 4; h++) {
      const best = Math.min(...results.map(([, ...r]) => Number(r[h])));
      expect(mae('DCRNN')[h]).toBe(best);
    }
  });
});

describe('project order and summaries', () => {
  it('lists each project once, with the tagline its content file uses', () => {
    expect(projectOrder.map((p) => p.id)).toEqual(['tnd', 'datasentry', 'flowcast', 'campussignal']);
    expect(projectOrder.map((p) => p.tagline)).toEqual([
      tnd.tagline,
      dataSentry.tagline,
      flowCast.tagline,
      campusSignal.tagline,
    ]);
  });

  it('links each case study to the next project, wrapping at the end', () => {
    expect(projectOrder.map((p) => nextProject(p.id).id)).toEqual(['datasentry', 'flowcast', 'campussignal', 'tnd']);
  });

  it('builds a plain-text summary with absolute links and no invented fields', () => {
    const text = projectSummaryText(
      {
        title: flowCast.name,
        summary: flowCast.summary,
        features: flowCastFeatures,
        caseStudy: flowCastPath,
        repo: flowCastRepo,
        demo: flowCast.demo,
      },
      'https://example.test',
    );
    expect(text.split('\n')[0]).toBe('FlowCast');
    expect(text).toContain(`Stack: ${flowCast.stack}`);
    expect(text).toContain('Status: Release v1.0.0');
    expect(text).toContain('Case study: https://example.test/work/flowcast/');
    expect(text).toContain(`Code: ${flowCastRepo}`);
    expect(text).toContain(`Live demo: ${flowCast.demo}`);
    expect(text).toContain(profile.email);
  });
});
