import { describe, expect, it } from 'vitest';
import { containerClasses, resolveContainerPadding, surfaceClasses } from '../../../index';

describe('container recipe', () => {
  it('spans the full width with the vertical rhythm', () => {
    expect(containerClasses('pixel', 'lg')).toBe(`w-full py-16 sm:py-20 lg:py-24 ${surfaceClasses('pixel').transition}`);
    expect(containerClasses('linear', 'none')).toBe(`w-full py-0 ${surfaceClasses('linear').transition}`);
  });

  it('reads padding as a rhythm, or as a gutter and a rhythm, defaulting both to lg', () => {
    expect(resolveContainerPadding(undefined)).toEqual({ x: 'lg', y: 'lg' });
    expect(resolveContainerPadding(null)).toEqual({ x: 'lg', y: 'lg' });
    expect(resolveContainerPadding('sm')).toEqual({ x: 'lg', y: 'sm' });
    expect(resolveContainerPadding({ x: 'md' })).toEqual({ x: 'md', y: 'lg' });
    expect(resolveContainerPadding({ y: 'xl' })).toEqual({ x: 'lg', y: 'xl' });
    expect(resolveContainerPadding({ x: 0, y: 'none' })).toEqual({ x: 0, y: 'none' });
  });
});
