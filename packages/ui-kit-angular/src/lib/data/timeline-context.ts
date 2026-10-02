import { InjectionToken, inject, type Signal } from '@angular/core';
import type { PixelTimelineAlign, PixelTimelineBulletSize, Surface } from '@pxlkit/ui-kit-core';

/** What an `ol[pxlTimeline]` shares with its entries. */
export interface PixelTimelineContext {
  readonly active: Signal<number | undefined>;
  readonly bulletSize: Signal<PixelTimelineBulletSize>;
  readonly align: Signal<PixelTimelineAlign>;
  readonly surface: Signal<Surface>;
  /** The entries, in order. */
  readonly entries: Signal<readonly unknown[]>;
}

export const PIXEL_TIMELINE = new InjectionToken<PixelTimelineContext>('PIXEL_TIMELINE');

export function injectTimelineContext(): PixelTimelineContext {
  const context = inject(PIXEL_TIMELINE, { optional: true });
  if (!context) throw new Error('PixelTimelineItem must be used inside a PixelTimeline');
  return context;
}
