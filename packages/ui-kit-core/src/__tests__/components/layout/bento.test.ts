import { describe, expect, it } from 'vitest';
import { BENTO_AUTO_ROWS, bentoClasses, bentoColumnsClasses } from '../../../index';

describe('bento recipes', () => {
  it('stacks cells on phones and reaches the column count from lg', () => {
    expect(bentoColumnsClasses[3]).toBe('grid-cols-1 sm:grid-cols-2 lg:grid-cols-3');
    expect(bentoColumnsClasses[4]).toBe('grid-cols-1 sm:grid-cols-2 lg:grid-cols-4');
    expect(bentoColumnsClasses[6]).toBe('grid-cols-2 sm:grid-cols-3 lg:grid-cols-6');
  });

  it('lays out the grid with the gap token and rows of at least 160px', () => {
    expect(bentoClasses(3, 4)).toBe('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4');
    expect(bentoClasses(6, 0)).toBe('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-0');
    expect(BENTO_AUTO_ROWS).toBe('minmax(160px, 1fr)');
  });
});
