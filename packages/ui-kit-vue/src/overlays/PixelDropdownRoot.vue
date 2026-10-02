<script setup lang="ts">
import { onScopeDispose, provide, ref, useId, useTemplateRef, watch, type VNode } from 'vue';
import {
  DROPDOWN_TYPEAHEAD_RESET_MS,
  dropdownRootClasses,
  dropdownTypeaheadMatch,
  isTypeaheadKey,
  nextDropdownHighlight,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { useControllableState } from '../composables/controllable.js';
import { useClickOutside, useEscape } from '../composables/overlay.js';
import { useEffectiveSurface } from '../composables/surface.js';
import { PIXEL_DROPDOWN, type DropdownItemEntry } from './_internal/dropdown-context.js';

/**
 * Root of a compositional dropdown menu: put a `PixelDropdownTrigger` and a
 * `PixelDropdownContent` of items inside. The arrows move a highlight over
 * the enabled items (and open the closed menu on the first one), Home / End
 * jump to the ends, Enter or Space activates the highlighted item, typing
 * jumps to an item by its label, and Escape or a press outside closes the
 * menu. Bind `v-model:open` to control it, or leave it uncontrolled with
 * `default-open`.
 *
 * @example
 * <PixelDropdownRoot>
 *   <PixelDropdownTrigger>Menu</PixelDropdownTrigger>
 *   <PixelDropdownContent>
 *     <PixelDropdownItem value="rename" @select="rename">Rename</PixelDropdownItem>
 *   </PixelDropdownContent>
 * </PixelDropdownRoot>
 */
export interface PixelDropdownRootProps {
  /** Whether the menu is open (`v-model:open`); leave unset for an uncontrolled menu. */
  open?: boolean;
  /** Initial open state while uncontrolled. */
  defaultOpen?: boolean;
  /** Surface override for the trigger and the menu; defaults to the nearest provider. */
  surface?: Surface;
}

const props = withDefaults(defineProps<PixelDropdownRootProps>(), {
  open: undefined,
  defaultOpen: false,
  surface: undefined,
});
const emit = defineEmits<{
  /** Every open state the menu asks for, for `v-model:open`. */
  'update:open': [open: boolean];
}>();
defineSlots<{ default?(): VNode[] }>();

const surface = useEffectiveSurface(() => props.surface);
const [open, setOpen] = useControllableState({
  value: () => props.open,
  defaultValue: () => props.defaultOpen,
  onChange: (next) => emit('update:open', next),
});
const menuId = useId();
const root = useTemplateRef<HTMLElement>('root');
const highlighted = ref<string | null>(null);
const items: DropdownItemEntry[] = [];

const enabledValues = () => items.filter((item) => !item.disabled()).map((item) => item.value());

function close() {
  setOpen(false);
  highlighted.value = null;
}

function selectHighlighted() {
  const value = highlighted.value;
  if (!value) return;
  items.find((item) => item.value() === value)?.select();
  close();
}

let typed = '';
let typeaheadTimer: ReturnType<typeof setTimeout> | undefined;
function typeahead(key: string) {
  clearTimeout(typeaheadTimer);
  typed = (typed + key).toLowerCase();
  const match = dropdownTypeaheadMatch(
    enabledValues(),
    (value) => items.find((item) => item.value() === value)?.label(),
    typed,
  );
  if (match) highlighted.value = match;
  typeaheadTimer = setTimeout(() => {
    typed = '';
  }, DROPDOWN_TYPEAHEAD_RESET_MS);
}
onScopeDispose(() => clearTimeout(typeaheadTimer));

// An arrow key on the closed menu opens it on its first item. Items register
// as the menu renders, so the highlight waits for that render; a parent that
// keeps the menu closed drops the request.
const highlightFirstOnOpen = ref(false);
watch(
  [open, highlightFirstOnOpen],
  ([isOpen, requested]) => {
    if (!requested) return;
    highlightFirstOnOpen.value = false;
    const [first] = enabledValues();
    if (isOpen && first) highlighted.value = first;
  },
  { flush: 'post' },
);

function onKeydown(event: KeyboardEvent) {
  const { key } = event;
  if (key === 'ArrowDown' || key === 'ArrowUp') {
    event.preventDefault();
    if (!open.value) {
      highlightFirstOnOpen.value = true;
      setOpen(true);
      return;
    }
    const values = enabledValues();
    if (values.length === 0) return;
    highlighted.value = nextDropdownHighlight(values, highlighted.value, key === 'ArrowDown' ? 1 : -1) ?? null;
    return;
  }
  if (key === 'Home' || key === 'End') {
    event.preventDefault();
    const values = enabledValues();
    if (values.length === 0) return;
    setOpen(true);
    highlighted.value = key === 'Home' ? values[0]! : values[values.length - 1]!;
    return;
  }
  if ((key === 'Enter' || key === ' ') && open.value && highlighted.value) {
    event.preventDefault();
    selectHighlighted();
    return;
  }
  if (open.value && isTypeaheadKey(key)) typeahead(key);
}

useClickOutside(root, close);
useEscape(close, open);
watch(open, (isOpen) => {
  if (!isOpen) highlighted.value = null;
});

provide(PIXEL_DROPDOWN, {
  open,
  setOpen,
  surface,
  menuId,
  root,
  highlighted,
  highlight(value) {
    highlighted.value = value;
  },
  registerItem(item) {
    items.push(item);
    return () => {
      const index = items.indexOf(item);
      if (index >= 0) items.splice(index, 1);
    };
  },
});
</script>

<template>
  <div ref="root" :class="dropdownRootClasses" @keydown="onKeydown"><slot /></div>
</template>
