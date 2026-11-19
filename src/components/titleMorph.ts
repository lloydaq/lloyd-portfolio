/**
 * Title morph between a project card on the home page and its case study's headline.
 *
 * Only the card involved may carry the shared transition name: other named cards would have
 * no partner on the case study page and linger in place. So the name is set on demand:
 * - leaving home (`pageswap`): on the card whose case study is the destination;
 * - arriving home (`pagereveal`): on the card the URL's #fragment points at,
 *   and cleared once the transition has finished.
 * Case study headlines carry their name statically (one per page).
 *
 * Call once, from the page's entry module, before first render: `pagereveal` fires at the
 * first rendering opportunity.
 */

// Not yet in TypeScript's DOM lib.
interface NavigationTransitionEvent extends Event {
  viewTransition: ViewTransition | null;
  activation?: { entry?: { url?: string } } | null;
}

const cards = () => document.querySelectorAll<HTMLElement>('[data-morph]');

function name(el: HTMLElement | null | undefined): void {
  if (el?.dataset.morph) el.style.viewTransitionName = el.dataset.morph;
}

function clear(): void {
  for (const el of cards()) el.style.viewTransitionName = '';
}

export function initTitleMorph(): void {
  window.addEventListener('pageswap', (event) => {
    const { viewTransition, activation } = event as NavigationTransitionEvent;
    if (!viewTransition || !activation?.entry?.url) return;
    const path = new URL(activation.entry.url).pathname;
    name([...cards()].find((el) => el.dataset.morphHref === path));
  });

  window.addEventListener('pagereveal', (event) => {
    const { viewTransition } = event as NavigationTransitionEvent;
    if (!viewTransition) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    name([...cards()].find((el) => el.dataset.morph === `title-${id}`));
    viewTransition.finished.finally(clear);
  });
}
