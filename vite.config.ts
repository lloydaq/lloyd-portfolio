/// <reference types="vitest/config" />
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Canonical, og:url and og:image must be absolute URLs, and the site has no
 * public URL yet. Set SITE_URL (e.g. https://example.com) at build time to emit
 * them; without it they are left out rather than guessed.
 */
function absoluteSeo(): Plugin {
  const site = process.env.SITE_URL?.replace(/\/+$/, '');
  return {
    name: 'absolute-seo',
    transformIndexHtml(html, ctx) {
      if (!site) return html.replace('<!--seo:absolute-->', '');
      const path = ctx.path.replace(/index\.html$/, '');
      const url = `${site}${path}`;
      const tags = [
        `<link rel="canonical" href="${url}" />`,
        `<meta property="og:url" content="${url}" />`,
        `<meta property="og:image" content="${site}/og.png" />`,
        `<meta property="og:image:width" content="1200" />`,
        `<meta property="og:image:height" content="630" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
      ].join('\n    ');
      return html.replace('<!--seo:absolute-->', tags);
    },
  };
}

// Static pages (multi-page build), so /work/tnd/ and /work/datasentry/ deep-link on any static
// host without rewrite rules, and in-page #anchors keep working.
export default defineConfig({
  plugins: [react(), absoluteSeo()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        tnd: resolve(import.meta.dirname, 'work/tnd/index.html'),
        datasentry: resolve(import.meta.dirname, 'work/datasentry/index.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['src/test-setup.ts'],
  },
});
