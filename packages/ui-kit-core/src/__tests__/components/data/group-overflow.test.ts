import { describe, expect, it } from 'vitest';
import { groupOverflow } from '../../../components/data/group-overflow';

describe('groupOverflow', () => {
  it('shows every item while they fit', () => {
    expect(groupOverflow(0, 5)).toEqual({ visible: 0, hidden: 0 });
    expect(groupOverflow(5, 5)).toEqual({ visible: 5, hidden: 0 });
  });

  it('gives the last place to the overflow item when they do not fit', () => {
    expect(groupOverflow(6, 5)).toEqual({ visible: 4, hidden: 2 });
    expect(groupOverflow(6, 3)).toEqual({ visible: 2, hidden: 4 });
    expect(groupOverflow(2, 1)).toEqual({ visible: 0, hidden: 2 });
    expect(groupOverflow(2, 0)).toEqual({ visible: 0, hidden: 2 });
  });
});
