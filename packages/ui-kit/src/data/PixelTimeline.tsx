'use client';

import React, { createContext, forwardRef, useContext, useMemo } from 'react';
import {
  timelineAsciiConnector,
  timelineClasses,
  timelineItemClasses,
  timelineItemState,
  type PixelTimelineAlign,
  type PixelTimelineBulletSize,
  type PixelTimelineLineVariant,
} from '@pxlkit/ui-kit-core';
import { cn, Surface, useEffectiveSurface } from '../common';

interface TimelineCtx {
  bulletSize: PixelTimelineBulletSize;
  align: PixelTimelineAlign;
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
  /** Content of the bullet. */
  bullet?: React.ReactNode;
  /** Time or date beside the label. */
  time?: string;
  /** Line style of the rail down to the next entry. */
  lineVariant?: PixelTimelineLineVariant;
  /** Description below the label. */
  children?: React.ReactNode;
}

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
    const state = timelineItemState(index, active);
    const classes = timelineItemClasses(surface, { state, align, bulletSize, lineVariant });
    const pixelConnectorChar = timelineAsciiConnector(surface);

    return (
      <li
        ref={ref}
        data-pxl-state={state}
        aria-current={state === 'active' ? 'step' : undefined}
        className={cn(classes.root, className)}
        {...rest}
      >
        {!isLast && (
          <span
            data-pxl-connector
            aria-hidden
            className={classes.connector}
          />
        )}
        <span
          data-pxl-bullet
          aria-hidden
          className={classes.bullet}
        >
          {bullet}
        </span>
        {pixelConnectorChar && (
          <span aria-hidden className="sr-only" data-pxl-ascii>
            {pixelConnectorChar}
          </span>
        )}
        <div className={classes.body}>
          <div className={classes.heading}>
            <span className={classes.label}>{resolvedLabel}</span>
            {time && (
              <span className={classes.time}>{time}</span>
            )}
          </div>
          {children && (
            <div className={classes.description}>{children}</div>
          )}
        </div>
      </li>
    );
  },
);

PixelTimelineItem.displayName = 'PixelTimelineItem';

export interface PixelTimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  /** Index of the current entry: the ones before it are past, the ones after it upcoming. */
  active?: number;
  /** Bullet size. */
  bulletSize?: PixelTimelineBulletSize;
  /** Side the bullets and the rail sit on. */
  align?: PixelTimelineAlign;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** The entries (`PixelTimelineItem`). */
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
          className={cn(timelineClasses, className)}
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
