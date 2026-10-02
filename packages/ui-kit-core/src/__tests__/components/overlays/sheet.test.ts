import { describe, expect, it } from 'vitest';
import { sheetClasses, sheetLayerClasses, sheetSizeClasses, surfaceClasses, type SheetSide, type SheetSize } from '../../../index';

const SIDES: SheetSide[] = ['bottom', 'top'];
const SIZES: SheetSize[] = ['sm', 'md', 'lg', 'full'];
const classesOf = (value: string) => value.split(' ').filter(Boolean);

describe('sheet recipes', () => {
  it('stacks its layer above the modal layer', () => {
    expect(sheetLayerClasses).toBe('fixed inset-0 z-[90]');
  });

  it('docks the panel to its edge at the height of its size', () => {
    for (const side of SIDES) {
      for (const size of SIZES) {
        const panel = classesOf(sheetClasses('pixel', side, size).panel);
        expect(panel).toContain(`${side}-0`);
        expect(panel).toContain(sheetSizeClasses[side][size]);
      }
    }
    expect(sheetSizeClasses.bottom.full).toBe('h-[100dvh]');
  });

  it('borders the edge facing the page, rounding it on the linear surface', () => {
    const border = (surface: 'pixel' | 'linear', side: SheetSide) => classesOf(sheetClasses(surface, side, 'md').panel);
    expect(border('pixel', 'bottom')).toEqual(expect.arrayContaining(['border-2', 'border-t-2']));
    expect(border('pixel', 'top')).toContain('border-b-2');
    expect(border('linear', 'bottom')).toEqual(expect.arrayContaining(['rounded-t-2xl', 'border-t']));
    expect(border('linear', 'top')).toEqual(expect.arrayContaining(['rounded-b-2xl', 'border-b']));
  });

  it('draws the drag handle last on a top sheet, square on the pixel surface', () => {
    expect(sheetClasses('pixel', 'bottom', 'md').handle).toBe('flex h-5 shrink-0 items-center justify-center');
    expect(sheetClasses('pixel', 'top', 'md').handle).toBe('order-last flex h-5 shrink-0 items-center justify-center');
    expect(sheetClasses('pixel', 'bottom', 'md').handleBar).toContain('rounded-none');
    expect(sheetClasses('linear', 'bottom', 'md').handleBar).toContain('rounded-full');
  });

  it('sets the title in the display font of the surface', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const classes = sheetClasses(surface, 'bottom', 'md');
      expect(classes.title).toBe(`text-sm font-semibold text-retro-text ${surfaceClasses(surface).fontDisplay}`);
      expect(classes.header).toBe('border-b border-retro-border/60 px-5 py-3');
      expect(classes.description).toBe('mt-1 text-xs text-retro-muted');
      expect(classes.body).toBe('flex-1 overflow-auto p-5 text-sm text-retro-muted');
    }
  });
});
