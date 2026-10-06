<script setup lang="ts">
import { computed, ref, useAttrs, useId, useTemplateRef, watch } from 'vue';
import {
  clampHighlight,
  comboboxClasses,
  comboboxKeydown,
  comboboxListboxId,
  comboboxOptionClasses,
  comboboxOptionId,
  comboboxRows,
  fieldDescribedBy,
  fieldMessageId,
  filterComboboxOptions,
  type Size,
  type Surface,
} from '@pxlkit/ui-kit-core';
import FieldShell from '../_internal/FieldShell.vue';
import PixelGlyph from '../_internal/PixelGlyph.vue';
import { useControllableState } from '../composables/controllable.js';
import { useEffectiveSurface } from '../composables/surface.js';
import PixelPopover from '../overlay-foundation/PixelPopover.vue';
import PixelPopoverContent from '../overlay-foundation/PixelPopoverContent.vue';
import PixelPopoverTrigger from '../overlay-foundation/PixelPopoverTrigger.js';

/** One choice of a combobox. */
export interface PixelComboboxOption {
  value: string;
  label: string;
  /** Heading the option is listed under; the options of a group are listed together. */
  group?: string;
  /** The option shows but cannot be selected. */
  disabled?: boolean;
}

/**
 * Single-value combobox: a `role="combobox"` trigger over a listbox in a
 * popover, with a search field that filters it (`searchable`, on by
 * default) and options grouped under headings by their `group`. ArrowDown,
 * ArrowUp and Enter open it; the arrows move the highlight round the listed
 * options, Home / End to the ends, Enter selects, Escape and a press outside
 * close. Bind the value with `v-model`, or leave it uncontrolled with
 * `default-value`; with a `name` a hidden input submits it. Extra attributes
 * and listeners go to the trigger.
 *
 * @example
 * <PixelCombobox v-model="fruit" label="Fruit" :options="fruits" />
 */
export interface PixelComboboxProps {
  /** Selected value (`v-model`); leave unset for an uncontrolled combobox. */
  modelValue?: string;
  /** Initial value while uncontrolled. */
  defaultValue?: string;
  /** The options of the listbox. */
  options: PixelComboboxOption[];
  /** Shows the search field that filters the options. */
  searchable?: boolean;
  /** Text shown while nothing is selected. */
  placeholder?: string;
  /** Shown in place of the listbox when nothing matches the search. */
  emptyMessage?: string;
  /** Disables the combobox and greys out the trigger. */
  disabled?: boolean;
  /** Trigger height. */
  size?: Size;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Label rendered above the trigger. */
  label?: string;
  /** Helper text below the field; hidden while `error` is set. */
  hint?: string;
  /** Error message below the field; marks the trigger invalid. */
  error?: string;
  /** Form field name — a hidden input submits the value. */
  name?: string;
  /** `id` of the trigger; generated when left out. */
  id?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PixelComboboxProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
  searchable: true,
  placeholder: 'Select…',
  emptyMessage: 'No results.',
  disabled: false,
  size: 'md',
  surface: undefined,
  label: undefined,
  hint: undefined,
  error: undefined,
  name: undefined,
  id: undefined,
});

const emit = defineEmits<{
  /** The value of the option the user selected. */
  'update:modelValue': [value: string];
}>();

const surface = useEffectiveSurface(() => props.surface);
const generatedId = useId();
const listboxId = comboboxListboxId(generatedId);
const triggerId = computed(() => props.id ?? `${generatedId}-trigger`);
const attrs = useAttrs();
// Attributes are not reactive: the consumer's `aria-describedby` is read while
// rendering, and the hint / error is added to it while one shows.
const describedBy = () =>
  fieldDescribedBy(triggerId.value, props, attrs['aria-describedby'] as string | undefined);
const trigger = useTemplateRef<HTMLButtonElement>('trigger');
const search = useTemplateRef<HTMLInputElement>('search');

const [value, setValue] = useControllableState<string>({
  value: () => props.modelValue,
  defaultValue: () => props.defaultValue ?? '',
  onChange: (next) => emit('update:modelValue', next),
});

const open = ref(false);
const query = ref('');
const highlighted = ref(0);

const list = computed(() => comboboxRows(filterComboboxOptions(props.options, query.value)));
const selected = computed(() => props.options.find((option) => option.value === value.value));
const activeId = computed(() => {
  const option = list.value.items[highlighted.value];
  return option ? comboboxOptionId(listboxId, option.value) : undefined;
});
const classes = computed(() =>
  comboboxClasses(surface.value, {
    size: props.size,
    invalid: !!props.error,
    disabled: props.disabled,
    open: open.value,
    hasValue: !!selected.value,
  }),
);

