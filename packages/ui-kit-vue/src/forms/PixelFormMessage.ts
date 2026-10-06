import { Text, computed, defineComponent, h, type ExtractPublicPropTypes, type PropType, type SlotsType, type VNode } from 'vue';
import { formMessageClasses, type Surface } from '@pxlkit/ui-kit-core';
import { slotNodes } from '../_internal/Slot.js';
import { useEffectiveSurface } from '../composables/surface.js';
import { useFormField, useFormItem } from './_internal/form-context.js';

const messageProps = {
  /** Surface override; defaults to the nearest provider. */
  surface: { type: String as PropType<Surface>, default: undefined },
} as const;

export type PixelFormMessageProps = ExtractPublicPropTypes<typeof messageProps>;

/** Whether nodes render anything: an empty text (`{{ undefined }}`) does not. */
function hasContent(nodes: VNode[]): boolean {
  return nodes.some((node) => node.type !== Text || node.children !== '');
}

/**
 * The message of a `PixelFormItem`: the field's error while it shows one,
 * as an alert, or its default slot, which wins over the error. With neither
 * it renders nothing. Attributes go to the `<p>`.
 *
 * @example
 * <PixelFormMessage />
 */
export default /* @__PURE__ */ defineComponent({
  name: 'PixelFormMessage',
  props: messageProps,
  slots: Object as SlotsType<{
    /** A message to show in place of the error. */
    default?: () => VNode[];
  }>,
  setup(props, { slots }) {
    const item = useFormItem('PixelFormMessage');
    const field = useFormField();
    const surface = useEffectiveSurface(() => props.surface);
    const error = computed(() => field?.error.value);

    return () => {
      const children = slotNodes(slots.default?.());
      const body = hasContent(children) ? children : error.value;
      if (!body) return null;
      return h(
        'p',
        { id: item.messageId, role: error.value ? 'alert' : undefined, class: formMessageClasses(surface.value, !!error.value) },
        body,
      );
    };
  },
});
