import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { homeSections, profile } from '../content/site';
import { ArrowRight, GitHub, LinkedIn, Mail, Moon, Sun } from './Icons';
import { applyTheme, readStoredTheme, systemTheme, useTheme } from './theme';
import { initReveal } from './reveal';
import { Shortcuts } from './Shortcuts';
import { switchTheme } from './themeSwitch';

/** Local time where Lloyd is (Karkala, India), for the menu's corner. */
const localTime = () =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(
    new Date(),
  );

interface HeaderProps {
  /** Prefix for section links: '' on the home page, '/' elsewhere. */
  base: '' | '/';
  activeId?: string;
}

export function Header({ base, activeId }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const navRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [time, setTime] = useState('');

  // The clock only ticks while the menu is open.
  useEffect(() => {
    if (!open) return;
    setTime(localTime());
    const timer = window.setInterval(() => setTime(localTime()), 15_000);
    return () => window.clearInterval(timer);
  }, [open]);

  const toggleMenu = () => {
    setOpen((value) => {
      // A tiny tick as the menu opens, on phones that support it.
      if (!value && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) navigator.vibrate?.(8);
      return !value;
    });
  };

  // The glass catches a soft light wherever the finger or pointer is.
  const onMenuPointer = (event: ReactPointerEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--mx', `${event.clientX - box.left}px`);
    event.currentTarget.style.setProperty('--my', `${event.clientY - box.top}px`);
  };

  // Theme from inside the menu: only a press on the other theme switches, with the same ink.
  const chooseTheme = (choice: 'dark' | 'light') => (event: MouseEvent<HTMLButtonElement>) => {
    if (choice === theme) return;
    switchTheme(event.currentTarget, event.detail === 0 ? undefined : { x: event.clientX, y: event.clientY });
  };

  // Scroll reveal for the whole page. Every page renders its header, and a layout effect
  // runs after the page is in the DOM but before it is painted, so nothing flashes.
  useLayoutEffect(() => initReveal(), []);

  // Follow the system theme until the visitor picks one.
  useEffect(() => {
    const query = window.matchMedia?.('(prefers-color-scheme: light)');
    if (!query) return;
    const onChange = () => {
      if (readStoredTheme()) return;
      applyTheme(systemTheme(), false);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // Close the mobile menu on Escape or an outside click.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!navRef.current?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    // The page underneath holds still while the menu is open.
    document.documentElement.classList.add('menu-open');
    return () => {
      document.documentElement.classList.remove('menu-open');
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  // Ink bleed from the click point; a keyboard press (detail 0) spreads from the button.
  const toggleTheme = (event: MouseEvent<HTMLButtonElement>) =>
    switchTheme(event.currentTarget, event.detail === 0 ? undefined : { x: event.clientX, y: event.clientY });

  return (
    <header className="site-header">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {/* Dims and blurs the page behind the open phone menu; a tap on it closes the menu. */}
      <div className="site-nav__scrim" data-open={open} aria-hidden="true" />
      <div className="container site-header__bar">
        <a className="site-header__name" href={base === '' ? '#top' : '/'}>
          {profile.name}
        </a>
        <nav
          id="site-nav"
          className="site-nav"
          aria-label="Main"
          data-open={open}
          ref={navRef}
          onPointerMove={onMenuPointer}
          onPointerDown={onMenuPointer}
        >
          <span className="site-nav__label" aria-hidden="true">
            Menu <span className="site-nav__clock">· Karkala {time} IST</span>
          </span>
          <ul className="site-nav__list">
            {homeSections.map((section, i) => (
              <li key={section.id} style={{ '--i': i } as CSSProperties}>
                <a
                  className="site-nav__link"
                  href={`${base}#${section.id}`}
                  aria-current={activeId === section.id ? 'true' : undefined}
                  onClick={() => setOpen(false)}
                >
                  <span className="site-nav__num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {section.label}
                  <ArrowRight className="site-nav__arrow" />
                </a>
              </li>
            ))}
          </ul>
          {/* Phone menu only: the quickest ways to get in touch, and the theme. */}
          <div className="site-nav__foot" style={{ '--i': homeSections.length } as CSSProperties}>
            <ul className="site-nav__contact" aria-label="Contact">
              <li>
                <a className="site-nav__bubble" href={`mailto:${profile.email}`} aria-label="Email">
                  <Mail />
                </a>
              </li>
              <li>
                <a className="site-nav__bubble" href={profile.github} rel="me noopener" aria-label="GitHub">
                  <GitHub />
                </a>
              </li>
              <li>
                <a className="site-nav__bubble" href={profile.linkedin} rel="me noopener" aria-label="LinkedIn">
                  <LinkedIn />
                </a>
              </li>
            </ul>
            <div className="site-nav__theme" role="group" aria-label="Theme" data-theme-choice={theme}>
              <button type="button" aria-pressed={theme === 'dark'} onClick={chooseTheme('dark')}>
                <Moon /> Dark
              </button>
              <button type="button" aria-pressed={theme === 'light'} onClick={chooseTheme('light')}>
                <Sun /> Light
              </button>
            </div>
          </div>
        </nav>
        <button
          type="button"
          className="icon-button theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          <Moon />
          <Sun />
        </button>
        <button
          ref={buttonRef}
          type="button"
          className="icon-button menu-button"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={toggleMenu}
        >
          <span className="burger" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>
      <Shortcuts />
    </header>
  );
}
