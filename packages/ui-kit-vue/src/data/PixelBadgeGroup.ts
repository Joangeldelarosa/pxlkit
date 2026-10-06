import {
  defineComponent,
  h,
  ref,
  useId,
  type ExtractPublicPropTypes,
  type PropType,
  type SlotsType,
  type VNode,
  type VNodeArrayChildren,
} from 'vue';
import {
  badgeGroupClasses,
  badgeGroupOverflowClasses,
  badgeGroupTriggerClasses,
  badgeGroupTriggerLabel,
  groupOverflow,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';
import PixelPopover from '../overlay-foundation/PixelPopover.vue';
import PixelPopoverContent from '../overlay-foundation/PixelPopoverContent.vue';
import PixelPopoverTrigger from '../overlay-foundation/PixelPopoverTrigger.js';
import { elementNodes } from './_internal/children.js';

const badgeGroupProps = {
  /**
   * Most places the row shows; beyond it, the last place becomes a "+N"
   * button that opens a popover with the rest.
   */
  max: { type: Number, default: 5 },
  /** Surface override, for the row and its popover; defaults to the nearest provider. */
  surface: { type: String as PropType<Surface>, default: undefined },
} as const;

export type PixelBadgeGroupProps = ExtractPublicPropTypes<typeof badgeGroupProps>;

/**
 * Wrapping row of the badges in its default slot. Beyond `max`, the rest
 * move into a popover opened by a "+N" button (named "Show N more"), which
 * names the popover too. Name the row with `aria-label` or
 * `aria-labelledby` to make it a `role="group"`; other attributes go to the
 * row too.
 *
 * @example
 * <PixelBadgeGroup aria-label="Stack" :max="3">
 *   <PixelBadge v-for="tag in tags" :key="tag">{{ tag }}</PixelBadge>
 * </PixelBadgeGroup>
 */
export default /* @__PURE__ */ defineComponent({
  name: 'PixelBadgeGroup',
  props: badgeGroupProps,
  slots: Object as SlotsType<{
    /** The badges. */
    default?: () => VNode[];
  }>,
  setup(props, { attrs, slots }) {
    const surface = useEffectiveSurface(() => props.surface);
    const open = ref(false);
    const triggerId = useId();
    return () => {
      const badges = elementNodes(slots.default?.());
      const { visible, hidden } = groupOverflow(badges.length, props.max);
      const named = Boolean(attrs['aria-label'] || attrs['aria-labelledby']);
      const children: VNodeArrayChildren = badges.slice(0, visible);
      if (hidden > 0) {
        children.push(
          h(
            PixelPopover,
            {
              open: open.value,
              'onUpdate:open': (next: boolean) => (open.value = next),
              surface: surface.value,
              haspopup: 'dialog',
              role: 'dialog',
            },
            () => [
              h(PixelPopoverTrigger, () =>
                h(
                  'button',
                  {
                    type: 'button',
                    id: triggerId,
                    'aria-label': badgeGroupTriggerLabel(hidden),
                    class: badgeGroupTriggerClasses(surface.value),
                  },
                  `+${hidden}`,
                ),
              ),
              h(PixelPopoverContent, { surface: surface.value, 'aria-labelledby': triggerId }, () =>
                h('div', { class: badgeGroupOverflowClasses }, badges.slice(visible)),
              ),
            ],
          ),
        );
      }
      return h('div', { role: named ? 'group' : undefined, class: badgeGroupClasses }, children);
    };
  },
});
