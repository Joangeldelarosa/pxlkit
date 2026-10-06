import { defineComponent, h, type ExtractPublicPropTypes, type PropType, type SlotsType, type VNode } from 'vue';
import {
  avatarGroupClasses,
  avatarGroupOverflowClasses,
  avatarGroupOverflowLabel,
  avatarGroupSlotClasses,
  groupOverflow,
  type PixelAvatarSize,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';
import { elementNodes } from './_internal/children.js';

const avatarGroupProps = {
  /** Most places the row shows; beyond it, the last place becomes a "+N" tile. */
  max: { type: Number, default: 5 },
  /** Slot size — match it to the avatars inside. */
  size: { type: String as PropType<PixelAvatarSize>, default: 'md' },
  /** Tone of the "+N" tile. */
  tone: { type: String as PropType<ToneKey>, default: 'neutral' },
  /** Surface override; defaults to the nearest provider. */
  surface: { type: String as PropType<Surface>, default: undefined },
} as const;

export type PixelAvatarGroupProps = ExtractPublicPropTypes<typeof avatarGroupProps>;

/**
 * Overlapping row of the avatars in its default slot, each in a ringed slot.
 * Beyond `max`, the rest collapse into a "+N" tile, which assistive
 * technology reads as "N more users". Name the row with `aria-label` or
 * `aria-labelledby` to make it a `role="group"`; other attributes go to the
 * row too.
 *
 * @example
 * <PixelAvatarGroup aria-label="5 team members" :max="4">
 *   <PixelAvatar v-for="user in users" :key="user.id" :name="user.name" />
 * </PixelAvatarGroup>
 */
export default /* @__PURE__ */ defineComponent({
  name: 'PixelAvatarGroup',
  props: avatarGroupProps,
  slots: Object as SlotsType<{
    /** The avatars. */
    default?: () => VNode[];
  }>,
  setup(props, { attrs, slots }) {
    const surface = useEffectiveSurface(() => props.surface);
    return () => {
      const avatars = elementNodes(slots.default?.());
      const { visible, hidden } = groupOverflow(avatars.length, props.max);
      const named = Boolean(attrs['aria-label'] || attrs['aria-labelledby']);
      const children = avatars
        .slice(0, visible)
        .map((avatar, index) =>
          h('div', { key: avatar.key ?? index, class: avatarGroupSlotClasses(surface.value, props.size, index) }, [avatar]),
        );
      if (hidden > 0) {
        children.push(
          h('div', { class: avatarGroupOverflowClasses(surface.value, props.size, props.tone, visible > 0) }, [
            h('span', { 'aria-hidden': 'true' }, `+${hidden}`),
            h('span', { class: 'sr-only' }, avatarGroupOverflowLabel(hidden)),
          ]),
        );
      }
      return h('div', { role: named ? 'group' : undefined, class: avatarGroupClasses }, children);
    };
  },
});
