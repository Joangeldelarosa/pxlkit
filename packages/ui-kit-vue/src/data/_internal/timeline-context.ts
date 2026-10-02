import { defineComponent, inject, provide, type ComputedRef, type InjectionKey } from 'vue';
import type { PixelTimelineAlign, PixelTimelineBulletSize, Surface } from '@pxlkit/ui-kit-core';

/** What a `PixelTimeline` shares with its entries. */
export interface PixelTimelineContext {
  bulletSize: ComputedRef<PixelTimelineBulletSize>;
  align: ComputedRef<PixelTimelineAlign>;
  surface: ComputedRef<Surface>;
  active: ComputedRef<number | undefined>;
}

/** Where an entry sits in its timeline. */
export interface PixelTimelinePosition {
  index: number;
  total: number;
}

export const PIXEL_TIMELINE: InjectionKey<PixelTimelineContext> = Symbol('pixel-timeline');
const PIXEL_TIMELINE_POSITION: InjectionKey<Readonly<PixelTimelinePosition>> = Symbol('pixel-timeline-position');

const UNPLACED: PixelTimelinePosition = { index: -1, total: 0 };

export function useTimelineContext(): PixelTimelineContext {
  const context = inject(PIXEL_TIMELINE, null);
  if (!context) throw new Error('PixelTimelineItem must be used inside a PixelTimeline');
  return context;
}

/** The position the timeline gave the calling entry (reactive). */
export function useTimelinePosition(): Readonly<PixelTimelinePosition> {
  return inject(PIXEL_TIMELINE_POSITION, UNPLACED);
}

/**
 * Wraps each child of a timeline (rendering nothing of its own) to give it
 * its position, so an entry still finds it when the consumer wraps
 * `PixelTimelineItem` in a component of their own.
 */
export const TimelinePosition = defineComponent({
  name: 'PxlTimelinePosition',
  props: {
    index: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  setup(props, { slots }) {
    provide(PIXEL_TIMELINE_POSITION, props);
    return () => slots.default?.();
  },
});
