import { describe, expect, it } from 'vitest';
import {
  timelineAsciiConnector,
  timelineBulletSizeClasses,
  timelineBulletStateClasses,
  timelineClasses,
  timelineItemClasses,
  timelineItemState,
  timelineLineClasses,
  timelineRailOffsetClasses,
  type PixelTimelineBulletSize,
  type PixelTimelineItemState,
  type PixelTimelineLineVariant,
} from '../../../components/data/timeline';

const classesOf = (value: string) => value.split(' ');
const BASE = { state: 'upcoming', align: 'left', bulletSize: 'md', lineVariant: 'solid' } as const;

describe('timeline recipes', () => {
  it('resets the list styling', () => {
    expect(classesOf(timelineClasses)).toEqual(expect.arrayContaining(['list-none', 'm-0', 'p-0']));
  });

  it('marks the entries before the active one past and the ones after it upcoming', () => {
    expect([0, 1, 2].map((index) => timelineItemState(index, 1))).toEqual(['past', 'active', 'upcoming']);
    expect([0, 1].map((index) => timelineItemState(index, undefined))).toEqual(['upcoming', 'upcoming']);
  });

  it('spells the connector out only on the pixel surface', () => {
    expect(timelineAsciiConnector('pixel')).toBe('├─');
    expect(timelineAsciiConnector('linear')).toBeNull();
  });

  it('sizes the bullet and runs the rail under its middle', () => {
    for (const bulletSize of ['sm', 'md', 'lg'] as PixelTimelineBulletSize[]) {
      const parts = timelineItemClasses('pixel', { ...BASE, bulletSize });
      expect(classesOf(parts.bullet)).toEqual(expect.arrayContaining(classesOf(timelineBulletSizeClasses[bulletSize])));
      expect(classesOf(parts.connector)).toContain(timelineRailOffsetClasses[bulletSize]);
    }
  });

  it('draws the rail in the line variant', () => {
    for (const lineVariant of ['solid', 'dashed', 'dotted'] as PixelTimelineLineVariant[]) {
      expect(classesOf(timelineItemClasses('pixel', { ...BASE, lineVariant }).connector)).toContain(timelineLineClasses[lineVariant]);
    }
  });

  it('colours the bullet and weighs the label by state', () => {
    const label: Record<PixelTimelineItemState, string> = {
      active: 'font-semibold',
      past: 'text-retro-muted',
      upcoming: 'text-retro-text/80',
    };
    for (const state of ['past', 'active', 'upcoming'] as PixelTimelineItemState[]) {
      const parts = timelineItemClasses('linear', { ...BASE, state });
      expect(classesOf(parts.bullet)).toEqual(expect.arrayContaining(classesOf(timelineBulletStateClasses[state])));
      expect(classesOf(parts.label)).toContain(label[state]);
    }
  });

  it('mirrors the entry when aligned right', () => {
    const left = timelineItemClasses('pixel', BASE);
    const right = timelineItemClasses('pixel', { ...BASE, align: 'right' });
    expect(classesOf(left.root)).not.toContain('text-right');
    expect(classesOf(left.bullet)).toContain('left-0');
    expect(classesOf(right.root)).toEqual(expect.arrayContaining(['pl-0', 'pr-7', 'text-right']));
    expect(classesOf(right.bullet)).toContain('right-0');
    expect(classesOf(right.connector)).toEqual(expect.arrayContaining(['left-auto', 'right-[5px]']));
    expect(classesOf(right.heading)).toContain('justify-end');
  });

  it('rounds the bullet and sets the texts in the surface font', () => {
    const pixel = timelineItemClasses('pixel', BASE);
    const linear = timelineItemClasses('linear', BASE);
    expect(classesOf(pixel.bullet)).toContain('pxl-corner-sm');
    expect(classesOf(linear.bullet)).toContain('rounded-full');
    for (const part of [pixel.label, pixel.time, pixel.description]) expect(classesOf(part)).toContain('font-mono');
    for (const part of [linear.label, linear.time, linear.description]) expect(classesOf(part)).toContain('font-sans');
    expect(pixel.body).toBe('min-h-[1.25rem] flex flex-col gap-1');
  });
});
