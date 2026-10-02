import { Text, type VNode } from 'vue';
import { slotNodes } from '../../_internal/Slot.js';

/**
 * The elements and components a slot renders, without text — the children
 * the React kit's groups keep with `Children.toArray(…).filter(isValidElement)`.
 */
export function elementNodes(nodes: VNode[] | undefined): VNode[] {
  return slotNodes(nodes).filter((node) => node.type !== Text);
}
