import { Comment, Fragment, cloneVNode, defineComponent, isVNode, type VNode } from 'vue';

/** The rendered nodes of a slot, with fragments flattened and comments dropped. */
export function slotNodes(nodes: VNode[] | undefined): VNode[] {
  const out: VNode[] = [];
  for (const node of nodes ?? []) {
    if (node.type === Comment) continue;
    if (node.type === Fragment && Array.isArray(node.children)) {
      out.push(...slotNodes(node.children as VNode[]));
    } else {
      out.push(node);
    }
  }
  return out;
}

/** The single element a slot renders, or `null` when it renders anything else. */
export function singleElementChild(nodes: VNode[] | undefined): VNode | null {
  const children = slotNodes(nodes);
  if (children.length !== 1) return null;
  const [child] = children;
  return isVNode(child) && (typeof child.type === 'string' || typeof child.type === 'object') ? child : null;
}

/**
 * `asChild` support: renders the single element of its default slot with the
 * attributes given to `Slot` merged in (classes and styles are combined,
 * listeners are chained) — the counterpart of the React kit's
 * `cloneElement`-based slot pattern.
 */
export const Slot = /* @__PURE__ */ defineComponent({
  name: 'PxlSlot',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => {
      const child = singleElementChild(slots.default?.());
      return child ? cloneVNode(child, attrs, true) : null;
    };
  },
});
