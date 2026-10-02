/**
 * PixelTimeline — the ordered list of entries, each with its bullet, the rail
 * down to the next entry, and its label, time and description; an entry is
 * past, active or upcoming depending on the timeline's active index.
 */
import { cn, surfaceClasses, type Surface } from '../../common';

export type PixelTimelineBulletSize = 'sm' | 'md' | 'lg';
export type PixelTimelineAlign = 'left' | 'right';
export type PixelTimelineItemState = 'past' | 'active' | 'upcoming';
export type PixelTimelineLineVariant = 'solid' | 'dashed' | 'dotted';

/** The list. */
export const timelineClasses = 'relative list-none m-0 p-0';

/** Bullet dimensions per size. */
export const timelineBulletSizeClasses: Record<PixelTimelineBulletSize, string> = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3.5 w-3.5',
  lg: 'h-5 w-5',
};

/** Where the rail runs, under the middle of the bullet, per bullet size. */
export const timelineRailOffsetClasses: Record<PixelTimelineBulletSize, string> = {
  sm: 'left-[5px]',
  md: 'left-[7px]',
  lg: 'left-[10px]',
};

/** Line style of the rail. */
export const timelineLineClasses: Record<PixelTimelineLineVariant, string> = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
};

/** Fill and border of the bullet per state. */
export const timelineBulletStateClasses: Record<PixelTimelineItemState, string> = {
  active: 'bg-retro-cyan border-retro-cyan',
  past: 'bg-retro-muted/60 border-retro-muted/60',
  upcoming: 'bg-retro-surface border-retro-border',
};

/** State of the entry at `index`: everything is upcoming until an entry is active. */
export function timelineItemState(index: number, active: number | undefined): PixelTimelineItemState {
  if (active === undefined || index > active) return 'upcoming';
  return index < active ? 'past' : 'active';
}

/**
 * The connector the pixel surface spells out as text (`├─`), visually
 * hidden and hidden from assistive technology; `null` on other surfaces.
 */
export function timelineAsciiConnector(surface: Surface): string | null {
  return surface === 'pixel' ? '├─' : null;
}

export interface TimelineItemClassOptions {
  state: PixelTimelineItemState;
  align: PixelTimelineAlign;
  bulletSize: PixelTimelineBulletSize;
  lineVariant: PixelTimelineLineVariant;
}

export interface TimelineItemClasses {
  /** The `<li>`. */
  root: string;
  /** The rail down to the next entry. */
  connector: string;
  bullet: string;
  /** Holds the heading and the description. */
  body: string;
  /** Holds the label and the time. */
  heading: string;
  label: string;
  time: string;
  description: string;
}

/** Classes of every part of an entry. */
export function timelineItemClasses(
  surface: Surface,
  { state, align, bulletSize, lineVariant }: TimelineItemClassOptions,
): TimelineItemClasses {
  const s = surfaceClasses(surface);
  const right = align === 'right';
  return {
    root: cn('relative pl-7 pb-6 last:pb-0', right && 'pl-0 pr-7 text-right'),
    connector: cn(
      'absolute top-5 bottom-0 border-l-2',
      timelineLineClasses[lineVariant],
      'border-retro-border/60',
      timelineRailOffsetClasses[bulletSize],
      right && 'left-auto right-[5px]',
    ),
    bullet: cn(
      'absolute top-0 inline-flex items-center justify-center border-2',
      timelineBulletSizeClasses[bulletSize],
      s.radiusFull,
      timelineBulletStateClasses[state],
      right ? 'right-0' : 'left-0',
    ),
    body: 'min-h-[1.25rem] flex flex-col gap-1',
    heading: cn('flex items-baseline gap-2', right && 'justify-end'),
    label: cn(
      'text-sm leading-none',
      s.font,
      state === 'active' && 'text-retro-text font-semibold',
      state === 'past' && 'text-retro-muted',
      state === 'upcoming' && 'text-retro-text/80',
    ),
    time: cn('text-xs text-retro-muted', s.font),
    description: cn('text-sm text-retro-muted', s.font),
  };
}
