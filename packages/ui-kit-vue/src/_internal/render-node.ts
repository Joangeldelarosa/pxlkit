import { defineComponent, type PropType, type VNode, type VNodeChild } from 'vue';

/**
 * Content a prop accepts where the React kit takes a `ReactNode` inside data
 * (items, options, columns): text, a VNode, or a render function.
 *
 * @example
 * { id: 'overview', label: 'Overview', content: () => h('p', 'Summary') }
 */
export type PxlNode = string | number | VNode | (() => VNodeChild);

/** Renders a {@link PxlNode} in place (no wrapper element). */
export const RenderNode = defineComponent({
  name: 'PxlRenderNode',
  props: {
    node: { type: [String, Number, Object, Function] as PropType<PxlNode | null | undefined>, default: undefined },
  },
  setup(props) {
    return () => (typeof props.node === 'function' ? props.node() : props.node);
  },
});
