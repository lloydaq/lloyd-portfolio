import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { Footer } from './Footer';
import { Header } from './Header';
import { PipelineDiagram } from './PipelineDiagram';
import { applyTheme } from './theme';
import { ThemedShot } from './ThemedShot';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.dataset.theme = 'dark';
});

describe('PipelineDiagram', () => {
  const graph = () => screen.getByRole('group', { name: 'TND analysis pipeline' });
  const detail = () => document.querySelector('.pipeline__detail') as HTMLElement;

  it('shows the initial stage and switches the detail panel on click', async () => {
    const user = userEvent.setup();
    render(<PipelineDiagram caption="Figure" initial="claims" animate={false} />);
    expect(within(detail()).getByRole('heading', { name: 'Claim analysis' })).toBeTruthy();

    await user.click(within(graph()).getByRole('button', { name: /Risk scoring/ }));
    expect(within(detail()).getByRole('heading', { name: 'Risk scoring' })).toBeTruthy();
    expect(within(graph()).getByRole('button', { name: /Risk scoring/ }).getAttribute('aria-pressed')).toBe('true');
    expect(detail().textContent).toContain('at 70 or above');
  });

  it('moves selection with the arrow keys and keeps one tab stop', async () => {
    const user = userEvent.setup();
    render(<PipelineDiagram caption="Figure" initial="browser" animate={false} />);
    const buttons = within(graph()).getAllByRole('button');
    expect(buttons.filter((b) => b.tabIndex === 0)).toHaveLength(1);

    buttons[0]!.focus();
    await user.keyboard('{ArrowRight}');
    const api = within(graph()).getByRole('button', { name: /FastAPI/ });
    expect(api.getAttribute('aria-pressed')).toBe('true');
    expect(document.activeElement).toBe(api);

    await user.keyboard('{End}');
    expect(within(detail()).getByRole('heading', { name: 'Results page' })).toBeTruthy();
    await user.keyboard('{Home}');
    expect(within(detail()).getByRole('heading', { name: 'Browser' })).toBeTruthy();
  });
});

describe('Header', () => {
  it('toggles the mobile menu and reports its state', async () => {
    const user = userEvent.setup();
    render(<Header base="" />);
    const button = screen.getByRole('button', { name: 'Open menu' });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    await user.click(button);
    expect(screen.getByRole('button', { name: 'Close menu' }).getAttribute('aria-expanded')).toBe('true');
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Open menu' }).getAttribute('aria-expanded')).toBe('false');
  });

  it('switches and remembers the theme', async () => {
    const user = userEvent.setup();
    render(<Header base="" />);
    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }));
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeTruthy();
  });

  it('links sections in place on the home page and back home elsewhere', () => {
    const { unmount } = render(<Header base="" />);
    expect(screen.getByRole('link', { name: 'Projects' }).getAttribute('href')).toBe('#projects');
    unmount();
    render(<Header base="/" />);
    expect(screen.getByRole('link', { name: 'Projects' }).getAttribute('href')).toBe('/#projects');
  });
});

describe('Footer', () => {
  it('prints the current year', () => {
    render(<Footer />);
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()}`))).toBeTruthy();
  });
});

describe('ThemedShot', () => {
  const shot = {
    light: '/shot-light.png',
    dark: '/shot-dark.png',
    width: 16,
    height: 10,
    alt: 'An application screen',
    caption: '',
  };

  it('shows the screenshot for the current theme and follows theme changes', async () => {
    render(<ThemedShot shot={shot} />);
    const img = screen.getByRole('img', { name: 'An application screen' });
    expect(img.getAttribute('src')).toBe('/shot-dark.png');
    await act(async () => applyTheme('light', false));
    expect(img.getAttribute('src')).toBe('/shot-light.png');
    await act(async () => applyTheme('dark', false));
    expect(img.getAttribute('src')).toBe('/shot-dark.png');
  });

  it('switches together with the header theme toggle', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Header base="" />
        <ThemedShot shot={shot} />
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }));
    expect(screen.getByRole('img', { name: 'An application screen' }).getAttribute('src')).toBe('/shot-light.png');
  });
});
