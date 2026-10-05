import { cloneVNode, defineComponent, type SlotsType, type VNode } from 'vue';
import { singleElementChild } from '../../_internal/Slot.js';
import { usePopoverContext } from '../../overlay-foundation/_internal/popover-context.js';

/**
 * Makes its single child element the field of the enclosing `PixelPopover`'s
 * combobox, for a combobox that sits in a field beside other controls (a
 * multi-select's chips and clear button): the field anchors the popover, and
 * a click on it toggles the popover unless a click listener calls
 * `preventDefault()` first, as the field's buttons do. Unlike
 * `PixelPopoverTrigger`, it adds no ARIA: the combobox carries the popup's.
 */
export const ListboxField = /* @__PURE__ */ defineComponent({
  name: 'PxlListboxField',
  slots: Object as SlotsType<{ default?: () => VNode[] }>,
  setup(_, { slots }) {
    const context = usePopoverContext('ListboxField');
    return () => {
      const child = singleElementChild(slots.default?.());
      if (!child) return null;
      return cloneVNode(
        child,
        {
          // Merged after the child's own click listener, so it runs second.
          onClick: (event: MouseEvent) => {
            if (!event.defaultPrevented) context.setOpen(!context.open.value);
          },
          ref: context.setTrigger,
        },
        true,
      );
    };
  },
});
