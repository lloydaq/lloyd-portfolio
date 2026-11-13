import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const pages = [
  { name: 'home', path: '/' },
  { name: 'case study', path: '/work/tnd/' },
  { name: 'DataSentry case study', path: '/work/datasentry/' },
  { name: 'FlowCast case study', path: '/work/flowcast/' },
  { name: 'CampusSignal case study', path: '/work/campussignal/' },
];

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('requestfailed', (r) => errors.push(`request failed: ${r.url()}`));
  return errors;
}

for (const { name, path } of pages) {
  test.describe(name, () => {
    test('loads without console errors, failed requests, or broken images', async ({ page }) => {
      const errors = collectErrors(page);
      await page.goto(path, { waitUntil: 'networkidle' });
      // Bring each lazy image into view and wait until it has decoded.
      const images = page.locator('img');
      for (let i = 0; i < (await images.count()); i++) {
        const img = images.nth(i);
        await img.scrollIntoViewIfNeeded();
        await expect
          .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0), {
            message: await img.getAttribute('src') ?? 'img',
            // Firefox under a fully parallel run can take ~10 s to decode; a
            // missing or broken file still fails.
            timeout: 15_000,
          })
          .toBe(true);
      }
      expect(errors).toEqual([]);
    });

    test('has one h1, ordered headings, and alt text on every image', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('h1')).toHaveCount(1);
      const levels = await page.$$eval('h1, h2, h3, h4', (hs) => hs.map((h) => Number(h.tagName[1])));
      for (let i = 1; i < levels.length; i++) expect(levels[i]! - levels[i - 1]!).toBeLessThanOrEqual(1);
      const missingAlt = await page.$$eval('img', (imgs) => imgs.filter((i) => !i.getAttribute('alt')).length);
      expect(missingAlt).toBe(0);
    });

    test('every in-page link points at an element that exists', async ({ page }) => {
      await page.goto(path);
      const missing = await page.$$eval('a[href]', (links) =>
        links
          .map((a) => new URL((a as HTMLAnchorElement).href))
          .filter((u) => u.origin === location.origin && u.pathname === location.pathname && u.hash)
          .map((u) => decodeURIComponent(u.hash.slice(1)))
          .filter((id) => !document.getElementById(id)),
      );
      expect(missing).toEqual([]);
    });

    test('links CampusSignal only through its current repository', async ({ page }) => {
      await page.goto(path);
      const hrefs = await page.$$eval('a[href]', (links) => links.map((a) => a.getAttribute('href') ?? ''));
      // The older lloydaq/CampusSignal repository is not part of the portfolio.
      for (const href of hrefs) {
        if (/github\.com\/lloydaq\/campussignal/i.test(href)) {
          expect(href).toBe('https://github.com/lloydaq/CampusSignal-pro');
        }
      }
    });

    for (const theme of ['dark', 'light'] as const) {
      test(`has no serious accessibility violations (${theme})`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
        await page.goto(path, { waitUntil: 'networkidle' });
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        const serious = results.violations
          .filter((v) => v.impact === 'serious' || v.impact === 'critical')
          .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
        expect(serious).toEqual([]);
      });
    }
  });
}

