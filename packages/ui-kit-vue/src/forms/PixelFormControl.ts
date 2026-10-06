import { cloneVNode, computed, defineComponent, onBeforeUnmount, type SlotsType, type VNode } from 'vue';
import { formControlDescribedBy } from '@pxlkit/ui-kit-core';
import { singleElementChild } from '../_internal/Slot.js';
import { useFormField, useFormItem } from './_internal/form-context.js';

/**
 * The control of a `PixelFormItem`: renders the single element or component
 * of its default slot with the item's control `id`, `aria-describedby` (the
 * description, and the message while the field shows an error) and
 * `aria-invalid` while it does. A kit field passes them to its native
 * control. The label points at it, and a submission with errors focuses it.
 *
 * @example
 * <PixelFormControl><PixelInput v-bind="field" /></PixelFormControl>
 */
export default /* @__PURE__ */ defineComponent({
  name: 'PixelFormControl',
  inheritAttrs: false,
  slots: Object as SlotsType<{
    /** The control: one element or component. */
    default?: () => VNode[];
  }>,
  setup(_, { slots }) {
    const item = useFormItem('PixelFormControl');
    const field = useFormField();
    const invalid = computed(() => !!field?.error.value);
    field?.setControl(item.id);
    onBeforeUnmount(() => field?.setControl(undefined));

    return () => {
      const child = singleElementChild(slots.default?.());
      if (!child) return null;
      return cloneVNode(child, {
        id: item.id,
        'aria-describedby': formControlDescribedBy(item, invalid.value),
        'aria-invalid': invalid.value ? 'true' : undefined,
      });
    };
  },
});
