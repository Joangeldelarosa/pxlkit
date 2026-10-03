<script setup lang="ts">
import { computed, ref, useAttrs, useId, useTemplateRef, watch } from 'vue';
import {
  chipDeleteLabel,
  clampHighlight,
  comboboxListboxId,
  comboboxOptionId,
  fieldDescribedBy,
  fieldMessageId,
  filterComboboxOptions,
  isMultiSelectFull,
  multiSelectCheckClasses,
  multiSelectClasses,
  multiSelectKeydown,
  multiSelectOptionClasses,
  passMultiSelectFocus,
  toggleMultiSelectValue,
  type Size,
  type Surface,
} from '@pxlkit/ui-kit-core';
import FieldShell from '../_internal/FieldShell.vue';
import PixelGlyph from '../_internal/PixelGlyph.vue';
import { RenderNode, type PxlNode } from '../_internal/render-node.js';
import { useControllableState } from '../composables/controllable.js';
import { useEffectiveSurface } from '../composables/surface.js';
import PixelPopover from '../overlay-foundation/PixelPopover.vue';
import PixelPopoverContent from '../overlay-foundation/PixelPopoverContent.vue';
import { ListboxField } from './_internal/ListboxField.js';

/** One choice of a multi-select. */
export interface PixelMultiSelectOption {
  value: string;
  label: string;
  /** Shown before the label, on the option and on its chip. */
  icon?: PxlNode;
  /** The option shows but cannot be picked. */
  disabled?: boolean;
}

/**
 * Multi-value combobox: the picked options show as chips before the combobox
 * in its field, each with a remove button, and the listbox
 * (`aria-multiselectable`) in a popover toggles them, up to an optional `max`
 * with a count under the list. A press on the field, the arrows, Enter and
 * Space open it; the arrows move the highlight round the options, Home / End
 * to the ends, Enter or Space toggles the highlighted option (Space only from
 * the combobox: it types in the search field) and Backspace removes the last
 * chip while the search is empty. `searchable` adds a search field that
 * takes focus; `clearable` a clear button. Bind the values with `v-model`,
 * or leave them uncontrolled with `default-value`; with a `name`, one hidden
 * input per value submits them (`FormData.getAll(name)`). Extra attributes
 * and listeners go to the combobox, and a `disabled` one disables the whole
 * field.
 *
 * @example
 * <PixelMultiSelect v-model="stack" label="Frameworks" :options="frameworks" :max="3" />
 */
export interface PixelMultiSelectProps {
  /** The selected values, in the order picked (`v-model`); leave unset for an uncontrolled multi-select. */
  modelValue?: string[];
  /** Initial values while uncontrolled. */
  defaultValue?: string[];
  /** The options of the listbox. */
  options: PixelMultiSelectOption[];
  /** Shows a search field that filters the options. */
  searchable?: boolean;
  /** Most values that can be selected. */
  max?: number;
  /** Text shown while nothing is selected. */
  placeholder?: string;
  /** Shows a button that clears the selection while there is one. */
  clearable?: boolean;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Trigger height. */
  size?: Size;
  /** Label rendered above the trigger. */
  label?: string;
  /** Helper text below the field; hidden while `error` is set. */
  hint?: string;
  /** Error message below the field; marks the trigger invalid. */
  error?: string;
  /** Form field name — one hidden input per value submits the selection. */
  name?: string;
  /** `id` of the trigger; generated when left out. */
  id?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PixelMultiSelectProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
  searchable: false,
  max: undefined,
  placeholder: 'Select…',
  clearable: false,
  surface: undefined,
  size: 'md',
  label: undefined,
  hint: undefined,
  error: undefined,
  name: undefined,
  id: undefined,
});

const emit = defineEmits<{
  /** The selected values after every toggle, removal or clear. */
  'update:modelValue': [values: string[]];
}>();

const surface = useEffectiveSurface(() => props.surface);
const generatedId = useId();
const triggerId = computed(() => props.id ?? `${generatedId}-trigger`);
const listboxId = comboboxListboxId(generatedId);
const attrs = useAttrs();
// Attributes are not reactive: the consumer's `aria-describedby` is read while
// rendering, and the hint / error is added to it while one shows.
const describedBy = () =>
  fieldDescribedBy(triggerId.value, props, attrs['aria-describedby'] as string | undefined);
