import { defineComponent, h, type ExtractPublicPropTypes, type PropType, type SlotsType, type VNode } from 'vue';
import {
  chipGroupClasses,
  chipGroupItemClasses,
  chipGroupKeyAction,
  chipGroupMove,
  chipGroupRole,
  chipGroupTabStop,
  toggleChipSelection,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { useControllableState } from '../composables/controllable.js';
import { useEffectiveSurface } from '../composables/surface.js';
import { elementNodes } from './_internal/children.js';

const chipGroupProps = {
  /** Selected chip values (`v-model`); leave unset for an uncontrolled group. */
  modelValue: { type: Array as PropType<string[]>, default: undefined },
  /** Initial selection while uncontrolled. */
  defaultValue: { type: Array as PropType<string[]>, default: undefined },
  /** Any number of chips can be selected (checkboxes) instead of one (radios). */
  multiple: { type: Boolean, default: false },
  /** Surface override; defaults to the nearest provider. */
  surface: { type: String as PropType<Surface>, default: undefined },
} as const;

export type PixelChipGroupProps = ExtractPublicPropTypes<typeof chipGroupProps>;

/** The selection value a chip declares (`value` prop), if it is a string. */
function chipValue(chip: VNode): string | undefined {
  const value = (chip.props as Record<string, unknown> | null)?.value;
  return typeof value === 'string' ? value : undefined;
}

/**
 * Row of selectable chips. Every chip of the default slot with a `value`
 * goes in a toggle button: a radio group for single selection (roving
 * tabindex; arrow keys, Home and End move and select), or checkboxes with
 * `multiple`. Enter and Space toggle a chip. Bind the selection with
 * `v-model`. Name the row with `aria-label` or `aria-labelledby` — required
 * for single selection; with `multiple` it makes the row a `role="group"`.
 *
 * @example
 * <PixelChipGroup v-model="frameworks" multiple aria-label="Frameworks">
 *   <PixelChip value="react" label="React" />
 *   <PixelChip value="vue" label="Vue" />
 * </PixelChipGroup>
 */
export default defineComponent({
  name: 'PixelChipGroup',
  props: chipGroupProps,
  emits: {
    /** The new selection, after each change. */
    'update:modelValue': (selection: string[]) => Array.isArray(selection),
  },
  slots: Object as SlotsType<{
    /** The chips, each with a `value`; other content renders as is. */
    default?: () => VNode[];
  }>,
  setup(props, { attrs, emit, slots }) {
    const surface = useEffectiveSurface(() => props.surface);
    const [selection, setSelection] = useControllableState<string[]>({
      value: () => props.modelValue,
      defaultValue: () => props.defaultValue ?? [],
      onChange: (next) => emit('update:modelValue', next),
    });
    const buttons = new Map<string, HTMLButtonElement>();

    function onKeydown(event: KeyboardEvent, value: string, values: string[]) {
      const action = chipGroupKeyAction(event.key, props.multiple);
      if (action === undefined) return;
      event.preventDefault();
      if (action === 'toggle') {
        setSelection(toggleChipSelection(selection.value, value, props.multiple));
        return;
      }
      // In the radio group pattern, a move focuses and selects.
      const move = chipGroupMove(values, selection.value, value, action);
      if (!move) return;
      buttons.get(move.focus)?.focus();
      if (move.selection) setSelection(move.selection);
    }

    return () => {
      const chips = elementNodes(slots.default?.());
      const values = chips.map(chipValue).filter((value): value is string => value !== undefined);
      const tabStop = props.multiple ? undefined : chipGroupTabStop(values, selection.value);
      const named = Boolean(attrs['aria-label'] || attrs['aria-labelledby']);
      return h(
        'div',
        { role: chipGroupRole(props.multiple, named), class: chipGroupClasses },
        chips.map((chip, index) => {
          const value = chipValue(chip);
          if (value === undefined) return chip;
          const selected = selection.value.includes(value);
          return h(
            'button',
            {
              key: chip.key ?? index,
              ref: (element: unknown) => {
                if (element) buttons.set(value, element as HTMLButtonElement);
                else buttons.delete(value);
              },
              type: 'button',
              role: props.multiple ? 'checkbox' : 'radio',
              'aria-checked': selected,
              tabindex: props.multiple ? undefined : value === tabStop ? 0 : -1,
              'data-value': value,
              'data-selected': selected ? 'true' : 'false',
              class: chipGroupItemClasses(surface.value, selected),
              onClick: () => setSelection(toggleChipSelection(selection.value, value, props.multiple)),
              onKeydown: (event: KeyboardEvent) => onKeydown(event, value, values),
            },
            [chip],
          );
        }),
      );
    };
  },
});
