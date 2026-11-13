import { nextProject, type ProjectId } from '../content/site';
import { ArrowRight } from './Icons';

/** End-of-case-study link to the next project, so a reader keeps going instead of backing out. */
export function NextProject({ current }: { current: ProjectId }) {
  const next = nextProject(current);
  return (
    <nav className="next-project container" aria-label="Next project">
      <a className="next-project__card" href={next.path}>
        <span className="next-project__label">Next project</span>
        <span className="next-project__name">{next.name}</span>
        <span className="next-project__tagline">{next.tagline}</span>
        <ArrowRight className="next-project__arrow" />
      </a>
    </nav>
  );
}
