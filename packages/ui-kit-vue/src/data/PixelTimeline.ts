import { computed, defineComponent, h, provide, type ExtractPublicPropTypes, type PropType, type SlotsType, type VNode } from 'vue';
import { timelineClasses, type PixelTimelineAlign, type PixelTimelineBulletSize, type Surface } from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';
import { elementNodes } from './_internal/children.js';
import { PIXEL_TIMELINE, TimelinePosition } from './_internal/timeline-context.js';

const timelineProps = {
  /** Index of the current entry: the ones before it are past, the ones after it upcoming. */
  active: { type: Number, default: undefined },
  /** Bullet size. */
  bulletSize: { type: String as PropType<PixelTimelineBulletSize>, default: 'md' },
  /** Side the bullets and the rail sit on. */
  align: { type: String as PropType<PixelTimelineAlign>, default: 'left' },
  /** Surface override; defaults to the nearest provider. */
  surface: { type: String as PropType<Surface>, default: undefined },
} as const;

export type PixelTimelineProps = ExtractPublicPropTypes<typeof timelineProps>;

/**
 * Vertical timeline: an ordered list of the `PixelTimelineItem` entries in
 * its default slot, each past, active (`aria-current="step"`) or upcoming
 * from `active`. Attributes go to the `<ol>`.
 *
 * @example
 * <PixelTimeline :active="1">
 *   <PixelTimelineItem label="Order placed" time="09:00">Confirmation email sent.</PixelTimelineItem>
 *   <PixelTimelineItem label="Packed" time="11:20" />
 * </PixelTimeline>
 */
export default defineComponent({
  name: 'PixelTimeline',
  props: timelineProps,
  slots: Object as SlotsType<{
    /** The entries. */
    default?: () => VNode[];
  }>,
  setup(props, { slots }) {
    provide(PIXEL_TIMELINE, {
      bulletSize: computed(() => props.bulletSize),
      align: computed(() => props.align),
      surface: useEffectiveSurface(() => props.surface),
      active: computed(() => props.active),
    });
    return () => {
      const entries = elementNodes(slots.default?.());
      return h(
        'ol',
        { class: timelineClasses },
        entries.map((entry, index) =>
          h(TimelinePosition, { key: entry.key ?? index, index, total: entries.length }, () => entry),
        ),
      );
    };
  },
});
