import { useEffect, useState } from 'react';

/** Id of the section currently crossing the upper part of the viewport. */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string | undefined>();

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible.set(entry.target.id, entry.isIntersecting);
        setActive(ids.find((id) => visible.get(id)));
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