const trigger = useTemplateRef<HTMLButtonElement>('trigger');
const valuesElement = useTemplateRef<HTMLElement>('values');
const search = useTemplateRef<HTMLInputElement>('search');
// A `disabled` attribute disables the combobox, and with it the field's buttons.
const disabled = () => !!attrs.disabled || attrs.disabled === '';

const [value, setValue] = useControllableState<string[]>({
  value: () => props.modelValue,
  defaultValue: () => props.defaultValue ?? [],
  onChange: (next) => emit('update:modelValue', next),
});

const open = ref(false);
const query = ref('');
const highlighted = ref(0);

const isSelected = (option: PixelMultiSelectOption) => value.value.includes(option.value);
// Unselected options cannot be picked once the selection is full.
const isOptionDisabled = (option: PixelMultiSelectOption) =>
  !!option.disabled || (!isSelected(option) && isMultiSelectFull(value.value, props.max));

const selectedOptions = computed(() =>
  value.value
    .map((selected) => props.options.find((option) => option.value === selected))
    .filter((option): option is PixelMultiSelectOption => !!option),
);
const filtered = computed(() =>
  props.searchable && query.value ? filterComboboxOptions(props.options, query.value) : props.options,
);
const activeId = computed(() => {
  const option = filtered.value[highlighted.value];
  return option ? comboboxOptionId(listboxId, option.value) : undefined;
});
const classes = computed(() => multiSelectClasses(surface.value, { size: props.size, invalid: !!props.error, open: open.value }));
const showClear = computed(() => props.clearable && value.value.length > 0);

// Closing resets the search and the highlight.
watch(open, (isOpen) => {
  if (isOpen) return;
  query.value = '';
  highlighted.value = 0;
});

// Keep the highlight on a listed option as the search narrows the list.
watch([() => filtered.value.length, highlighted], ([count, current]) => {
  const clamped = clampHighlight(current, count);
  if (clamped !== current) highlighted.value = clamped;
});

// The search field takes focus as the popover opens.
watch(search, (element) => element?.focus(), { flush: 'post' });

function toggle(option: string) {
  const next = toggleMultiSelectValue(value.value, option, props.max);
  if (next) setValue(next);
}

function onOptionClick(option: PixelMultiSelectOption) {
  if (!isOptionDisabled(option)) toggle(option.value);
}

// The combobox and the search field share the keys; Space types in the field.
function onKeydown(event: KeyboardEvent, inSearch = false) {
  // Escape closes the popover, which hands focus back to the field: it cannot
  // take it, so focus leaves the search field for the combobox.
  if (event.key === 'Escape' && inSearch) {
    trigger.value?.focus();
    return;
  }
  const action = multiSelectKeydown(event.key, {
    open: open.value,
    highlighted: highlighted.value,
    count: filtered.value.length,
    canToggle: (index) => !isOptionDisabled(filtered.value[index]!),
    query: query.value,
    selected: value.value.length,
    inSearch,
  });
  if (!action) return;
  event.preventDefault();
  if (action.kind === 'open') open.value = true;
  else if (action.kind === 'highlight') highlighted.value = action.index;
  else if (action.kind === 'toggle') toggle(filtered.value[action.index]!.value);
  else if (action.kind === 'removeLast') toggle(value.value[value.value.length - 1]!);
}

// A press on the field focuses the combobox, which takes the keys.
function onFieldClick(event: MouseEvent) {
  if (disabled()) event.preventDefault();
  else if (!event.defaultPrevented) trigger.value?.focus();
}

// The remove and clear buttons leave focus where it is under the pointer, as
// the options do, and keep the field from toggling the listbox; one that
// holds focus hands it on as it goes.
function removeChip(event: MouseEvent, option: string) {
  event.preventDefault();
  passMultiSelectFocus(event.currentTarget as HTMLElement, valuesElement.value, trigger.value);
  toggle(option);
}

function clearSelection(event: MouseEvent) {
  event.preventDefault();
  passMultiSelectFocus(event.currentTarget as HTMLElement, valuesElement.value, trigger.value);
  setValue([]);
}

function onSearch(event: Event) {
  query.value = (event.target as HTMLInputElement).value;
  highlighted.value = 0;
}

defineExpose({
  /** The combobox trigger. */
  element: trigger,
});
</script>

