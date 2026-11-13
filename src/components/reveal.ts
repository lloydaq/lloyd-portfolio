/**
 * Scroll reveal: blocks of content fade and rise into place the first time they scroll
 * into view, staggered when several arrive together.
 *
 * Only `opacity` and `transform` animate, so the work stays on the compositor. Each block
 * is observed once and then left alone: its reveal attribute is removed when the
 * transition ends, so later hover transitions are never delayed. Content is hidden only
 * once this script runs and only when motion is allowed; without IntersectionObserver,
 * with reduced motion, or in print, everything is simply there.
 */

/** Blocks that reveal, on every page. Interactive elements are revealed through a wrapper,
    never directly, so their own transform and shadow transitions are untouched. */
const SELECTOR = [
  // Home
  '.hero__intro > *',
  '.hero__index-title',
  '.index-list > li',
  '.section__head > *',
  '.project__head > *',
  '.project__shot',
  '.project__grid > *',
  '.project__note',
  '.project__actions',
  '.principles tbody tr',
  '.toolchain > :not(dl)',
  '.toolchain__group',
  '.about > h2',
  '.about__body > p',
  '.contact__row',
  // Case studies
  '.case__head > *',
  '.case__section > *',
  '.case__end',
  '.next-project',
].join(',');

/** Delay between blocks that come into view together, and the most any block waits. */
const STAGGER_MS = 70;
const MAX_DELAY_MS = 420;
/** Longest a reveal can take, after which the attribute is cleared even without transitionend. */
const SETTLE_MS = 1100;

const motionAllowed = () =>
  'IntersectionObserver' in window && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function settle(el: HTMLElement, delay: number): void {
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    el.removeEventListener('transitionend', onEnd);
    el.removeAttribute('data-reveal');
    el.style.removeProperty('--reveal-delay');
  };
  const onEnd = (event: TransitionEvent) => {
    if (event.target === el && event.propertyName === 'opacity') finish();
  };
  el.addEventListener('transitionend', onEnd);
  window.setTimeout(finish, SETTLE_MS + delay);
}

/** Starts the reveal for the current page; returns a cleanup function. */
export function initReveal(): () => void {
  const root = document.documentElement;
  if (!motionAllowed()) return () => undefined;

  const blocks = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
  if (blocks.length === 0) return () => undefined;
  for (const el of blocks) el.setAttribute('data-reveal', '');
  root.classList.add('reveal-on');

  const observer = new IntersectionObserver(
    (entries) => {
      const arriving = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
      let step = 0;
      for (const entry of arriving) {
        const el = entry.target as HTMLElement;
        observer.unobserve(el);
        // Scrolling back up past a block that was skipped (an anchor jump): fade it in
        // where it is instead of rising against the scroll direction.
        const fromAbove = entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0);
        const delay = fromAbove ? 0 : Math.min(step++ * STAGGER_MS, MAX_DELAY_MS);
        el.style.setProperty('--reveal-delay', `${delay}ms`);
        el.setAttribute('data-reveal', fromAbove ? 'fade' : 'in');
        settle(el, delay);
      }
    },
    // Reveal a little before the block's top reaches the lower edge, so text is
    // already settling as it comes into reading position.
    { rootMargin: '0px 0px -6% 0px', threshold: 0 },
  );
  for (const el of blocks) observer.observe(el);

  // If the visitor turns reduced motion on mid-visit, show everything at once.
  const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const onMotion = () => {
    if (!query?.matches) return;
    observer.disconnect();
    for (const el of blocks) el.removeAttribute('data-reveal');
    root.classList.remove('reveal-on');
  };
  query?.addEventListener('change', onMotion);

  return () => {
    observer.disconnect();
    query?.removeEventListener('change', onMotion);
    for (const el of blocks) el.removeAttribute('data-reveal');
    root.classList.remove('reveal-on');
  };
}
