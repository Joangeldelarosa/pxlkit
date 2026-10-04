import { afterEach, describe, expect, it, vi } from 'vitest';
import { act } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { Footer } from '../Footer';

describe('Footer', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('hydrates a page built in an earlier year, keeping the year the server rendered', async () => {
    vi.useFakeTimers({ now: new Date('2026-10-04T12:00:00Z'), toFake: ['Date'] });
    const footer = <Footer year={new Date().getFullYear()} />;
    const container = document.createElement('div');
    container.innerHTML = renderToString(footer);
    document.body.appendChild(container);

    // The reader comes back the next year.
    vi.setSystemTime(new Date('2027-01-04T12:00:00Z'));
    const problems: unknown[] = [];
    vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => problems.push(args.join(' ')));
    await act(async () => {
      hydrateRoot(container, footer, { onRecoverableError: (error) => problems.push(error) });
    });

    expect(problems).toEqual([]);
    expect(container.textContent).toContain('© 2026 Pxlkit Contributors');
  });
});
