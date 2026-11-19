import type { Screenshot } from './site';

// Checked against github.com/lloydaq/inkshift at commit 769905a (package.json 0.2.0,
// "Release 0.2.0") and the npm registry on 2026-11-19, whose latest published version is
// 0.1.0. Sizes are the README's measured table (npm run size). Do not claim 0.2.0 is on npm
// until it is published.

export const inkshiftRepo = 'https://github.com/lloydaq/inkshift';
export const inkshiftNpm = 'https://www.npmjs.com/package/inkshift';

export const inkshift = {
  name: 'Inkshift',
  tagline: 'Ink-bleed theme switching, as an open-source library',
  pitch:
    'The ink theme switch on this site, published as an open-source library: an organic ink-bleed transition between light and dark, for React or plain JavaScript.',
  npmVersion: '0.1.0',
  summary:
    'An organic ink-bleed transition between light and dark themes, extracted from this portfolio and published on npm. The splat grows from the exact point pressed, a second press reverses it, and it follows the system theme, persists the choice, avoids a flash on load and switches instantly with reduced motion. A framework-independent core with a React entry point and no runtime dependencies.',
  stack: 'TypeScript, View Transitions API, Web Animations; React entry point; Vite library build',
  status: 'v0.1.0 on npm under MIT; 0.2.0 (smoke-like "fluidity") released in the repository, not yet on npm',
  size: 'About 6 kB gzipped (6.43 kB for the whole core, measured)',
} as const;

export const features = [
  ['Stack', inkshift.stack],
  ['Size', inkshift.size],
  ['Status', inkshift.status],
] as const;

export const screenshot: Screenshot = {
  light: '/inkshift/inkshift-demo-light.png',
  dark: '/inkshift/inkshift-demo-dark.png',
  width: 2560,
  height: 1520,
  alt: "The Inkshift demo page: a large serif headline, 'Let the other theme bleed through.', beside an ink splat with the theme toggle at its centre, and an npm install command.",
  caption: 'The library’s own demo page. On this site, press the theme toggle to see it.',
};
