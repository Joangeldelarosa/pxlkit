import { describe, expect, it } from 'vitest';
import {
  PROGRESS_DEFAULT_LABEL,
  PROGRESS_SEGMENTS,
  clampProgress,
  progressClasses,
  progressFillWidth,
  progressSegmentClasses,
  toneMap,
} from '../../../index';

const determinate = { indeterminate: false };
const indeterminate = { indeterminate: true };

describe('progress values', () => {
  it('clamps the value to 0–100', () => {
    expect(clampProgress(-25)).toBe(0);
    expect(clampProgress(42)).toBe(42);
    expect(clampProgress(150)).toBe(100);
  });

  it('names an unlabelled bar "Progress"', () => {
    expect(PROGRESS_DEFAULT_LABEL).toBe('Progress');
  });

  it('fills the linear track up to the value, or entirely while indeterminate', () => {
    expect(progressFillWidth(55, determinate)).toBe('55%');
    expect(progressFillWidth(150, determinate)).toBe('100%');
    expect(progressFillWidth(10, indeterminate)).toBe('100%');
  });
});

describe('progress recipes', () => {
  it('draws a segment row on the pixel surface and a rounded track on the linear one', () => {
    expect(progressClasses('pixel', 'green', determinate).track).toBe(
      'flex gap-0.5 p-0.5 border-2 pxl-corner-sm border-retro-border/60 bg-retro-surface/60',
    );
    expect(progressClasses('linear', 'green', determinate).track).toBe(
      'h-2.5 overflow-hidden rounded-full border border-retro-border bg-retro-surface/80',
    );
  });

  it('colours the percentage and the linear fill with the tone, pulsing while indeterminate', () => {
    const classes = progressClasses('linear', 'cyan', determinate);
    expect(classes.root).toBe('space-y-1.5');
    expect(classes.header).toBe('flex items-center justify-between text-xs text-retro-muted font-sans');
    expect(classes.value).toBe(toneMap.cyan.text);
    // The solid colour, as the pixel blocks: the tint barely stood out from the track.
    expect(classes.fill).toBe(`h-full rounded-full transition-all duration-500 ${toneMap.cyan.fill}`);
    expect(classes.fill.split(' ')).not.toContain(toneMap.cyan.bg);
    // Pulsing, unless the reader prefers reduced motion: then it holds still,
    // at 70 % as the pixel blocks do, so it does not read as a full bar.
    const fill = progressClasses('linear', 'cyan', indeterminate).fill.split(' ');
    expect(fill).toEqual(expect.arrayContaining(['motion-safe:animate-pulse', 'motion-reduce:opacity-70']));
    expect(fill).not.toContain('animate-pulse');
  });

  it('fills a block per 10 %, half-lights the one the value is in and dims the rest', () => {
    const fill = toneMap.green.fill;
    const segments = progressSegmentClasses(55, 'green', determinate);
    expect(segments).toHaveLength(PROGRESS_SEGMENTS);
    const states = segments.map((classes) =>
      classes.includes('opacity-50') ? 'half' : classes.includes(fill) ? 'full' : classes.includes('bg-retro-bg/40') ? 'off' : '?',
    );
    expect(states).toEqual(['full', 'full', 'full', 'full', 'full', 'half', 'off', 'off', 'off', 'off']);
    expect(progressSegmentClasses(150, 'green', determinate).every((classes) => classes.endsWith(fill))).toBe(true);
    expect(progressSegmentClasses(-5, 'green', determinate).every((classes) => classes.endsWith('bg-retro-bg/40'))).toBe(true);
  });

  it('pulses every block while indeterminate', () => {
    for (const classes of progressSegmentClasses(0, 'red', indeterminate)) {
      expect(classes).toBe(`h-2 flex-1 rounded-[1px] transition-all duration-150 ${toneMap.red.fill} opacity-70 motion-safe:animate-pulse`);
    }
  });
});
