import { describe, expect, it } from 'vitest';
import {
  clampNumber,
  focusRing,
  formatNumberInput,
  inputBase,
  numberInputAtLimit,
  numberInputClasses,
  parseNumberInput,
  roundToPrecision,
  settleNumberInput,
  sizeHeight,
  stepNumberInput,
  surfaceClasses,
  toneMap,
  type NumberInputClassOptions,
  type Surface,
} from '../../../index';

const SURFACES: Surface[] = ['pixel', 'linear'];

describe('number input logic', () => {
  it('clamps to the bounds it is given', () => {
    expect(clampNumber(5, 0, 10)).toBe(5);
    expect(clampNumber(-1, 0, 10)).toBe(0);
    expect(clampNumber(11, 0, 10)).toBe(10);
    expect(clampNumber(-1)).toBe(-1);
    expect(clampNumber(99, undefined, 10)).toBe(10);
  });

  it('rounds to a precision', () => {
    expect(roundToPrecision(0.1 + 0.2, 2)).toBe(0.3);
    expect(roundToPrecision(3.14159, 3)).toBe(3.142);
    expect(roundToPrecision(2.5, 0)).toBe(3);
  });

  it('formats with fixed decimals and grouped digits, and nothing without a value', () => {
    expect(formatNumberInput(undefined, 2, ',')).toBe('');
    expect(formatNumberInput(Number.NaN, undefined, undefined)).toBe('');
    expect(formatNumberInput(42, undefined, undefined)).toBe('42');
    expect(formatNumberInput(19.9, 2, undefined)).toBe('19.90');
    expect(formatNumberInput(1500000, undefined, ',')).toBe('1,500,000');
    expect(formatNumberInput(-1234567.891, 2, ' ')).toBe('-1 234 567.89');
    expect(formatNumberInput(999, undefined, ',')).toBe('999');
  });

  it('reads typed numbers, dropping separators, minus signs when not allowed and other characters', () => {
    expect(parseNumberInput('42', undefined, true)).toEqual({ text: '42', num: 42 });
    expect(parseNumberInput('1,500,000', ',', true)).toEqual({ text: '1500000', num: 1500000 });
    // A separator that is a regular-expression character is matched literally.
    expect(parseNumberInput('1.500.000', '.', true)).toEqual({ text: '1500000', num: 1500000 });
    expect(parseNumberInput('-42', undefined, false)).toEqual({ text: '42', num: 42 });
    expect(parseNumberInput('$ 12.5 USD', undefined, true)).toEqual({ text: '12.5', num: 12.5 });
  });

  it('keeps partial and unreadable input as typed, without a number', () => {
    for (const raw of ['', '-', '.', '-.', 'abc']) {
      expect(parseNumberInput(raw, undefined, true)).toEqual({ text: raw, num: undefined });
    }
    expect(parseNumberInput('1.2.3', undefined, true)).toEqual({ text: '1.2.3', num: undefined });
    expect(parseNumberInput('--', undefined, false)).toEqual({ text: '--', num: undefined });
  });

  it('steps from the value, or from the minimum or zero without one, clamped and rounded', () => {
    expect(stepNumberInput(5, 1, 1, {})).toBe(6);
    expect(stepNumberInput(5, -1, 2, {})).toBe(3);
    expect(stepNumberInput(undefined, 1, 1, {})).toBe(1);
    expect(stepNumberInput(undefined, 1, 1, { min: 10 })).toBe(11);
    expect(stepNumberInput(100, 1, 1, { min: 0, max: 100 })).toBe(100);
    expect(stepNumberInput(150, -1, 1, { min: 0, max: 100 })).toBe(100);
    expect(stepNumberInput(0.1, 1, 0.2, { precision: 2 })).toBe(0.3);
  });

  it('settles on blur: clamped unless told not to, rounded, non-finite values rounding to zero', () => {
    expect(settleNumberInput(150, 'blur', { min: 0, max: 100 })).toBe(100);
    expect(settleNumberInput(150, 'strict', { min: 0, max: 100 })).toBe(100);
    expect(settleNumberInput(150, 'none', { min: 0, max: 100 })).toBe(150);
    expect(settleNumberInput(3.14159, 'blur', { precision: 2 })).toBe(3.14);
    expect(settleNumberInput(Number.POSITIVE_INFINITY, 'none', { precision: 1 })).toBe(0);
    expect(settleNumberInput(Number.POSITIVE_INFINITY, 'none', {})).toBe(Number.POSITIVE_INFINITY);
  });

  it('tells when a stepper is at its bound', () => {
    expect(numberInputAtLimit(100, 1, { max: 100 })).toBe(true);
    expect(numberInputAtLimit(150, 1, { max: 100 })).toBe(true);
    expect(numberInputAtLimit(99, 1, { max: 100 })).toBe(false);
    expect(numberInputAtLimit(0, -1, { min: 0 })).toBe(true);
    expect(numberInputAtLimit(1, -1, { min: 0 })).toBe(false);
    expect(numberInputAtLimit(100, 1, { min: 0 })).toBe(false);
    expect(numberInputAtLimit(undefined, 1, { min: 0, max: 0 })).toBe(false);
  });
});

describe('number input recipes', () => {
  const plain: NumberInputClassOptions = {
    tone: 'neutral',
    size: 'md',
    invalid: false,
    prefix: false,
    suffix: false,
    hideControls: false,
  };

  it('composes the input and pads it for the prefix, suffix and steppers', () => {
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      expect(numberInputClasses(surface, { ...plain, tone: 'cyan', size: 'lg' }).input).toBe(
        `${inputBase} ${s.font} ${s.border} ${s.radius} ${s.transition} ${sizeHeight.lg} ${focusRing} ${toneMap.cyan.ring} border-retro-border-strong pl-3 pr-16`,
      );
    }
    const input = (options: Partial<NumberInputClassOptions>) =>
      numberInputClasses('pixel', { ...plain, ...options }).input.split(' ');
    expect(input({ prefix: true })).toContain('pl-8');
    expect(input({ hideControls: true })).toContain('pr-3');
    expect(input({ hideControls: true, suffix: true })).toContain('pr-10');
    expect(input({ invalid: true })).toContain('border-retro-red/60');
  });

  it('places the suffix left of the steppers, or at the edge without them', () => {
    expect(numberInputClasses('pixel', { ...plain, suffix: true }).suffix.endsWith('right-16')).toBe(true);
    expect(numberInputClasses('pixel', { ...plain, suffix: true, hideControls: true }).suffix.endsWith('right-3')).toBe(
      true,
    );
  });

  it('stacks the steppers in the surface font and corners', () => {
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      const c = numberInputClasses(surface, plain);
      expect(c.shell).toBe('relative block');
      expect(c.controls).toBe('absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5');
      expect(c.prefix).toContain(s.font);
      expect(c.stepper).toContain(`${s.font} ${s.radius} h-3.5 flex items-center justify-center`);
      expect(c.stepper).toContain('disabled:opacity-40');
    }
  });
});
