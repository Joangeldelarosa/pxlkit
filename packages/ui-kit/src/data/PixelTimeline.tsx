'use client';

import React, { createContext, forwardRef, useContext, useMemo } from 'react';
import { cn, Surface, useEffectiveSurface, surfaceClasses } from '../common';

type BulletSize = 'sm' | 'md' | 'lg';
type Align = 'left' | 'right';
type ItemState = 'past' | 'active' | 'upcoming';
type LineVariant = 'solid' | 'dashed' | 'dotted';

const bulletSizeMap: Record<BulletSize, string> = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3.5 w-3.5',
  lg: 'h-5 w-5',
};

const railOffsetMap: Record<BulletSize, string> = {
  sm: 'left-[5px]',
  md: 'left-[7px]',
  lg: 'left-[10px]',
};

interface TimelineCtx {
  bulletSize: BulletSize;
  align: Align;
  surface: Surface;
  active: number | undefined;
  total: number;
}

const TimelineContext = createContext<TimelineCtx | null>(null);

// Per-item slot. Set by the root, read by each item — keeps composition
// working when the consumer wraps PixelTimelineItem in their own component.
const TimelineIndexContext = createContext<number>(-1);

function useTimelineCtx(): TimelineCtx {
  const ctx = useContext(TimelineContext);
  if (!ctx) {
    throw new Error('PixelTimelineItem must be used inside a PixelTimeline');
  }
  return ctx;
}

export interface PixelTimelineItemProps extends React.HTMLAttributes<HTMLLIElement> {
  /** Canonical label for the item. */
  label?: string;
  /**
   * @deprecated Use `label` instead. Retained as alias for one minor.
   */
  title?: string;
  bullet?: React.ReactNode;
  time?: string;
  lineVariant?: LineVariant;
  children?: React.ReactNode;
}

const lineBorderMap: Record<LineVariant, string> = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
};

export const PixelTimelineItem = forwardRef<HTMLLIElement, PixelTimelineItemProps>(
  function PixelTimelineItem(props, ref) {
    const {
      label,
      title,
      bullet,
      time,
      lineVariant = 'solid',
      children,
      className,
      ...rest
    } = props;
    const resolvedLabel = label ?? title ?? '';

    const { bulletSize, align, surface, active, total } = useTimelineCtx();
    const index = useContext(TimelineIndexContext);
    const isLast = index === total - 1;
    const state: ItemState =
      active === undefined
        ? 'upcoming'
        : index < active
          ? 'past'
          : index === active
            ? 'active'
            : 'upcoming';
    const s = surfaceClasses(surface);

    const bulletColor =
      state === 'active'
        ? 'bg-retro-cyan border-retro-cyan'
        : state === 'past'
          ? 'bg-retro-muted/60 border-retro-muted/60'
          : 'bg-retro-surface border-retro-border';

    const titleClass = cn(
      'text-sm leading-none',
      s.font,
      state === 'active' && 'text-retro-text font-semibold',
      state === 'past' && 'text-retro-muted',
      state === 'upcoming' && 'text-retro-text/80',
    );

    const railClass = cn(
      'absolute top-5 bottom-0 border-l-2',
      lineBorderMap[lineVariant],
      'border-retro-border/60',
      railOffsetMap[bulletSize],
    );

    const pixelConnectorChar = surface === 'pixel' ? '├─' : null;

    return (
      <li
        ref={ref}
        data-pxl-state={state}
        aria-current={state === 'active' ? 'step' : undefined}
        className={cn(
          'relative pl-7 pb-6 last:pb-0',
          align === 'right' && 'pl-0 pr-7 text-right',
          className,
        )}
        {...rest}
      >
        {!isLast && (
          <span
            data-pxl-connector
            aria-hidden
            className={cn(railClass, align === 'right' && 'left-auto right-[5px]')}
          />
        )}
        <span
          data-pxl-bullet
          aria-hidden
          className={cn(
            'absolute top-0 inline-flex items-center justify-center border-2',
            bulletSizeMap[bulletSize],
            s.radiusFull,
            bulletColor,
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {bullet}
        </span>
        {pixelConnectorChar && (
          <span aria-hidden className="sr-only" data-pxl-ascii>
            {pixelConnectorChar}
          </span>
        )}
        <div className={cn('min-h-[1.25rem] flex flex-col gap-1')}>
          <div className={cn('flex items-baseline gap-2', align === 'right' && 'justify-end')}>
            <span className={titleClass}>{resolvedLabel}</span>
            {time && (
              <span className={cn('text-xs text-retro-muted', s.font)}>{time}</span>
            )}
          </div>
          {children && (
            <div className={cn('text-sm text-retro-muted', s.font)}>{children}</div>
          )}
        </div>
      </li>
    );
  },
);

PixelTimelineItem.displayName = 'PixelTimelineItem';

export interface PixelTimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  active?: number;
  bulletSize?: BulletSize;
  align?: Align;
  surface?: Surface;
  children: React.ReactNode;
}

export const PixelTimeline = forwardRef<HTMLOListElement, PixelTimelineProps>(
  function PixelTimeline(
    {
      active,
      bulletSize = 'md',
      align = 'left',
      surface: surfaceProp,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const surface = useEffectiveSurface(surfaceProp);
    const items = React.Children.toArray(children).filter(React.isValidElement);
    const total = items.length;

    const ctxValue = useMemo<TimelineCtx>(
      () => ({ bulletSize, align, surface, active, total }),
      [bulletSize, align, surface, active, total],
    );

    return (
      <TimelineContext.Provider value={ctxValue}>
        <ol
          ref={ref}
          className={cn('relative list-none m-0 p-0', className)}
          {...rest}
        >
          {items.map((child, idx) => (
            <TimelineIndexContext.Provider
              key={(child as React.ReactElement).key ?? idx}
              value={idx}
            >
              {child}
            </TimelineIndexContext.Provider>
          ))}
        </ol>
      </TimelineContext.Provider>
    );
  },
);

PixelTimeline.displayName = 'PixelTimeline';
