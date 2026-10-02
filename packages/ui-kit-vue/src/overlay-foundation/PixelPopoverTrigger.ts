import { cloneVNode, defineComponent, type SlotsType, type VNode } from 'vue';
import { singleElementChild } from '../_internal/Slot.js';
import { usePopoverContext } from './_internal/popover-context.js';

/**
 * Makes its single child element the trigger of the enclosing `PixelPopover`:
 * a click toggles the popover (unless a click listener of the child calls
 * `preventDefault()`), and the element advertises `aria-expanded`,
 * `aria-haspopup` and, while the content is open, `aria-controls` — an
 * `aria-haspopup` or `aria-controls` already set on the child wins.
 */
export default defineComponent({
  name: 'PixelPopoverTrigger',
  slots: Object as SlotsType<{ default?: () => VNode[] }>,
  setup(_, { slots }) {
    const context = usePopoverContext('PixelPopoverTrigger');
    return () => {
      const child = singleElementChild(slots.default?.());
      if (!child) return null;
      const own = child.props as Record<string, unknown> | null;
      return cloneVNode(
        child,
        {
          // Merged after the child's own click listener, so it runs second.
          onClick: (event: MouseEvent) => {
            if (!event.defaultPrevented) context.setOpen(!context.open.value);
          },
          'aria-expanded': context.open.value,
          'aria-haspopup': own?.['aria-haspopup'] ?? context.haspopup.value,
          'aria-controls': own?.['aria-controls'] ?? context.contentId.value ?? undefined,
          ref: context.setTrigger,
        },
        true,
      );
    };
  },
});
