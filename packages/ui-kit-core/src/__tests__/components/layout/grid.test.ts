import { describe, expect, it } from 'vitest';
import {
  gridClasses,
  gridColumnClasses,
  gridColumnGapClasses,
  gridColumnsClasses,
  gridJustifyClasses,
  gridRowClasses,
  gridRowGapClasses,
  gridTemplateColumns,
  stackGap,
  surfaceClasses,
  type GridColumnCount,
} from '../../../index';

const transition = surfaceClasses('pixel').transition;

describe('grid recipes', () => {
  it('spells out a column template per breakpoint and count', () => {
    for (const [breakpoint, counts] of Object.entries(gridColumnClasses)) {
      const prefix = breakpoint === 'base' ? '' : `${breakpoint}:`;
      for (const [count, classes] of Object.entries(counts)) expect(classes).toBe(`${prefix}grid-cols-${count}`);
    }
    for (const [count, classes] of Object.entries(gridRowClasses)) expect(classes).toBe(`grid-rows-${count}`);
  });

  it('keeps the column and row gaps on the stack gap scale', () => {
    expect(Object.keys(gridColumnGapClasses)).toEqual(Object.keys(stackGap));
    expect(Object.keys(gridRowGapClasses)).toEqual(Object.keys(stackGap));
    for (const key of Object.keys(stackGap) as unknown as Array<keyof typeof stackGap>) {
      expect(gridColumnGapClasses[key]).toBe(stackGap[key].replace('gap-', 'gap-x-'));
      expect(gridRowGapClasses[key]).toBe(stackGap[key].replace('gap-', 'gap-y-'));
    }
    expect(gridJustifyClasses.center).toBe('justify-items-center');
  });

  it('builds the column classes from a count or a count per breakpoint, mobile first', () => {
    expect(gridColumnsClasses(undefined)).toBe('');
    expect(gridColumnsClasses(3)).toBe('grid-cols-3');
    expect(gridColumnsClasses(7 as GridColumnCount)).toBe('');
    expect(gridColumnsClasses({ lg: 4, base: 1, md: 3, sm: 2, xl: 12 })).toBe(
      'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-12',
    );
    expect(gridColumnsClasses({ md: 2, lg: 9 as GridColumnCount })).toBe('md:grid-cols-2');
  });

  it('lays out a grid with columns, rows, the uniform gap and alignment', () => {
    expect(gridClasses('pixel', { gap: 4 })).toBe(`grid gap-4 ${transition}`);
    expect(gridClasses('pixel', { cols: 2, rows: 3, gap: 6, align: 'center', justify: 'end' })).toBe(
      `grid grid-cols-2 grid-rows-3 gap-6 items-center justify-items-end ${transition}`,
    );
    expect(gridClasses('linear', { gap: 4 })).toBe(`grid gap-4 ${surfaceClasses('linear').transition}`);
  });

  it('replaces the uniform gap with column and row gaps, zero included', () => {
    expect(gridClasses('pixel', { cols: 2, gap: 4, colGap: 8, rowGap: 2 })).toBe(
      `grid grid-cols-2 gap-x-8 gap-y-2 ${transition}`,
    );
    expect(gridClasses('pixel', { gap: 4, colGap: 0 })).toBe(`grid gap-x-0 ${transition}`);
    expect(gridClasses('pixel', { gap: 4, rowGap: 0 })).toBe(`grid gap-y-0 ${transition}`);
  });

  it('leaves the columns to the inline template when fitting or filling', () => {
    expect(gridClasses('pixel', { cols: 3, gap: 4, autoFit: true })).toBe(`grid gap-4 ${transition}`);
    expect(gridClasses('pixel', { cols: { base: 1 }, gap: 4, autoFill: true })).toBe(`grid gap-4 ${transition}`);
    expect(gridTemplateColumns({ minColWidth: '16rem' })).toBeUndefined();
    expect(gridTemplateColumns({ autoFit: true, minColWidth: '12rem' })).toBe(
      'repeat(auto-fit, minmax(min(12rem, 100%), 1fr))',
    );
    expect(gridTemplateColumns({ autoFill: true, minColWidth: '200px' })).toBe(
      'repeat(auto-fill, minmax(min(200px, 100%), 1fr))',
    );
    expect(gridTemplateColumns({ autoFit: true, autoFill: true, minColWidth: '10rem' })).toContain('auto-fit');
  });
});
