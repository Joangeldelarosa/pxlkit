/**
 * Server-rendered markup hydrates in a browser whose reader has preferences
 * the server cannot know. The render that hydrates uses the server's value,
 * so it matches the markup, and the reader's value applies right after; a
 * render without server markup starts from the reader's value.
 */
/// <reference types="vite/client" />
import React, { useState } from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Manifest } from '../../../../scripts/build-docs/manifest-schema';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { Default as GlitchDefault } from '../animations/PixelGlitch.examples';
import { Default as TypewriterDefault } from '../animations/PixelTypewriter.examples';
import { Default as SpinnerDefault } from '../feedback/PixelSpinner.examples';
import { GlitchHeadline, TypewriterHeadline } from '../hero/PixelHeroSection.examples';
import { mockMatchMedia, type MatchMediaController } from './animations/matchmedia-mock';
import { hydrateWithPreferences, type Hydrated } from './hydrate';

let matchMedia: MatchMediaController | undefined;
let hydrated: Hydrated | undefined;

afterEach(() => {
  hydrated?.unmount();
  hydrated = undefined;
  matchMedia?.restore();
  matchMedia = undefined;
});

/** The reader prefers reduced motion. */
function prefersReducedMotion() {
  matchMedia = mockMatchMedia(true);
}

/** Shows what `useReducedMotion` answers, recording each answer. */
function MotionProbe({ seen }: { seen: boolean[] }) {
  const reduced = useReducedMotion();
  seen.push(reduced);
  return <span>{reduced ? 'still' : 'moving'}</span>;
}

describe('useReducedMotion / useMediaQuery', () => {
  it('hydrate with the server value, then take the reader’s', async () => {
    const seen: boolean[] = [];
    hydrated = await hydrateWithPreferences(<MotionProbe seen={seen} />, prefersReducedMotion);
    expect(hydrated.problems).toEqual([]);
    expect(hydrated.container.textContent).toBe('still');
    // The server's render, the one that hydrates, then the reader's value.
    expect(seen).toEqual([false, false, true]);
  });

  it('start from the reader’s value in a render without server markup', () => {
    prefersReducedMotion();
    const seen: boolean[] = [];
    render(<MotionProbe seen={seen} />);
    expect(seen).toEqual([true]);
  });

  it('start from the reader’s value in a component mounted after hydration', async () => {
    const seen: boolean[] = [];
    function Later() {
      const [shown, setShown] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setShown(true)}>Show</button>
          {shown && <MotionProbe seen={seen} />}
        </>
      );
    }
    hydrated = await hydrateWithPreferences(<Later />, prefersReducedMotion);
    act(() => hydrated!.container.querySelector('button')!.click());
    expect(seen).toEqual([true]);
  });

  it('hydrate with the default of any query, then follow it', async () => {
    function Width() {
      return <span>{useMediaQuery('(min-width: 768px)', true) ? 'wide' : 'narrow'}</span>;
    }
    hydrated = await hydrateWithPreferences(<Width />, () => {
      matchMedia = mockMatchMedia(false);
    });
    expect(hydrated.problems).toEqual([]);
    expect(hydrated.container.textContent).toBe('narrow');
  });
});

describe('components that hold still for a reader who prefers reduced motion', () => {
  it('PixelTypewriter shows its whole text, without the caret', async () => {
    hydrated = await hydrateWithPreferences(<TypewriterDefault />, prefersReducedMotion);
    expect(hydrated.problems).toEqual([]);
    expect(hydrated.container.querySelector('[aria-hidden="true"]')!.textContent).toBe('Hello, pxlkit.');
  });

  it('PixelGlitch keeps a single copy, standing still', async () => {
    hydrated = await hydrateWithPreferences(<GlitchDefault />, prefersReducedMotion);
    expect(hydrated.problems).toEqual([]);
    const glitch = hydrated.container.firstElementChild!;
    expect(glitch.children).toHaveLength(1);
    expect((glitch.firstElementChild as HTMLElement).style.animation).toBe('');
  });

  it('PixelHeroSection shows its typewriter headline whole', async () => {
    hydrated = await hydrateWithPreferences(<TypewriterHeadline />, prefersReducedMotion);
    expect(hydrated.problems).toEqual([]);
    const headline = hydrated.container.querySelector('h1')!;
    expect(headline.querySelector('[aria-hidden="true"]')!.textContent).toBe('Loading retro interfaces');
  });

  it('PixelHeroSection shows its glitch headline once, standing still', async () => {
    hydrated = await hydrateWithPreferences(<GlitchHeadline />, prefersReducedMotion);
    expect(hydrated.problems).toEqual([]);
    expect(hydrated.container.querySelectorAll('h1')).toHaveLength(1);
    expect(hydrated.container.querySelector<HTMLElement>('h1')!.parentElement!.style.animation).toBe('');
  });

  it('PixelSpinner stops its blade', async () => {
    hydrated = await hydrateWithPreferences(<SpinnerDefault />, prefersReducedMotion);
    expect(hydrated.problems).toEqual([]);
    expect(hydrated.container.querySelector<HTMLElement>('[data-pxl-spinner-blade]')!.style.animation).toBe('');
  });
});

describe('every manifest example hydrates for a reader every media query matches', () => {
  const manifests = import.meta.glob<{ default: Manifest }>('../*/*.manifest.ts', { eager: true });

  // The server render and the client's see the same instant, so a date
  // example shows the same day in each.
  beforeEach(() => {
    vi.useFakeTimers({ now: Date.now(), toFake: ['Date'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  for (const path of Object.keys(manifests).sort()) {
    const { name, examples } = manifests[path]!.default;
    for (const { id, Component } of examples) {
      it(`${name} › ${id}`, async () => {
        hydrated = await hydrateWithPreferences(<Component />, () => {
          matchMedia = mockMatchMedia(true);
        });
        expect(hydrated.problems).toEqual([]);
      });
    }
  }
});
