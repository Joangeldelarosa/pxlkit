import { defineComponent, h, type PropType } from 'vue';

/**
 * Renders its default slot inside a `tag` element, or unwrapped when `tag` is
 * left out — for markup that only some states wrap. Attributes go to the
 * wrapper.
 */
export const Wrap = defineComponent({
  name: 'PxlWrap',
  inheritAttrs: false,
  props: {
    tag: { type: String as PropType<string | undefined>, default: undefined },
  },
  setup(props, { attrs, slots }) {
    return () => (props.tag ? h(props.tag, attrs, slots.default?.()) : slots.default?.());
  },
});
