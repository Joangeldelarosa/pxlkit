import { describe, it, expect } from 'vitest';
import { isAnimatedIcon } from '../index';
import { testIcon, testAnimatedIcon } from './fixtures';

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
