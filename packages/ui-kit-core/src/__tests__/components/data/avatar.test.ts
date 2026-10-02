import { describe, expect, it } from 'vitest';
import { toneMap, type Tone } from '../../../common';
import {
  avatarAccessibleName,
  avatarClasses,
  avatarInitials,
  avatarRadiusClasses,
  avatarSeedTone,
  avatarSizeClasses,
  avatarStatusFillClasses,
  avatarStatusSizeClasses,
  avatarTone,
  type PixelAvatarShape,
  type PixelAvatarSize,
  type PixelAvatarStatus,
} from '../../../components/data/avatar';

const SIZES: PixelAvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
const SHAPES: PixelAvatarShape[] = ['square', 'circle', 'rounded'];
const STATUSES: PixelAvatarStatus[] = ['online', 'away', 'busy', 'offline'];

const classesOf = (value: string) => value.split(' ');
const upper = (text: string) => text.toUpperCase();

describe('avatar recipes', () => {
  it('takes the first letters of the first two words, upper-cased by the given function', () => {
    expect(avatarInitials('Joangel De La Rosa', upper)).toBe('JD');
    expect(avatarInitials('ana', upper)).toBe('A');
    expect(avatarInitials('ana  lopez', upper)).toBe('AL');
    expect(avatarInitials('işıl gündüz', (text) => text.toLocaleUpperCase('tr'))).toBe('İG');
  });

  it('maps a colour seed to the same non-neutral tone every time', () => {
    const tone = avatarSeedTone('alice@example.com');
    expect(avatarSeedTone('alice@example.com')).toBe(tone);
    const tones = new Set(Array.from('abcdefghijklmnop', (seed) => avatarSeedTone(seed)));
    expect(tones.size).toBeGreaterThan(1);
    expect(tones.has('neutral')).toBe(false);
    expect(avatarSeedTone('')).toBe(avatarSeedTone(''));
  });

  it('prefers an explicit tone over the seed and falls back to green', () => {
    expect(avatarTone('purple', 'alice@example.com')).toBe('purple');
    expect(avatarTone(undefined, 'alice@example.com')).toBe(avatarSeedTone('alice@example.com'));
    expect(avatarTone(undefined, '')).toBe('green');
    expect(avatarTone(undefined, undefined)).toBe('green');
  });

  it('adds the status word to the accessible name', () => {
    expect(avatarAccessibleName('Jane Doe', undefined)).toBe('Jane Doe');
    for (const status of STATUSES) expect(avatarAccessibleName('Jane Doe', status)).toBe(`Jane Doe (${status})`);
  });

  it('frames the initials in the tone, sized and rounded per shape and surface', () => {
    for (const size of SIZES) {
      for (const shape of SHAPES) {
        for (const tone of Object.keys(toneMap) as Tone[]) {
          const pixel = avatarClasses('pixel', { size, shape, tone, status: undefined });
          const linear = avatarClasses('linear', { size, shape, tone, status: undefined });
          const t = toneMap[tone];
          for (const frame of [pixel.frame, linear.frame]) {
            expect(classesOf(frame)).toEqual(expect.arrayContaining([...classesOf(avatarSizeClasses[size]), t.border, t.soft, t.text]));
          }
          expect(classesOf(pixel.frame)).toEqual(expect.arrayContaining(['border-2', 'font-pixel', avatarRadiusClasses.pixel[shape]]));
          expect(classesOf(linear.frame)).toEqual(expect.arrayContaining(['border', 'font-semibold', avatarRadiusClasses.linear[shape]]));
          expect(classesOf(pixel.image)).toContain(avatarRadiusClasses.pixel[shape]);
        }
      }
    }
  });

  it('keeps squares square and rounds circles fully only on the linear surface', () => {
    expect(avatarRadiusClasses.pixel.square).toBe('rounded-none');
    expect(avatarRadiusClasses.linear.square).toBe('rounded-none');
    expect(avatarRadiusClasses.pixel.circle).toBe('rounded-[3px]');
    expect(avatarRadiusClasses.linear.circle).toBe('rounded-full');
    expect(avatarRadiusClasses.linear.rounded).toBe('rounded-lg');
  });

  it('draws the presence dot only with a status, and makes room for it', () => {
    const none = avatarClasses('pixel', { size: 'md', shape: 'circle', tone: 'green', status: undefined });
    expect(none.status).toBe('');
    expect(classesOf(none.root)).not.toContain('pr-0.5');
    for (const size of SIZES) {
      for (const status of STATUSES) {
        const parts = avatarClasses('linear', { size, shape: 'circle', tone: 'green', status });
        expect(classesOf(parts.root)).toContain('pr-0.5');
        expect(classesOf(parts.status)).toEqual(
          expect.arrayContaining([...classesOf(avatarStatusSizeClasses[size]), avatarStatusFillClasses[status], 'ring-retro-bg']),
        );
      }
    }
  });
});
