import { describe, expect, it } from 'vitest';
import { centerAlignClasses, centerClasses, surfaceClasses } from '../../../index';

describe('center recipe', () => {
  it('centres a block column at the width cap with the page gutter', () => {
    expect(centerClasses('pixel', { maxWidth: '5xl', gutter: 'lg' })).toBe(
      `block mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 ${surfaceClasses('pixel').transition}`,
    );
    expect(centerClasses('linear', { maxWidth: 'prose', gutter: 0 })).toBe(
      `block mx-auto max-w-prose px-0 ${surfaceClasses('linear').transition}`,
    );
  });

  it('aligns the text only when asked', () => {
    expect(centerAlignClasses).toEqual({ left: 'text-left', center: 'text-center', right: 'text-right' });
    expect(centerClasses('pixel', { maxWidth: 'md', gutter: 'md', align: 'center' })).toContain(' text-center ');
    expect(centerClasses('pixel', { maxWidth: 'md', gutter: 'md' })).not.toMatch(/text-(left|center|right)/);
  });

  it('renders inline and draws the surface border on request', () => {
    expect(centerClasses('pixel', { maxWidth: 'md', gutter: 'sm', inline: true }).startsWith('inline-block mx-auto')).toBe(true);
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      expect(centerClasses(surface, { maxWidth: 'md', gutter: 'sm', bordered: true })).toBe(
        `block mx-auto max-w-3xl px-3 ${s.border} ${s.radius} border-retro-border ${s.transition}`,
      );
    }
  });
});
