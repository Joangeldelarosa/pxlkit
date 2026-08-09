import { describe, expect, it } from 'vitest';
import { gridToSignature, jaccard } from '../skill-refs/icons';

const solidRow = ['G'.repeat(16), ...Array(15).fill('.'.repeat(16))];
const sameRow = [...solidRow];
const otherRow = [...Array(15).fill('.'.repeat(16)), 'G'.repeat(16)];

describe('icon shape signatures', () => {
  it('produces 64 hex chars for a 16x16 grid', () => {
    expect(gridToSignature(solidRow)).toHaveLength(64);
  });

  it('scores identical grids as 1', () => {
    expect(jaccard(gridToSignature(solidRow), gridToSignature(sameRow))).toBe(1);
  });

  it('scores disjoint grids as 0', () => {
    expect(jaccard(gridToSignature(solidRow), gridToSignature(otherRow))).toBe(0);
  });
});