// Every opening starts from an empty search, on the first option.
watch(open, (isOpen) => {
  if (isOpen) return;
  query.value = '';
  highlighted.value = 0;
});

// The search field takes focus once the popover is on the page.
watch([open, () => props.searchable], ([isOpen, searchable], _previous, onCleanup) => {
  if (!isOpen || !searchable) return;
  const timer = setTimeout(() => search.value?.focus(), 0);
  onCleanup(() => clearTimeout(timer));
});

// Keep the highlight on a listed option as the search narrows the list.
watch([() => list.value.items.length, highlighted], ([count, current]) => {
  const clamped = clampHighlight(current, count);
  if (clamped !== current) highlighted.value = clamped;
});

function onOpenChange(next: boolean) {
  if (!props.disabled) open.value = next;
}

function commit(option: PixelComboboxOption) {
  if (option.disabled) return;
  setValue(option.value);
  open.value = false;
}

// Shared by the trigger, the search field and the listbox.
function onKeydown(event: KeyboardEvent) {
  const action = comboboxKeydown(event.key, {
    open: open.value,
    highlighted: highlighted.value,
    count: list.value.items.length,
  });
  if (!action) return;
  event.preventDefault();
  if (action.kind === 'open') onOpenChange(true);
  else if (action.kind === 'highlight') highlighted.value = action.index;
  else if (action.kind === 'select') commit(list.value.items[action.index]!);
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
    <div :class="classes.container">
      <input v-if="name" type="hidden" :name="name" :value="value" readonly />
      <PixelPopover
        :open="open"
        side="bottom"
        align="start"
        :side-offset="4"
        :surface="surface"
        haspopup="listbox"
        role="none"
        @update:open="onOpenChange"
      >
        <PixelPopoverTrigger>
          <button
            v-bind="$attrs"
            :id="triggerId"
            ref="trigger"
            type="button"
            role="combobox"
            :aria-expanded="open"
            aria-haspopup="listbox"
            :aria-controls="listboxId"
            :aria-activedescendant="open ? activeId : undefined"
            :aria-disabled="disabled || undefined"
            :aria-invalid="error ? true : undefined"
            :aria-describedby="describedBy()"
            :disabled="disabled"
            :class="classes.trigger"
            @keydown="onKeydown"
          >
            <span :class="classes.value">{{ selected ? selected.label : placeholder }}</span>
            <PixelGlyph name="chevronDown" :class="classes.chevron" />
          </button>
        </PixelPopoverTrigger>
        <PixelPopoverContent :class="classes.content" style="min-width: 12rem">
          <div v-if="searchable" :class="classes.search">
            <input
              ref="search"
              type="text"
              role="searchbox"
              aria-label="Filter options"
              aria-autocomplete="list"
              :aria-controls="listboxId"
              :aria-activedescendant="activeId"
              :value="query"
              :class="classes.input"
              placeholder="Search…"
              @input="onSearch"
              @keydown="onKeydown"
            />
          </div>
          <div v-if="list.items.length === 0" :class="classes.empty">{{ emptyMessage }}</div>
          <!-- Focusable only without a search field, which otherwise takes the keys. -->
          <ul
            v-else
            :id="listboxId"
            role="listbox"
            :class="classes.listbox"
            :tabindex="searchable ? undefined : 0"
            @keydown="onKeydown"
          >
            <template v-for="row in list.rows" :key="row.key">
              <li v-if="row.kind === 'heading'" role="presentation" :class="classes.heading">{{ row.heading }}</li>
              <!-- Options keep focus where it is: mousedown would move it before the click lands. -->
              <li
                v-else
                :id="comboboxOptionId(listboxId, row.option.value)"
                role="option"
                :aria-selected="row.option.value === value"
                :aria-disabled="row.option.disabled || undefined"
                :class="comboboxOptionClasses(surface, { highlighted: row.index === highlighted, disabled: !!row.option.disabled })"
                @mouseenter="highlighted = row.index"
                @mousedown.prevent
                @click="commit(row.option)"
              >
                <span :class="classes.label">{{ row.option.label }}</span>
                <PixelGlyph v-if="row.option.value === value" name="check" :class="classes.check" />
              </li>
            </template>
          </ul>
        </PixelPopoverContent>
      </PixelPopover>
    </div>
  </FieldShell>
</template>
