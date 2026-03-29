import { describe, it, expect } from 'vitest';
import { isAnimatedIcon, isParallaxIcon } from '../index';
import { testIcon, testAnimatedIcon, testParallaxIcon } from './fixtures';

// Import barrel files to ensure they are covered
import * as componentsBarrel from '../components/index';
import * as utilsBarrel from '../utils/index';

describe('isAnimatedIcon', () => {
  it('returns false for a static icon (has grid, no frames)', () => {
    expect(isAnimatedIcon(testIcon)).toBe(false);
  });

  it('returns true for an animated icon (has frames)', () => {
    expect(isAnimatedIcon(testAnimatedIcon)).toBe(true);
  });
});

describe('isParallaxIcon', () => {
  it('returns false for a static icon', () => {
    expect(isParallaxIcon(testIcon)).toBe(false);
  });

  it('returns false for an animated icon', () => {
    expect(isParallaxIcon(testAnimatedIcon)).toBe(false);
  });

  it('returns true for a parallax icon (has layers)', () => {
    expect(isParallaxIcon(testParallaxIcon)).toBe(true);
  });
});

describe('barrel exports', () => {
  it('components/index.ts re-exports PxlKitIcon', () => {
    expect(componentsBarrel.PxlKitIcon).toBeDefined();
  });

  it('components/index.ts re-exports PixelToast', () => {
    expect(componentsBarrel.PixelToast).toBeDefined();
  });

  it('components/index.ts re-exports AnimatedPxlKitIcon', () => {
    expect(componentsBarrel.AnimatedPxlKitIcon).toBeDefined();
  });

  it('components/index.ts re-exports ParallaxPxlKitIcon', () => {
    expect(componentsBarrel.ParallaxPxlKitIcon).toBeDefined();
  });

  it('utils/index.ts re-exports gridToPixels', () => {
    expect(utilsBarrel.gridToPixels).toBeDefined();
  });

  it('utils/index.ts re-exports gridToSvg', () => {
    expect(utilsBarrel.gridToSvg).toBeDefined();
  });

  it('utils/index.ts re-exports svgToDataUri', () => {
    expect(utilsBarrel.svgToDataUri).toBeDefined();
  });
});
