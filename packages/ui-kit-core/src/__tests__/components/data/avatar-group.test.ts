import { describe, expect, it } from 'vitest';
import { tone, type ToneKey } from '../../../tokens';
import type { PixelAvatarSize } from '../../../components/data/avatar';
import {
  avatarGroupClasses,
  avatarGroupOverflowClasses,
  avatarGroupOverflowLabel,
  avatarGroupOverlapClasses,
  avatarGroupSizeClasses,
  avatarGroupSlotClasses,
} from '../../../components/data/avatar-group';

const SIZES: PixelAvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
const classesOf = (value: string) => value.split(' ');

describe('avatar group recipes', () => {
  it('lays the slots out in a row', () => {
    expect(avatarGroupClasses).toBe('inline-flex flex-row items-center');
  });

  it('overlaps every slot but the first, ringed with the page colour', () => {
    for (const size of SIZES) {
      const first = classesOf(avatarGroupSlotClasses('pixel', size, 0));
      const next = classesOf(avatarGroupSlotClasses('pixel', size, 1));
      expect(first).toEqual(expect.arrayContaining([...classesOf(avatarGroupSizeClasses[size]), 'ring-2', 'ring-retro-bg', 'bg-retro-bg']));
      expect(first).not.toContain(avatarGroupOverlapClasses[size]);
      expect(next).toContain(avatarGroupOverlapClasses[size]);
    }
  });

  it('rounds the slots per surface', () => {
    expect(classesOf(avatarGroupSlotClasses('pixel', 'md', 0))).toEqual(expect.arrayContaining(['border-2', 'rounded-[3px]']));
    expect(classesOf(avatarGroupSlotClasses('linear', 'md', 0))).toEqual(expect.arrayContaining(['border', 'rounded-full']));
  });

  it('paints the "+N" tile in the group tone and overlaps it after avatars', () => {
    for (const key of Object.keys(tone) as ToneKey[]) {
      const tile = classesOf(avatarGroupOverflowClasses('linear', 'md', key, true));
      expect(tile).toEqual(expect.arrayContaining([tone[key].border, tone[key].text, 'font-sans', 'font-pixel', '-ml-3']));
    }
    expect(classesOf(avatarGroupOverflowClasses('pixel', 'md', 'neutral', false))).not.toContain('-ml-3');
  });

  it('words the hidden count of the "+N" tile', () => {
    expect(avatarGroupOverflowLabel(3)).toBe('3 more users');
  });
});