test.describe('home interactions', () => {
  test('identifies the owner and links to verified profiles', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Lloyd D'Souza/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText("Lloyd D'Souza");
    await expect(page.getByRole('link', { name: 'View GitHub' })).toHaveAttribute('href', 'https://github.com/lloydaq');
    await expect(page.getByRole('link', { name: /View the repository: Trustworthy News Detector/ })).toHaveAttribute(
      'href',
      'https://github.com/lloydaq/TND-The-News-Detector',
    );
    await expect(page.getByRole('link', { name: /View the repository: DataSentry/ })).toHaveAttribute(
      'href',
      'https://github.com/lloydaq/DataSentry',
    );
    await expect(page.getByRole('link', { name: /View the repository: FlowCast/ })).toHaveAttribute(
      'href',
      'https://github.com/lloydaq/flowcast',
    );
    await expect(page.getByRole('link', { name: /Open the live demo: FlowCast/ })).toHaveAttribute(
      'href',
      'https://lloydaq.github.io/flowcast/',
    );
    await expect(page.getByRole('link', { name: /View the repository: CampusSignal/ })).toHaveAttribute(
      'href',
      'https://github.com/lloydaq/CampusSignal-pro',
    );
    await expect(page.getByRole('link', { name: 'lloyd25dsouza@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:lloyd25dsouza@gmail.com',
    );
    await expect(page.getByRole('link', { name: 'linkedin.com/in/lloyddso' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/lloyddso',
    );
  });

  test('hero actions reach their sections', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Explore projects/ }).click();
    await expect(page).toHaveURL(/#projects$/);
    await expect(page.getByRole('heading', { name: 'Projects', level: 2 })).toBeInViewport();
    await page.goto('/');
    await page.getByRole('link', { name: 'Contact me' }).click();
    await expect(page.getByRole('heading', { name: 'Contact', level: 2 })).toBeInViewport();
  });

  test('the pipeline diagram works with the keyboard', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Narrow screens use the list layout, covered below.');
    await page.goto('/work/tnd/');
    const graph = page.getByRole('group', { name: 'TND analysis pipeline' });
    const selected = graph.getByRole('button', { pressed: true });
    await expect(selected).toContainText('Evidence search');
    await expect(page.locator('.pipeline__detail')).toContainText('in parallel');
    await selected.focus();
    await page.keyboard.press('ArrowRight');
    await expect(graph.getByRole('button', { pressed: true })).toContainText('Evidence text');
    await expect(page.locator('.pipeline__detail-title')).toHaveText('Evidence text');
  });

  test('the pipeline list opens specs inline on narrow screens', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/work/tnd/');
    const list = page.getByRole('list', { name: 'TND analysis pipeline' });
    await expect(list).toBeVisible();
    await expect(page.getByRole('group', { name: 'TND analysis pipeline' })).toBeHidden();
    await list.getByRole('button', { name: /Risk scoring/ }).click();
    await expect(list).toContainText('at 70 or above');
  });

  test('theme choice persists across reloads and pages', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.getByRole('button', { name: 'Switch to light theme' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.goto('/work/tnd/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#f2eee6');
  });

  test('the theme switch bleeds ink across the whole page', async ({ page }) => {
    const errors = collectErrors(page);
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'no-preference' });
    await page.goto('/', { waitUntil: 'networkidle' });
    const supported = await page.evaluate(
      () => typeof document.startViewTransition === 'function' && 'pseudoElement' in KeyframeEffect.prototype,
    );
    // Click by position: a locator click would scroll the sticky header first.
    const box = (await page.locator('.theme-toggle').boundingBox())!;
    const press = () => page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    const settled = () => expect(page.locator('html')).not.toHaveClass(/ink-transition/);

    await press();
    if (supported) {
      // The splat mask animates the new snapshot and covers the viewport by the end.
      const ink = await page.waitForFunction(() => {
        const a = document.getAnimations().find((x) => (x.effect as KeyframeEffect | null)?.pseudoElement === '::view-transition-new(root)');
        if (!a) return null;
        const frames = (a.effect as KeyframeEffect).getKeyframes();
        return { layers: String(frames.at(-1)?.maskSize).split(',').length, duration: a.effect?.getTiming().duration };
      });
      expect(await ink.jsonValue()).toEqual({ layers: 2, duration: 900 });
    }
    await settled();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('light');

    // Pressed again mid-spread, the ink pulls back and the old theme stays.
    await press();
    await page.waitForTimeout(300);
    await press();
    await settled();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    // Three quick presses end on the other theme.
    await press();
    await press();
    await press();
    await settled();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');
    expect(errors).toEqual([]);
  });

  test('with reduced motion the theme switches at once', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await page.goto('/');
    await page.getByRole('button', { name: 'Switch to light theme' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('html')).not.toHaveClass(/ink-transition|theme-fade/);
  });

  test('follows the system theme on first visit', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('copy email button reports the result', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Clipboard permissions are Chromium-only in Playwright.');
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/#contact');
    await page.getByRole('button', { name: 'Copy email address' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'copied' })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('lloyd25dsouza@gmail.com');
  });
});

