import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { ThemeProvider, useTheme } from '../ThemeProvider';

/** A theme toggle, labelled like the navbar's. */
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme}>
      {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    </button>
  );
}

const page = (
  <ThemeProvider>
    <ThemeToggle />
  </ThemeProvider>
);

describe('ThemeProvider', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    document.documentElement.className = '';
    document.body.innerHTML = '';
  });

  it('hydrates the server’s markup for a reader who stored the light theme, then shows that theme', async () => {
    // The server knows no stored theme.
    const container = document.createElement('div');
    container.innerHTML = renderToString(page);
    document.body.appendChild(container);
    window.localStorage.setItem('pxlkit-theme', 'light');

    const problems: unknown[] = [];
    vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => problems.push(args.join(' ')));
    await act(async () => {
      hydrateRoot(container, page, { onRecoverableError: (error) => problems.push(error) });
    });

    expect(problems).toEqual([]);
    expect(container.textContent).toBe('Switch to dark mode');
  });

  it('applies and stores the theme the reader picks', () => {
    window.localStorage.setItem('pxlkit-theme', 'light');
    render(page);
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
    expect(screen.getByRole('button').textContent).toBe('Switch to light mode');
    expect(document.documentElement.className).toBe('dark');
    expect(window.localStorage.getItem('pxlkit-theme')).toBe('dark');
  });

  it('keeps a picked theme where storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    render(page);
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }));
    expect(screen.getByRole('button').textContent).toBe('Switch to dark mode');
    expect(document.documentElement.className).toBe('light');
  });
});
