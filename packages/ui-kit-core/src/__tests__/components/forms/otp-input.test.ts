import { describe, expect, it } from 'vitest';
import {
  focusRing,
  inputBase,
  isOtpComplete,
  otpCellLabel,
  otpCells,
  otpGroupLabel,
  otpInputClasses,
  otpInputMode,
  otpKeydown,
  otpPattern,
  pasteOtp,
  sanitizeOtp,
  setOtpCell,
  surfaceClasses,
  toneMap,
  typeOtpCell,
  type Surface,
} from '../../../index';

describe('OTP input logic', () => {
  it('keeps digits only, or digits and letters', () => {
    expect(sanitizeOtp('1a2-b 3', 'numeric')).toBe('123');
    expect(sanitizeOtp('1a2-b 3', 'alphanumeric')).toBe('1a2b3');
    expect(sanitizeOtp('é!', 'alphanumeric')).toBe('');
  });

  it('spreads the code over the cells, cut to their number', () => {
    expect(otpCells('12', 4)).toEqual(['1', '2', '', '']);
    expect(otpCells('123456', 4)).toEqual(['1', '2', '3', '4']);
    expect(otpCells('', 2)).toEqual(['', '']);
  });

  it('joins the cells back, an emptied cell closing up', () => {
    expect(setOtpCell(['1', '2', '3', ''], 3, '4')).toBe('1234');
    expect(setOtpCell(['1', '2', '3', '4'], 1, '')).toBe('134');
    expect(setOtpCell(['1', '2', '', ''], 3, '9')).toBe('129');
  });

  it('fills a typed cell with its last accepted character and moves on', () => {
    expect(typeOtpCell(['', '', ''], 0, '7', 'numeric')).toEqual({ value: '7', focus: 1 });
    expect(typeOtpCell(['1', '', ''], 0, '12', 'numeric')).toEqual({ value: '2', focus: 1 });
    // The last cell keeps focus.
    expect(typeOtpCell(['1', '2', ''], 2, '3', 'numeric')).toEqual({ value: '123' });
  });

  it('empties a cell that gets nothing it accepts, and keeps focus there', () => {
    expect(typeOtpCell(['1', '2', ''], 1, 'a', 'numeric')).toEqual({ value: '1' });
    expect(typeOtpCell(['', '', ''], 0, 'a', 'alphanumeric')).toEqual({ value: 'a', focus: 1 });
  });

  it('empties the cell on Backspace, or the previous one from an empty cell', () => {
    expect(otpKeydown(['1', '2', ''], 1, 'Backspace')).toEqual({ value: '1' });
    expect(otpKeydown(['1', '2', ''], 2, 'Backspace')).toEqual({ value: '1', focus: 1 });
    expect(otpKeydown(['', '', ''], 0, 'Backspace')).toBeUndefined();
  });

  it('moves between the cells with the arrows, Home and End', () => {
    const cells = ['1', '2', '3'];
    expect(otpKeydown(cells, 1, 'ArrowLeft')).toEqual({ focus: 0 });
    expect(otpKeydown(cells, 0, 'ArrowLeft')).toBeUndefined();
    expect(otpKeydown(cells, 1, 'ArrowRight')).toEqual({ focus: 2 });
    expect(otpKeydown(cells, 2, 'ArrowRight')).toBeUndefined();
    expect(otpKeydown(cells, 2, 'Home')).toEqual({ focus: 0 });
    expect(otpKeydown(cells, 0, 'End')).toEqual({ focus: 2 });
    expect(otpKeydown(cells, 0, 'Tab')).toBeUndefined();
  });

  it('fills the cells from the one pasted into, focusing the cell after', () => {
    expect(pasteOtp(['', '', '', '', '', ''], 0, '123456', 'numeric')).toEqual({ value: '123456', focus: 5 });
    expect(pasteOtp(['1', '', '', ''], 1, '9-8', 'numeric')).toEqual({ value: '198', focus: 3 });
    expect(pasteOtp(['', '', ''], 1, 'abcdef', 'alphanumeric')).toEqual({ value: 'ab', focus: 2 });
    expect(pasteOtp(['', ''], 0, 'abc', 'numeric')).toBeUndefined();
  });

  it('is complete once every cell is filled', () => {
    expect(isOtpComplete('1234', 4)).toBe(true);
    expect(isOtpComplete('123', 4)).toBe(false);
    expect(isOtpComplete('', 0)).toBe(false);
  });

  it('gives the cells the keypad, pattern and names of their variant', () => {
    expect(otpInputMode('numeric')).toBe('numeric');
    expect(otpInputMode('alphanumeric')).toBe('text');
    expect(otpPattern('numeric')).toBe('[0-9]*');
    expect(otpPattern('alphanumeric')).toBe('[0-9a-zA-Z]*');
    expect(otpCellLabel(0, 6)).toBe('Digit 1 of 6');
    expect(otpGroupLabel).toBe('One-time passcode');
  });
});

describe('OTP input recipes', () => {
  const SURFACES: Surface[] = ['pixel', 'linear'];

  it('sizes the cells on the control scale', () => {
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      const c = otpInputClasses(surface, 'md');
      expect(c.root).toBe(`inline-flex max-w-full flex-wrap items-center ${s.font}`);
      expect(c.cell).toBe(
        [
          inputBase,
          s.font,
          s.border,
          s.radius,
          s.transition,
          'h-10 w-10 text-sm',
          'text-sm',
          focusRing,
          toneMap.neutral.ring,
          'text-center px-0 border-retro-border-strong',
          'mx-0.5 first:ml-0 last:mr-0',
        ].join(' '),
      );
      expect(c.separator).toBe('mx-1 inline-flex items-center text-retro-muted select-none');
    }
    expect(otpInputClasses('pixel', 'sm').cell).toContain('h-8 w-8 text-xs text-xs');
    expect(otpInputClasses('pixel', 'lg').cell).toContain('h-12 w-12 text-base text-sm');
  });
});
