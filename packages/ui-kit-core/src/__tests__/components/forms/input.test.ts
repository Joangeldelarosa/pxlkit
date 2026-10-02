import { describe, expect, it } from 'vitest';
import {
  fieldBorderClass,
  focusRing,
  inputBase,
  inputClasses,
  inputControlClasses,
  sizeHeight,
  surfaceClasses,
  toneMap,
  type InputControlOptions,
  type Size,
  type Surface,
} from '../../../index';

const SURFACES: Surface[] = ['pixel', 'linear'];
const SIZES: Size[] = ['sm', 'md', 'lg'];
const plain: InputControlOptions = {
  tone: 'neutral',
  size: 'md',
  invalid: false,
  leading: false,
  trailing: false,
  clearButton: false,
  addonLeft: false,
  addonRight: false,
};
const classesOf = (value: string) => value.split(' ');

describe('input recipes', () => {
  it('borders a control red while it shows an error', () => {
    expect(fieldBorderClass(false)).toBe('border-retro-border-strong');
    expect(fieldBorderClass(true)).toBe('border-retro-red/60');
  });

  it('composes the input from the base, surface, size and tone', () => {
    for (const surface of SURFACES) {
      for (const size of SIZES) {
        const s = surfaceClasses(surface);
        expect(inputControlClasses(surface, { ...plain, size, tone: 'cyan' })).toBe(
          [
            inputBase,
            s.font,
            s.border,
            s.radius,
            s.transition,
            sizeHeight[size],
            focusRing,
            toneMap.cyan.ring,
            'border-retro-border-strong pl-3 pr-3',
          ].join(' '),
        );
      }
    }
    expect(classesOf(inputControlClasses('pixel', { ...plain, invalid: true }))).toContain('border-retro-red/60');
  });

  it('reserves room for what sits inside the shell', () => {
    const input = (options: Partial<InputControlOptions>) => classesOf(inputControlClasses('pixel', { ...plain, ...options }));
    expect(input({ leading: true })).toContain('pl-10');
    expect(input({ trailing: true })).toContain('pr-10');
    expect(input({ clearButton: true })).toContain('pr-10');
    expect(input({ trailing: true, clearButton: true })).toContain('pr-16');
  });

  it('flattens the corners joined to an addon', () => {
    const joined = inputControlClasses('linear', { ...plain, addonLeft: true, addonRight: true });
    expect(classesOf(joined)).toEqual(expect.arrayContaining(['rounded-l-none', 'rounded-r-none']));
    expect(classesOf(inputControlClasses('linear', plain))).not.toContain('rounded-l-none');
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      const c = inputClasses(surface, 'lg');
      const addon = `inline-flex items-center bg-retro-surface/60 px-3 text-retro-muted shrink-0 ${s.font} ${s.border} ${s.radius} ${sizeHeight.lg}`;
      expect(c.addonLeft).toBe(`${addon} border-retro-border-strong rounded-r-none border-r-0`);
      expect(c.addonRight).toBe(`${addon} border-retro-border-strong rounded-l-none border-l-0`);
    }
  });

  it('lays out the content inside the shell', () => {
    const c = inputClasses('pixel', 'md');
    expect(c.shell).toBe('relative block w-full min-w-0');
    expect(c.addons).toBe('flex w-full items-stretch');
    expect(c.leading).toContain('absolute left-3');
    expect(c.leading).toContain('pointer-events-none');
    expect(c.trailing).toContain('absolute right-3');
    expect(c.clearButton).toContain('hover:text-retro-text');
    expect(c.clearIcon).toBe('h-3 w-3');
    expect(c.suffix).toBe(`pointer-events-none inline-flex items-center justify-center shrink-0 ${surfaceClasses('pixel').font}`);
    expect(c.spinner).toContain('animate-spin');
  });
});
