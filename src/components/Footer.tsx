import { profile } from '../content/site';
import { OPEN_SHORTCUTS_EVENT } from './keyShortcuts';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        {/* Shown only where there is a keyboard and a mouse (see .site-footer__keys). */}
        <button
          type="button"
          className="site-footer__keys"
          onClick={() => window.dispatchEvent(new Event(OPEN_SHORTCUTS_EVENT))}
        >
          Press <kbd>?</kbd> for keyboard shortcuts
        </button>
        <ul aria-label="Elsewhere">
          <li>
            <a href={`mailto:${profile.email}`}>Email</a>
          </li>
          <li>
            <a href={profile.github} rel="me noopener">
              GitHub
            </a>
          </li>
          <li>
            <a href={profile.linkedin} rel="me noopener">
              LinkedIn
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
