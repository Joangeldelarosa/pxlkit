import { computed, defineComponent, h, type ExtractPublicPropTypes, type PropType, type SlotsType, type VNode } from 'vue';
import {
  statCardClasses,
  type PixelStatCardIconPosition,
  type PixelStatCardSize,
  type Surface,
  type Tone,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

const statCardProps = {
  /** Caption above the value. */
  label: { type: String, required: true },
  /** The metric. */
  value: { type: String, required: true },
  /** Tone of the border, background and icon. */
  tone: { type: String as PropType<Tone>, default: 'gold' },
  /** Trend or delta line under the value. */
  trend: { type: String, default: undefined },
  /** Surface override; defaults to the nearest provider. */
  surface: { type: String as PropType<Surface>, default: undefined },
  /** Padding and type scale. */
  size: { type: String as PropType<PixelStatCardSize>, default: 'md' },
  /** Where the icon sits: above, beside or in the bottom-left corner. */
  iconPosition: { type: String as PropType<PixelStatCardIconPosition>, default: 'top' },
  /** Colours the value with the tone. */
  valueTone: { type: Boolean, default: false },
  /** Alignment of the label, value and trend. */
  align: { type: String as PropType<'start' | 'center'>, default: 'start' },
  /** Surface border, radius and tone tint. */
  bordered: { type: Boolean, default: true },
} as const;

export type PixelStatCardProps = ExtractPublicPropTypes<typeof statCardProps>;

/**
 * Compact metric card: a label, the value, an optional trend line and an
 * icon above, beside or in the bottom-left corner, in three sizes.
 * Attributes go to the card.
 *
 * @example
 * <PixelStatCard label="Revenue" value="$12,480" trend="+8.2% vs last week" tone="green" icon-position="right">
 *   <template #icon><span aria-hidden="true">$</span></template>
 * </PixelStatCard>
 */
export default /* @__PURE__ */ defineComponent({
  name: 'PixelStatCard',
  props: statCardProps,
  slots: Object as SlotsType<{
    /** The icon, in the tone. */
    icon?: () => VNode[];
  }>,
  setup(props, { slots }) {
    const surface = useEffectiveSurface(() => props.surface);
    const classes = computed(() =>
      statCardClasses(surface.value, {
        tone: props.tone,
        size: props.size,
        iconPosition: props.iconPosition,
        valueTone: props.valueTone,
        align: props.align,
        bordered: props.bordered,
      }),
    );

    return () => {
      const c = classes.value;
      const icon = slots.icon?.();
      const label = h('p', { class: c.label }, props.label);
      const value = h('p', { class: c.value }, props.value);
      const trend = props.trend ? h('p', { class: c.trend }, props.trend) : null;
      const text = () => h('div', { class: c.content }, [label, h('div', { class: c.valueRow }, [value]), trend]);
      const iconBox = (className: string) => icon && h('span', { class: className }, icon);
      switch (props.iconPosition) {
        case 'right':
          return h('div', { class: c.root }, [text(), iconBox(c.icon)]);
        case 'left':
          return h('div', { class: c.root }, [iconBox(c.icon), text()]);
        case 'bottom-left':
          return h('div', { class: c.root }, [h('div', { class: c.header }, [label]), value, trend, iconBox(c.cornerIcon)]);
        default:
          return h('div', { class: c.root }, [h('div', { class: c.header }, [label, iconBox(c.icon)]), value, trend]);
      }
    };
  },
});