test.describe('project screenshots', () => {
  const homeShots = (theme: 'dark' | 'light') => [
    `/tnd/tnd-results-${theme}.png`,
    `/datasentry/datasentry-overview-${theme}.png`,
    `/flowcast/flowcast-network-${theme}.png`,
    `/campussignal/campussignal-home-${theme}.png`,
  ];
  const DARK = homeShots('dark');
  const LIGHT = homeShots('light');
  const shots = (page: Page) => page.locator('.project__shot img');
  const sources = (page: Page) => shots(page).evaluateAll((imgs) => imgs.map((i) => i.getAttribute('src')));

  test('all four projects are listed with their case studies', async ({ page }) => {
    const projectPages = [
      ['Trustworthy News Detector', /\/work\/tnd\/$/, 'TND'],
      ['DataSentry', /\/work\/datasentry\/$/, 'DataSentry'],
      ['FlowCast', /\/work\/flowcast\/$/, 'FlowCast'],
      ['CampusSignal', /\/work\/campussignal\/$/, 'CampusSignal'],
    ] as const;
    for (const [name, url, h1] of projectPages) {
      await page.goto('/');
      await expect(page.locator('#projects').getByRole('heading', { name, level: 3 })).toBeVisible();
      await page.getByRole('link', { name: `Read the case study: ${name}` }).click();
      await expect(page).toHaveURL(url);
      await expect(page.getByRole('heading', { level: 1 })).toContainText(h1);
    }
  });

  test('each case study links back to its own project on the home page', async ({ page }) => {
    for (const id of ['flowcast', 'campussignal']) {
      await page.goto(`/work/${id}/`);
      await page.getByRole('link', { name: 'Back to the portfolio' }).click();
      await expect(page).toHaveURL(new RegExp(`/#${id}$`));
      await expect(page.locator(`#${id}`)).toBeInViewport();
    }
  });

  test('switch with the theme toggle, without a reload, and persist', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    expect(await sources(page)).toEqual(DARK);

    const navigations: string[] = [];
    page.on('framenavigated', (f) => f === page.mainFrame() && navigations.push(f.url()));
    await page.getByRole('button', { name: 'Switch to light theme' }).click();
    await expect.poll(() => sources(page)).toEqual(LIGHT);
    expect(navigations).toEqual([]);

    await page.reload();
    expect(await sources(page)).toEqual(LIGHT);
    await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    await expect.poll(() => sources(page)).toEqual(DARK);
  });

  test('follow the system theme until the visitor chooses', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    expect(await sources(page)).toEqual(LIGHT);
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect.poll(() => sources(page)).toEqual(DARK);
  });

  test('keep their size when the theme changes', async ({ page }) => {
    await page.goto('/');
    const img = shots(page).first();
    await img.scrollIntoViewIfNeeded();
    const size = async () => {
      const box = await img.boundingBox();
      return box && { width: box.width, height: box.height };
    };
    const before = await size();
    await page.getByRole('button', { name: /Switch to/ }).click();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    expect(await size()).toEqual(before);
  });

  test('every screenshot is dark for the dark theme and light for the light theme', async ({ page }) => {
    await page.goto('/');
    const pairs = [
      ['tnd', ['tnd-home', 'tnd-results', 'tnd-evidence']],
      ['datasentry', ['datasentry-overview', 'datasentry-findings', 'datasentry-ml-checks']],
      ['flowcast', ['flowcast-network', 'flowcast-forecast', 'flowcast-models']],
      ['campussignal', ['campussignal-home', 'campussignal-issue', 'campussignal-notices']],
    ].flatMap(([dir, names]) => (names as string[]).map((n) => `/${dir}/${n}`));
    // Mean luminance (0-255) of each file, measured in the browser.
    const luminance = (src: string) =>
      page.evaluate(async (url) => {
        const img = new Image();
        img.src = url;
        await img.decode();
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 100;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) sum += 0.2126 * data[i]! + 0.7152 * data[i + 1]! + 0.0722 * data[i + 2]!;
        return sum / (data.length / 4);
      }, src);
    for (const base of pairs) {
      const dark = await luminance(`${base}-dark.png`);
      const light = await luminance(`${base}-light.png`);
      expect(dark, `${base}-dark.png`).toBeLessThan(90);
      expect(light, `${base}-light.png`).toBeGreaterThan(165);
    }
  });

  test('case study galleries follow the theme too', async ({ page }) => {
    for (const path of ['/work/tnd/', '/work/datasentry/', '/work/flowcast/', '/work/campussignal/']) {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto(path);
      const imgs = page.locator('.case__gallery img');
      await expect(imgs).toHaveCount(3);
      const dark = await imgs.evaluateAll((els) => els.map((e) => e.getAttribute('src')));
      expect(dark.every((s) => s?.endsWith('-dark.png')), path).toBe(true);
      await page.getByRole('button', { name: 'Switch to light theme' }).click();
      await expect
        .poll(() => imgs.evaluateAll((els) => els.every((e) => e.getAttribute('src')?.endsWith('-light.png'))))
        .toBe(true);
      await page.evaluate(() => localStorage.clear());
    }
  });
});

test.describe('phone layout', () => {
  test.use({ viewport: { width: 320, height: 800 } });

  test('screenshots offer the full-size file for the current theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const links = page.locator('#projects').getByRole('link', { name: 'Open full-size screenshot' });
    await expect(links).toHaveCount(4);
    await expect(links.first()).toBeVisible();
    await expect(links.first()).toHaveAttribute('href', '/tnd/tnd-results-light.png');
    await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    await expect(links.first()).toHaveAttribute('href', '/tnd/tnd-results-dark.png');
  });

  test('the pipeline loop label does not overlap the first loop stage', async ({ page }) => {
    await page.goto('/work/tnd/');
    const list = page.getByRole('list', { name: 'TND analysis pipeline' });
    const label = await list.locator('.pipeline__loop-label').boundingBox();
    const stage = await list.getByRole('button', { name: /Evidence search/ }).boundingBox();
    expect(label!.y + label!.height).toBeLessThanOrEqual(stage!.y);
  });

  test('action buttons share each row instead of stacking at uneven widths', async ({ page }) => {
    await page.goto('/');
    const actions = page.locator('#tnd .project__actions .button');
    const [a, b] = await Promise.all([actions.nth(0).boundingBox(), actions.nth(1).boundingBox()]);
    expect(Math.round(a!.width)).toBe(Math.round(b!.width));
  });
});

