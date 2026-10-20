import { profile } from '../content/site';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
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
