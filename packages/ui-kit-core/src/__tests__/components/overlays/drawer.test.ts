import { describe, expect, it } from 'vitest';
import {
  drawerBodyClasses,
  drawerFooterClasses,
  drawerHeaderClasses,
  drawerHeightClasses,
  drawerLayerClasses,
  drawerPanelClasses,
  drawerPositionClasses,
  drawerWidthClasses,
  surfaceClasses,
  type DrawerSide,
  type DrawerSize,
} from '../../../index';

const SIDES: DrawerSide[] = ['right', 'left', 'top', 'bottom'];
const SIZES: DrawerSize[] = ['sm', 'md', 'lg', 'xl', 'full'];
const classesOf = (value: string) => value.split(' ').filter(Boolean);

describe('drawer recipes', () => {
  it('covers the viewport with its layer', () => {
    expect(drawerLayerClasses).toBe('fixed inset-0 z-[80]');
  });

  it('pins the panel to its side and slides it in from there', () => {
    for (const side of SIDES) {
      const classes = classesOf(drawerPositionClasses(side, 'md'));
      expect(classes).toContain(`${side}-0`);
      expect(classes).toContain(`motion-safe:animate-[pxl-drawer-in-${side}_180ms_ease-out]`);
    }
    expect(drawerPositionClasses('left', 'md')).toContain('translate-x-0');
    expect(drawerPositionClasses('top', 'md')).toContain('translate-y-0');
  });

  it('sizes the width on the left and right sides and the height on the top and bottom ones', () => {
    for (const size of SIZES) {
      expect(classesOf(drawerPositionClasses('right', size))).toContain(drawerWidthClasses[size]);
      expect(classesOf(drawerPositionClasses('left', size))).toContain(drawerWidthClasses[size]);
      expect(classesOf(drawerPositionClasses('top', size))).toContain(drawerHeightClasses[size]);
      expect(classesOf(drawerPositionClasses('bottom', size))).toContain(drawerHeightClasses[size]);
    }
    expect(drawerWidthClasses.full).toBe('w-screen');
    expect(drawerHeightClasses.full).toBe('h-screen');
  });

  it('borders the panel with the surface border', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      expect(drawerPanelClasses(surface, 'right', 'md')).toBe(
        `fixed bg-retro-bg shadow-2xl flex flex-col outline-none ${surfaceClasses(surface).border} border-retro-border ${drawerPositionClasses('right', 'md')}`,
      );
    }
  });

  it('sets the header and footer off with a surface-aware divider', () => {
    expect(drawerHeaderClasses('pixel')).toContain('border-b-2 border-retro-border');
    expect(drawerHeaderClasses('linear')).toContain('border-b border-retro-border');
    expect(drawerFooterClasses('pixel')).toContain('border-t-2 border-retro-border');
    expect(drawerFooterClasses('linear')).toContain('border-t border-retro-border');
    expect(drawerFooterClasses('linear')).toContain('justify-end gap-2');
    expect(drawerBodyClasses).toBe('flex-1 overflow-y-auto px-4 py-4');
  });
});