test('full-size screenshot links stay hidden on wider screens', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto('/');
  await expect(page.locator('.figure__full').first()).toBeHidden();
});

test.describe('mobile navigation', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('menu opens, navigates, and closes', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav).toBeHidden();
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(nav).toBeVisible();
    await nav.getByRole('link', { name: 'Engineering' }).click();
    await expect(nav).toBeHidden();
    await expect(page).toHaveURL(/#engineering$/);
    await expect(page.getByRole('heading', { name: 'How I work' })).toBeInViewport();
  });

  test('Escape closes the menu and returns focus', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
  });
});

test.describe('case study', () => {
  test('is reachable from the home page and covers every required section', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Read the case study: Trustworthy News Detector' }).click();
    await expect(page).toHaveURL(/\/work\/tnd\/$/);
    for (const heading of [
      'The problem',
      'Intended users',
      'Architecture',
      'Implementation',
      'Key engineering decisions',
      'Challenges',
      'Testing and verification',
      'Current limitations',
      'Future improvements',
    ]) {
      await expect(page.getByRole('heading', { name: heading, level: 2 })).toHaveCount(1);
    }
  });

  test('marks open roadmap items in text, not colour alone', async ({ page }) => {
    await page.goto('/work/tnd/');
    const items = page.locator('.status-list li');
    await expect(items.filter({ hasText: 'Open' })).toHaveCount(4);
    await expect(items.filter({ hasText: 'Done' })).toHaveCount(5);
  });

  test('progressive disclosure opens and closes', async ({ page }) => {
    await page.goto('/work/tnd/');
    const details = page.locator('details', { hasText: 'Claim statuses' });
    await expect(details.getByText('INSUFFICIENT_EVIDENCE')).toBeHidden();
    await details.locator('summary').click();
    await expect(details.getByText('INSUFFICIENT_EVIDENCE')).toBeVisible();
  });

  test('back link returns to the projects section', async ({ page }) => {
    await page.goto('/work/tnd/');
    await page.getByRole('link', { name: 'Back to the portfolio' }).click();
    await expect(page).toHaveURL(/\/#projects$/);
  });
});

test.describe('responsive layout', () => {
  const viewports = [
    [1440, 900],
    [1280, 800],
    [1024, 768],
    [768, 1024],
    [767, 1024],
    [430, 932],
    [390, 844],
    [375, 812],
    [360, 800],
    [320, 800],
  ] as const;

  for (const [width, height] of viewports) {
    test(`no horizontal overflow and adequate tap targets at ${width}x${height}`, async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'Layout is checked once, in Chromium.');
      await page.setViewportSize({ width, height });
      for (const { path } of pages) {
        await page.goto(path, { waitUntil: 'networkidle' });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        expect(overflow, path).toBeLessThanOrEqual(0);
        // WCAG 2.5.8: interactive targets at least 24x24 CSS px (inline text links exempt).
        const small = await page.$$eval('button, .button, .site-nav__link, .icon-button', (els) =>
          els
            .filter((e) => (e as HTMLElement).offsetParent !== null)
            .map((e) => e.getBoundingClientRect())
            .filter((r) => r.width < 24 || r.height < 24).length,
        );
        expect(small, path).toBe(0);
      }
    });
  }
});

test('reduced motion leaves all content visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/work/tnd/');
  const opacity = await page.locator('.pipeline__detail .stage-spec').evaluate((e) => getComputedStyle(e).opacity);
  expect(opacity).toBe('1');
  const running = await page.evaluate(() => document.getAnimations().length);
  expect(running).toBe(0);
});

test('background grid sits behind content and ignores the pointer', async ({ page }) => {
  for (const path of ['/', '/work/tnd/', '/work/datasentry/', '/work/flowcast/', '/work/campussignal/']) {
    await page.goto(path);
    const grid = page.locator('canvas.kinetic-grid');
    await expect(grid).toHaveAttribute('aria-hidden', 'true');
    const style = await grid.evaluate((e) => {
      const s = getComputedStyle(e);
      return { position: s.position, zIndex: s.zIndex, pointerEvents: s.pointerEvents };
    });
    expect(style).toEqual({ position: 'fixed', zIndex: '-1', pointerEvents: 'none' });
  }
});
