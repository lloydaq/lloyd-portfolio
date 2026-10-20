# Lloyd D'Souza — portfolio

Personal portfolio of Lloyd D'Souza, AI/ML engineering student. It has three
static pages:

- `/` — home: introduction, both projects, engineering principles, toolchain,
  about, contact.
- `/work/tnd/` — case study of **TND (Trustworthy News Detector)**.
- `/work/datasentry/` — case study of **DataSentry**, a dataset diagnostics
  tool.

Built with React 19, TypeScript and Vite. No backend, no analytics, no
cookies, no third-party requests at runtime (fonts are self-hosted).

## Requirements

- Node.js 20.19+ or 22.12+ (developed on Node 24, npm 11)
- For browser tests: Playwright browsers (`npx playwright install`)

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173
```

## Build and preview

```bash
npm run build        # type-checks, then builds to dist/
npm run preview      # serves dist/ at http://127.0.0.1:4173
```

`dist/` is a plain static site. Deploy it to any static host (GitHub Pages,
Netlify, Cloudflare Pages, Vercel). Every page is a real HTML file, so
`/work/tnd/` and `/work/datasentry/` work without rewrite rules.

### Canonical URL and social image

Canonical links, `og:url` and `og:image` need absolute URLs, and the site has
no public address yet, so they are left out by default. Once it has one:

```bash
SITE_URL=https://your-domain.example npm run build
```

(PowerShell: `$env:SITE_URL="https://your-domain.example"; npm run build`)

## Checks

| Command | What it does |
| --- | --- |
| `npm run typecheck` | `tsc -b` over app, config and tests |
| `npm run lint` | ESLint (TypeScript + React hooks rules) |
| `npm test` | Vitest: content integrity and component behaviour |
| `npm run test:e2e` | Playwright against the production build in Chromium, Firefox, WebKit and mobile Chromium: navigation, mobile menu, theme, diagram keyboard use, axe accessibility (WCAG 2.2 AA) in both themes, overflow at 5 viewports, broken images, console errors |
| `npm run check:links` | Requests every external link in `dist/` (run after a build) |
| `npm run check` | typecheck, lint, unit tests, build and e2e in sequence |

LinkedIn rejects automated requests (HTTP 999), so `check:links` reports that
link as "check by hand" instead of passing or failing it.

`node scripts/screenshots.mjs` captures every page at 1440, 1280, 768, 390 and
360 px wide in both themes (with `npm run preview` running) and reports
overflow and console errors.

## Editing content

All copy and facts live in three files:

- `src/content/site.ts` — name, contact links, section list, toolchain, and
  the `Screenshot` type.
- `src/content/tnd.ts` — everything about TND: pipeline stages (which also
  drive the diagram), characteristics, decisions, principles, limitations,
  roadmap, screenshots.
- `src/content/datasentry.ts` — everything about DataSentry, checked against
  its repository (<https://github.com/lloydaq/DataSentry>) at commit
  `ae58615`.

Every TND detail was checked against the TND repository at v1.0.0
(<https://github.com/lloydaq/TND-The-News-Detector>). When TND changes,
update `tnd.ts` from its code and README, not from memory. The unit tests fail
if CampusSignal or a database claim appears anywhere in the source.

### Project screenshots

Every project screenshot exists twice, once in each of the project's own
themes, captured from the running application with the same data, viewport
(1440 x 900 at 2x) and scroll position:

```text
public/tnd/tnd-{results,evidence,home}-{light,dark}.png
public/datasentry/datasentry-{overview,findings,ml-checks}-{light,dark}.png
```

The site shows the file that matches its own theme (`ThemedShot`, driven by
`useTheme()` in `src/components/theme.ts`, which follows the `data-theme`
attribute on `<html>`). A theme switch swaps the image without a reload; the
other theme's file is fetched in the background after the first one loads.
A unit test fails if a screenshot's two files are the same or missing.

To recapture, start the applications and run `node scripts/project-shots.mjs`
(see the comment at the top of the script for ports). TND needs Ollama and
its backend; the script runs one real analysis, saves it to
`.impeccable/tnd-result.json`, and renders that same result in both themes.
Delete the file to analyse again.

`public/og.png` is rendered by `node scripts/make-og.mjs`.

## Project structure

```text
index.html, work/*/index.html     page entries with metadata
src/
  main-*.tsx                      page bootstraps
  pages/                          Home, CaseStudy (TND), DataSentryStudy
  components/                     Header, Footer, PipelineDiagram, ThemedShot, icons, theme
  content/                        site.ts, tnd.ts, datasentry.ts (+ content tests)
  styles/                         global (tokens), pipeline, home, case
public/                           favicon, og image, robots.txt, project screenshots
tests/e2e/                        Playwright suite
scripts/                          link check, page review shots, project screenshots, og image
```

Design tokens (colour, type scale, spacing, motion) are CSS custom properties
at the top of `src/styles/global.css`; the light theme overrides the colours
under `:root[data-theme='light']`.
