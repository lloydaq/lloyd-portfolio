import { useEffect, useRef, useState } from 'react';
import { homeSections, profile } from '../content/site';
import { Close, Menu, Moon, Sun } from './Icons';
import { applyTheme, readStoredTheme, systemTheme, useTheme } from './theme';

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
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  const toggleTheme = () => applyTheme(theme === 'dark' ? 'light' : 'dark', true);

  return (
    <header className="site-header">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
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
        >
          <ul className="site-nav__list">
            {homeSections.map((section) => (
              <li key={section.id}>
                <a
                  className="site-nav__link"
                  href={`${base}#${section.id}`}
                  aria-current={activeId === section.id ? 'true' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
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
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <Close /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
