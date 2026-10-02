<script setup lang="ts">
import { computed, onScopeDispose, provide, ref, shallowRef, useId, useTemplateRef, watch, type VNode } from 'vue';
import {
  DROPDOWN_TYPEAHEAD_RESET_MS,
  dropdownMenuKeyAction,
  dropdownRootClasses,
  dropdownTriggerKeyAction,
  dropdownTypeaheadMatch,
  nextDropdownHighlight,
  returnFocusOnRemoval,
  type DropdownEdge,
  type DropdownMove,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { useControllableState } from '../composables/controllable.js';
import { useEventListener } from '../composables/event-listener.js';
import { useClickOutside, useEscape } from '../composables/overlay.js';
import { useEffectiveSurface } from '../composables/surface.js';
import { PIXEL_DROPDOWN, type DropdownItemEntry, type DropdownTriggerEntry } from './_internal/dropdown-context.js';

/**
 * Root of a compositional dropdown menu: put a `PixelDropdownTrigger` and a
 * `PixelDropdownContent` of items inside. The open menu takes focus, is named
 * by the trigger and points `aria-activedescendant` at a highlight the arrows
 * move over the enabled items (ArrowDown on the trigger opens the closed menu
 * on the first one, ArrowUp on the last); Home / End jump to the ends, Enter
 * or Space activates the highlighted item and typing jumps to an item by its
 * label. Escape, choosing an item and Tab close the menu with focus back on
 * the trigger; a press outside closes it too, and focus follows the pointer.
 * Bind `v-model:open` to control it, or leave it uncontrolled with
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
const generatedTriggerId = useId();
const root = useTemplateRef<HTMLElement>('root');
const highlighted = ref<string | null>(null);
const items: DropdownItemEntry[] = [];
const trigger = shallowRef<DropdownTriggerEntry | null>(null);
const menu = shallowRef<HTMLElement | null>(null);
// True while a press outside is closing the menu: focus then follows the
// pointer instead of returning to the trigger.
let pressOutside = false;

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

// An arrow key on the trigger opens the closed menu on its first or last
// item. Items register as the menu renders, so the highlight waits for that
// render; a parent that keeps the menu closed drops the request.
const highlightOnOpen = shallowRef<DropdownEdge | null>(null);
watch(
  [open, highlightOnOpen],
  ([isOpen, edge]) => {
    if (!edge) return;
    highlightOnOpen.value = null;
    if (isOpen) move(edge);
  },
  { flush: 'post' },
);

function move(to: DropdownMove) {
  const next = nextDropdownHighlight(enabledValues(), highlighted.value, to);
  if (next) highlighted.value = next;
}

// ArrowDown on the trigger opens the menu on its first item and ArrowUp on its
// last; either moves into the menu when it is already open. Enter and Space
// stay the button's own click, which toggles the menu.
function onTriggerKeydown(event: KeyboardEvent) {
  const edge = dropdownTriggerKeyAction(event.key);
  if (!edge) return;
  event.preventDefault();
  if (!open.value) {
    highlightOnOpen.value = edge;
    setOpen(true);
    return;
  }
  menu.value?.focus({ preventScroll: true });
  move(event.key === 'ArrowDown' ? 1 : -1);
}

// The menu holds focus while open; Escape closes it from anywhere.
function onMenuKeydown(event: KeyboardEvent) {
  const action = dropdownMenuKeyAction(event.key);
  if (action === undefined) return;
  if (action === 'typeahead') {
    typeahead(event.key);
    return;
  }
  if (action === 'leave') {
    // Focus is back on the trigger before the browser's own Tab, which then
    // moves on from there.
    trigger.value?.element()?.focus();
    close();
    return;
  }
  event.preventDefault();
  if (action === 'select') selectHighlighted();
  else move(action);
}

useClickOutside(root, () => {
  pressOutside = true;
  close();
});
useEscape(close, open);

// A press outside that did not close the menu (the parent kept it open) ends
// with the pointer release; a new open starts clean.
const releasePress = () => {
  pressOutside = false;
};
const openDocument = () => (open.value && typeof document !== 'undefined' ? document : null);
useEventListener('pointerup', releasePress, openDocument);
useEventListener('pointercancel', releasePress, openDocument);
watch(open, (isOpen) => {
  if (isOpen) pressOutside = false;
  else highlighted.value = null;
});

// Focus moves into the menu as it opens.
watch(menu, (element) => element?.focus({ preventScroll: true }), { flush: 'post' });

provide(PIXEL_DROPDOWN, {
  open,
  setOpen,
  surface,
  menuId,
  triggerId: computed(() => trigger.value?.id() ?? generatedTriggerId),
  activeId: computed(() => {
    const value = highlighted.value;
    return value ? items.find((item) => item.value() === value)?.id() : undefined;
  }),
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
  registerTrigger(entry) {
    trigger.value = entry;
    return () => {
      if (trigger.value === entry) trigger.value = null;
    };
  },
  setMenu(element) {
    // Called with null right before the menu leaves the page.
    if (!element && menu.value && !pressOutside) returnFocusOnRemoval(menu.value, () => trigger.value?.element());
    menu.value = element;
  },
  onTriggerKeydown,
  onMenuKeydown,
});
</script>

<template>
  <div ref="root" :class="dropdownRootClasses"><slot /></div>
</template>
