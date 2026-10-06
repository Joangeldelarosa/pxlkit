import type { ReactNode } from 'react';
import { act } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { vi } from 'vitest';

/* ─────────────────────────────────────────────────────────────────────────
   hydrate — shared test helper: hydrating server-rendered markup in a
   browser whose reader has preferences the server cannot know.
   NOT a test file — no `.test.` suffix, vitest skips it.
   ───────────────────────────────────────────────────────────────────────── */

export interface Hydrated {
  /** The element holding the hydrated markup, in `document.body`. */
  container: HTMLElement;
  /**
   * What React reported while hydrating: the errors it recovered from by
   * throwing the server's markup away, and console errors — a mismatch in
   * an attribute, which React leaves in place.
   */
  problems: string[];
  unmount(): void;
}

/**
 * Renders `node` to a string, as a server does — before `prefer()` sets the
 * reader's preferences, which no server knows — then hydrates that markup
 * with them set and lets effects run.
 */
export async function hydrateWithPreferences(node: ReactNode, prefer: () => void): Promise<Hydrated> {
  const container = document.createElement('div');
  container.innerHTML = renderToString(node);
  document.body.appendChild(container);
  prefer();

  const problems: string[] = [];
  const consoleError = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    problems.push(args.map(String).join(' '));
  });
  let root!: Root;
  try {
    await act(async () => {
      root = hydrateRoot(container, node, {
        onRecoverableError: (error) => problems.push(String(error)),
      });
    });
  } finally {
    consoleError.mockRestore();
  }

  return {
    container,
    problems,
    unmount: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}