<template>
  <FieldShell
    :label="label"
    :hint="hint"
    :error="error"
    :surface="surface"
    :html-for="triggerId"
    :message-id="fieldMessageId(triggerId)"
  >
    <template v-if="name">
      <input v-for="selected in value" :key="selected" type="hidden" :name="name" :value="selected" />
    </template>
    <PixelPopover
      v-model:open="open"
      side="bottom"
      align="start"
      :side-offset="6"
      :surface="surface"
      haspopup="listbox"
      role="none"
    >
      <!-- The chips, the combobox and the clear button sit side by side in the
           field, as a button cannot hold another. -->
      <ListboxField>
        <div :class="classes.field" @click="onFieldClick">
          <span ref="values" :class="classes.values">
            <span v-for="option in selectedOptions" :key="option.value" :class="classes.chip">
              <span v-if="option.icon" :class="classes.icon"><RenderNode :node="option.icon" /></span>
              <span :class="classes.chipLabel">{{ option.label }}</span>
              <button
                type="button"
                :aria-label="chipDeleteLabel(option.label)"
                :data-pxl-chip-remove="option.value"
                :disabled="disabled()"
                :class="classes.chipRemove"
                @mousedown.prevent
                @click="removeChip($event, option.value)"
              >
                <PixelGlyph name="close" :class="classes.chipRemoveGlyph" />
              </button>
            </span>
            <button
              v-bind="$attrs"
              :id="triggerId"
              ref="trigger"
              type="button"
              role="combobox"
              :aria-controls="listboxId"
              aria-haspopup="listbox"
              :aria-expanded="open"
              :aria-activedescendant="open ? activeId : undefined"
              :aria-invalid="error ? true : undefined"
              :aria-describedby="describedBy()"
              :class="classes.trigger"
              @keydown="onKeydown($event)"
            >
              <!-- The placeholder, or the value the chips before it show. -->
              <span v-if="selectedOptions.length === 0" :class="classes.placeholder">{{ placeholder }}</span>
              <span v-else class="sr-only">{{ selectedOptions.map((option) => option.label).join(', ') }}</span>
            </button>
          </span>
          <span :class="classes.actions">
            <button
              v-if="showClear"
              type="button"
              aria-label="Clear selection"
              :disabled="disabled()"
              :class="classes.clear"
              @mousedown.prevent
              @click="clearSelection"
            >
              <PixelGlyph name="close" :class="classes.clearGlyph" />
            </button>
            <PixelGlyph name="chevronDown" :class="classes.chevron" />
          </span>
        </div>
      </ListboxField>
      <PixelPopoverContent :class="classes.content" style="min-width: 220px">
        <div v-if="searchable" :class="classes.search">
          <!-- Focus sits here while open: it carries the active option, as the combobox does. -->
          <input
            ref="search"
            type="text"
            role="searchbox"
            aria-label="Filter options"
            aria-autocomplete="list"
            :aria-controls="listboxId"
            :aria-activedescendant="activeId"
            placeholder="Search…"
            :value="query"
            :class="classes.input"
            @input="onSearch"
            @keydown="onKeydown($event, true)"
          />
        </div>
        <ul :id="listboxId" role="listbox" aria-multiselectable="true" :class="classes.listbox">
          <li v-if="filtered.length === 0" :class="classes.empty">No results.</li>
          <template v-else>
            <!-- Options keep focus where it is: mousedown would move it before the click lands. -->
            <li
              v-for="(option, index) in filtered"
              :id="comboboxOptionId(listboxId, option.value)"
              :key="option.value"
              role="option"
              :aria-selected="isSelected(option)"
              :aria-disabled="isOptionDisabled(option) || undefined"
              :class="
                multiSelectOptionClasses(surface, {
                  selected: isSelected(option),
                  highlighted: index === highlighted,
                  disabled: isOptionDisabled(option),
                })
              "
              @mouseenter="highlighted = index"
              @mousedown.prevent
              @click="onOptionClick(option)"
            >
              <span :class="multiSelectCheckClasses(surface, isSelected(option))">
                <PixelGlyph v-if="isSelected(option)" name="check" :class="classes.checkGlyph" />
              </span>
              <span v-if="option.icon" :class="classes.icon"><RenderNode :node="option.icon" /></span>
              <span :class="classes.label">{{ option.label }}</span>
            </li>
          </template>
        </ul>
        <div v-if="max !== undefined" :class="classes.footer">{{ value.length }}/{{ max }} selected</div>
      </PixelPopoverContent>
    </PixelPopover>
  </FieldShell>
</template>
