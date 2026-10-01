import { cloneVNode, defineComponent, type SlotsType, type VNode } from 'vue';
import { singleElementChild } from '../_internal/Slot.js';
import { usePopoverContext } from './_internal/popover-context.js';

/**
 * Makes its single child element the trigger of the enclosing `PixelPopover`:
 * a click toggles the popover (unless a click listener of the child calls
 * `preventDefault()`), and the element advertises `aria-expanded` and
 * `aria-haspopup` — an `aria-haspopup` already set on the child wins.
 */
export default defineComponent({
  name: 'PixelPopoverTrigger',
  slots: Object as SlotsType<{ default?: () => VNode[] }>,
  setup(_, { slots }) {
    const context = usePopoverContext('PixelPopoverTrigger');
    return () => {
      const child = singleElementChild(slots.default?.());
      if (!child) return null;
      const ownHasPopup = (child.props as Record<string, unknown> | null)?.['aria-haspopup'];
      return cloneVNode(
        child,
        {
          // Merged after the child's own click listener, so it runs second.
          onClick: (event: MouseEvent) => {
            if (!event.defaultPrevented) context.setOpen(!context.open.value);
          },
          'aria-expanded': context.open.value,
          'aria-haspopup': ownHasPopup ?? context.haspopup.value,
          ref: context.setTrigger,
        },
        true,
      );
    };
  },
});
