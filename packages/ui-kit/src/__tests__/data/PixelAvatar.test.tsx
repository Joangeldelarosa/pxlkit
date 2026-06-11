import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelAvatar } from '../../data/PixelAvatar';

describe('PixelAvatar — status dot', () => {
  it('does not render a status dot when status is unset', () => {
    const { container } = render(<PixelAvatar name="Jane Doe" />);
    // Status dot uses [data-status]; no role=status (avoid live-region spam).
    expect(container.querySelector('[data-status]')).toBeNull();
  });

  it.each([
    ['online', 'bg-retro-green'],
    ['away', 'bg-retro-gold'],
    ['busy', 'bg-retro-red'],
    ['offline', 'bg-retro-muted'],
  ] as const)('renders the %s status dot with the matching fill class', (status, fill) => {
    const { container } = render(<PixelAvatar name="Jane Doe" status={status} />);
    const dot = container.querySelector('[data-status]') as HTMLElement | null;
    expect(dot).not.toBeNull();
    expect(dot!.dataset.status).toBe(status);
    expect(dot!.className).toContain(fill);
    // Status text is composed into the avatar's accessible name on the frame.
    const frame = container.querySelector('[data-shape]') as HTMLElement;
    expect(frame.getAttribute('aria-label')).toBe(`Jane Doe (${status})`);
  });
});

describe('PixelAvatar — colorSeed determinism', () => {
  function getToneClass(name: string, colorSeed: string): string {
    const { container } = render(<PixelAvatar name={name} colorSeed={colorSeed} />);
    const frame = container.querySelector('[title]') as HTMLElement;
    return frame.className;
  }

  it('produces identical tone classes for the same colorSeed across renders', () => {
    const a = getToneClass('Joangel', 'joangel@example.com');
    const b = getToneClass('Otro', 'joangel@example.com');
    expect(a).toBe(b);
  });

  it('produces stable tone classes across many calls (no randomness)', () => {
    const samples = Array.from({ length: 5 }, () => getToneClass('Same', 'seed-fixed-42'));
    const unique = new Set(samples);
    expect(unique.size).toBe(1);
  });

  it('explicit tone overrides colorSeed', () => {
    const seeded = getToneClass('Person', 'whatever-seed');
    const { container } = render(<PixelAvatar name="Person" colorSeed="whatever-seed" tone="purple" />);
    const frame = container.querySelector('[title]') as HTMLElement;
    // The explicit purple tone should win, so the class set must include purple border tokens
    // which differ from the seed-derived tone for "whatever-seed". We assert override by
    // verifying the purple tone class set is applied.
    expect(frame.className).toContain('purple');
    // And the seeded version should NOT have used the override path.
    expect(seeded).not.toBe(frame.className);
  });

  it('different colorSeeds eventually land on different tones (palette of 6)', () => {
    const seeds = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'];
    const classes = new Set(seeds.map((seed) => getToneClass('Test', seed)));
    expect(classes.size).toBeGreaterThan(1);
  });
});

describe('PixelAvatar — lazy image attrs', () => {
  it('adds loading="lazy" and decoding="async" to the img element', () => {
    const { container } = render(
      <PixelAvatar name="Jane Doe" src="https://example.com/avatar.png" />,
    );
    const img = container.querySelector('img') as HTMLImageElement | null;
    expect(img).not.toBeNull();
    expect(img!.getAttribute('loading')).toBe('lazy');
    expect(img!.getAttribute('decoding')).toBe('async');
    expect(img!.getAttribute('alt')).toBe('Jane Doe');
  });

  it('falls back to initials when src is missing (no img tag)', () => {
    const { container } = render(<PixelAvatar name="Jane Doe" />);
    expect(container.querySelector('img')).toBeNull();
    const frame = container.querySelector('[title="Jane Doe"]') as HTMLElement;
    expect(frame.textContent).toBe('JD');
  });
});

describe('PixelAvatar — sizes & shape', () => {
  it.each([
    ['xs', 'h-6'],
    ['sm', 'h-8'],
    ['md', 'h-10'],
    ['lg', 'h-12'],
    ['xl', 'h-16'],
  ] as const)('size %s applies the matching dimension class', (size, dimClass) => {
    const { container } = render(<PixelAvatar name="JD" size={size} />);
    const frame = container.querySelector('[title="JD"]') as HTMLElement;
    expect(frame.className).toContain(dimClass);
  });

  it('defaults shape to circle (rounded-full on linear surface)', () => {
    const { container } = render(<PixelAvatar name="JD" surface="linear" />);
    const frame = container.querySelector('[title="JD"]') as HTMLElement;
    expect(frame.dataset.shape).toBe('circle');
    expect(frame.className).toContain('rounded-full');
  });

  it('shape=square applies rounded-none', () => {
    const { container } = render(<PixelAvatar name="JD" shape="square" surface="linear" />);
    const frame = container.querySelector('[title="JD"]') as HTMLElement;
    expect(frame.dataset.shape).toBe('square');
    expect(frame.className).toContain('rounded-none');
  });

  it('shape=rounded applies rounded-lg on linear surface', () => {
    const { container } = render(<PixelAvatar name="JD" shape="rounded" surface="linear" />);
    const frame = container.querySelector('[title="JD"]') as HTMLElement;
    expect(frame.dataset.shape).toBe('rounded');
    expect(frame.className).toContain('rounded-lg');
  });
});
