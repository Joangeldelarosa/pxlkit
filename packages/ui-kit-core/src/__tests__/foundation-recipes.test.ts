/**
 * Class recipes of the foundation components — the stack, the popover, the
 * overlay backdrop, the modal and the form field shell — which every kit
 * renders identically.
 */
import { describe, expect, it } from 'vitest';
import {
  POPOVER_Z_INDEX,
  fieldShellClasses,
  fieldShellTextClasses,
  modalClasses,
  modalLayerClasses,
  modalSizeClasses,
  overlayBackdropClasses,
  popoverArrowClasses,
  popoverArrowSideClasses,
  popoverContentClasses,
  stackAlignClasses,
  stackDirectionClasses,
  stackJustifyClasses,
  surfaceClasses,
  type ModalSize,
  type Surface,
} from '../index';

const SURFACES: Surface[] = ['pixel', 'linear'];
const classesOf = (value: string) => value.split(' ').filter(Boolean);

describe('stack recipes', () => {
  it('maps every direction, alignment and distribution onto one flex utility', () => {
    expect(stackDirectionClasses).toEqual({ col: 'flex-col', row: 'flex-row' });
    for (const value of Object.values(stackAlignClasses)) expect(value).toMatch(/^items-/);
    for (const value of Object.values(stackJustifyClasses)) expect(value).toMatch(/^justify-/);
    expect(Object.keys(stackJustifyClasses)).toEqual(['start', 'center', 'end', 'between', 'around', 'evenly']);
  });
});

describe('popover recipes', () => {
  it('draws the panel with the surface border and large radius', () => {
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      expect(popoverContentClasses(surface)).toBe(
        `bg-retro-bg shadow-xl p-3 outline-none ${s.border} ${s.radiusLg} border-retro-border`,
      );
    }
    expect(POPOVER_Z_INDEX).toBe(70);
  });

  it('points the arrow back at the trigger from every side', () => {
    expect(Object.keys(popoverArrowSideClasses)).toEqual(['top', 'bottom', 'left', 'right']);
    for (const surface of SURFACES) {
      for (const side of ['top', 'bottom', 'left', 'right'] as const) {
        const classes = popoverArrowClasses(surface, side);
        expect(classes.startsWith('absolute h-2 w-2 rotate-45 bg-retro-bg')).toBe(true);
        expect(classes.endsWith(popoverArrowSideClasses[side])).toBe(true);
        expect(classes).toContain(surfaceClasses(surface).border);
      }
    }
    expect(popoverArrowSideClasses.top).toContain('bottom-[-5px]');
    expect(popoverArrowSideClasses.right).toContain('left-[-5px]');
  });
});

describe('overlay backdrop recipe', () => {
  it('covers the viewport, blurred, at 80% by default', () => {
    expect(overlayBackdropClasses()).toBe('fixed inset-0 bg-retro-bg/80 backdrop-blur-sm');
  });

  it('covers a positioned ancestor, at any of its opacities, with or without blur', () => {
    expect(overlayBackdropClasses('absolute', 60, false)).toBe('absolute inset-0 bg-retro-bg/60');
    expect(overlayBackdropClasses('fixed', 90)).toBe('fixed inset-0 bg-retro-bg/90 backdrop-blur-sm');
    expect(overlayBackdropClasses('absolute', 70)).toBe('absolute inset-0 bg-retro-bg/70 backdrop-blur-sm');
  });
});

describe('modal recipes', () => {
  const idle = { closing: false, reducedMotion: false };

  it('centres the panel over the backdrop and sizes it', () => {
    expect(modalLayerClasses).toBe('fixed inset-0 z-[80] flex items-center justify-center p-4');
    for (const size of Object.keys(modalSizeClasses) as ModalSize[]) {
      expect(modalClasses('pixel', size, idle).panel.endsWith(modalSizeClasses[size])).toBe(true);
    }
    expect(modalSizeClasses.full).toContain('overflow-y-auto');
    // A size outside the scale falls back to the default width.
    expect(modalClasses('pixel', 'huge' as ModalSize, idle).panel).toBe(modalClasses('pixel', 'md', idle).panel);
  });

  it('draws a window on the pixel surface and a flat card on the linear one', () => {
    const pixel = modalClasses('pixel', 'md', idle);
    expect(classesOf(pixel.panel)).toContain('p-0');
    expect(pixel.header).toContain('border-b-2');
    expect(pixel.title).toBe('font-pixel text-[11px] text-retro-green');
    expect(pixel.body).toBe('p-5 text-sm text-retro-muted');
    expect(pixel.footer).toContain('border-t-2 border-retro-border');
    expect(pixel.footer).toContain('bg-retro-surface/40');

    const linear = modalClasses('linear', 'md', idle);
    expect(classesOf(linear.panel)).toContain('p-5');
    expect(linear.header).toBe('mb-4 flex items-center justify-between');
    expect(linear.title).toContain(surfaceClasses('linear').fontDisplay);
    expect(linear.body).toBe('text-sm text-retro-muted');
    expect(linear.footer).toContain('border-t border-retro-border');
    expect(linear.closeButton).toContain('rounded-md');
    expect(linear.busy).toContain('rounded-full');
    for (const classes of [pixel, linear]) expect(classes.description).toBe('mb-3 text-xs text-retro-muted/80');
  });

  it('rings the focused close button, keeping an outline for forced-colors mode, which drops the ring', () => {
    for (const surface of SURFACES) {
      const close = classesOf(modalClasses(surface, 'md', idle).closeButton);
      expect(close).toEqual(expect.arrayContaining(['focus-visible:ring-2', 'focus:outline-hidden']));
      expect(close).not.toContain('focus:outline-none');
    }
  });

  it('marks a close in flight and pulses its indicator unless motion is reduced', () => {
    for (const surface of SURFACES) {
      expect(modalClasses(surface, 'md', idle).closeButton).not.toContain('cursor-wait');
      expect(modalClasses(surface, 'md', { closing: true, reducedMotion: false }).closeButton).toContain('opacity-60 cursor-wait');
      expect(modalClasses(surface, 'md', idle).busy).toContain('animate-pulse');
      expect(modalClasses(surface, 'md', { closing: true, reducedMotion: true }).busy).not.toContain('animate-pulse');
    }
  });
});

describe('field shell recipes', () => {
  it('stacks the field and sets its texts in the surface font', () => {
    expect(fieldShellClasses).toBe('block space-y-1.5');
    for (const surface of SURFACES) {
      const { font } = surfaceClasses(surface);
      expect(fieldShellTextClasses(surface)).toEqual({
        label: `text-xs text-retro-muted ${font}`,
        hint: `text-xs text-retro-muted ${font}`,
        error: `text-xs text-retro-red ${font}`,
      });
    }
  });
});
