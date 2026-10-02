import { describe, expect, it } from 'vitest';
import {
  PAGINATION_ELLIPSIS as GAP,
  paginationClasses,
  paginationEllipsisClasses,
  paginationPageClasses,
  paginationStepClasses,
  paginationSteps,
  paginationWindow,
} from '../../../components/navigation/pagination';

const classesOf = (value: string) => value.split(' ');
const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

describe('paginationWindow', () => {
  it('lists every page up to seven, whatever the page and siblings', () => {
    expect(paginationWindow(1, 0)).toEqual([]);
    expect(paginationWindow(1, 1)).toEqual([1]);
    for (let total = 1; total <= 7; total++) {
      for (const page of [-1, 0, 1, total, total + 3]) {
        for (const siblings of [0, 1, 3]) expect(paginationWindow(page, total, siblings)).toEqual(range(1, total));
      }
    }
  });

  it('windows the pages around the current one between the first and last', () => {
    expect(paginationWindow(10, 20)).toEqual([1, GAP, 9, 10, 11, GAP, 20]);
    expect(paginationWindow(10, 20, 2)).toEqual([1, GAP, 8, 9, 10, 11, 12, GAP, 20]);
    expect(paginationWindow(10, 20, 0)).toEqual([1, GAP, 10, GAP, 20]);
    expect(paginationWindow(5, 50)).toEqual([1, GAP, 4, 5, 6, GAP, 50]);
  });

  it('drops the ellipsis on the side where the window reaches the first or last page', () => {
    expect(paginationWindow(1, 10)).toEqual([1, 2, GAP, 10]);
    expect(paginationWindow(2, 10)).toEqual([1, 2, 3, GAP, 10]);
    expect(paginationWindow(3, 10)).toEqual([1, 2, 3, 4, GAP, 10]);
    expect(paginationWindow(4, 10)).toEqual([1, GAP, 3, 4, 5, GAP, 10]);
    expect(paginationWindow(8, 10)).toEqual([1, GAP, 7, 8, 9, 10]);
    expect(paginationWindow(9, 10)).toEqual([1, GAP, 8, 9, 10]);
    expect(paginationWindow(10, 10)).toEqual([1, GAP, 9, 10]);
    expect(paginationWindow(1, 8)).toEqual([1, 2, GAP, 8]);
    expect(paginationWindow(8, 8)).toEqual([1, GAP, 7, 8]);
  });

  it('stands an ellipsis for a single left-out page too', () => {
    expect(paginationWindow(5, 8)).toEqual([1, GAP, 4, 5, 6, GAP, 8]);
  });

  it('shows every page when the siblings cover them all', () => {
    expect(paginationWindow(10, 20, 20)).toEqual(range(1, 20));
  });

  it('keeps the first and last pages when the page is out of range', () => {
    expect(paginationWindow(0, 10)).toEqual([1, GAP, 10]);
    expect(paginationWindow(-4, 10)).toEqual([1, GAP, 10]);
    expect(paginationWindow(11, 10)).toEqual([1, GAP, 10]);
    expect(paginationWindow(50, 10)).toEqual([1, GAP, 10]);
  });

  it('always shows the ends, the current page and its siblings, with a gap exactly where pages are missing', () => {
    for (let total = 8; total <= 30; total++) {
      for (let page = -1; page <= total + 2; page++) {
        for (let siblings = 0; siblings <= 4; siblings++) {
          const entries = paginationWindow(page, total, siblings);
          expect(entries[0]).toBe(1);
          expect(entries[entries.length - 1]).toBe(total);
          const pages = entries.filter((entry): entry is number => entry !== GAP);
          for (let i = Math.max(1, page - siblings); i <= Math.min(total, page + siblings); i++) expect(pages).toContain(i);
          for (let i = 1; i < entries.length; i++) {
            const before = entries[i - 1];
            const entry = entries[i];
            if (entry === GAP) {
              expect(before).not.toBe(GAP);
              expect((entries[i + 1] as number) - (before as number)).toBeGreaterThan(1);
            } else if (before !== GAP) {
              expect(entry - before).toBe(1);
            }
          }
        }
      }
    }
  });
});

describe('paginationSteps', () => {
  it('moves one page back or on, disabled at the ends', () => {
    expect(paginationSteps(3, 5)).toEqual({ prev: { page: 2, disabled: false }, next: { page: 4, disabled: false } });
    expect(paginationSteps(1, 5)).toEqual({ prev: { page: 1, disabled: true }, next: { page: 2, disabled: false } });
    expect(paginationSteps(5, 5)).toEqual({ prev: { page: 4, disabled: false }, next: { page: 5, disabled: true } });
    expect(paginationSteps(1, 1)).toEqual({ prev: { page: 1, disabled: true }, next: { page: 1, disabled: true } });
  });

  it('keeps the target inside the pages when the page is out of range', () => {
    expect(paginationSteps(0, 5).prev).toEqual({ page: 1, disabled: true });
    expect(paginationSteps(9, 5).next).toEqual({ page: 5, disabled: true });
  });
});

describe('pagination recipes', () => {
  it('wraps the buttons in a row', () => {
    expect(classesOf(paginationClasses)).toEqual(expect.arrayContaining(['inline-flex', 'flex-wrap', 'gap-1']));
  });

  it('dims a disabled step', () => {
    expect(classesOf(paginationStepClasses('pixel', true))).toEqual(expect.arrayContaining(['opacity-50', 'cursor-not-allowed']));
    expect(classesOf(paginationStepClasses('pixel', false))).toContain('hover:bg-retro-surface');
    expect(classesOf(paginationStepClasses('linear', false))).toEqual(expect.arrayContaining(['border', 'rounded-md', 'font-sans']));
  });

  it('colours the current page', () => {
    expect(classesOf(paginationPageClasses('pixel', true))).toEqual(
      expect.arrayContaining(['w-8', 'border-2', 'pxl-corner-sm', 'text-retro-green']),
    );
    expect(classesOf(paginationPageClasses('pixel', false))).toContain('text-retro-muted');
  });

  it('sizes the ellipsis like a page button', () => {
    expect(classesOf(paginationEllipsisClasses('linear'))).toEqual(expect.arrayContaining(['h-8', 'w-8', 'font-sans']));
  });
});
