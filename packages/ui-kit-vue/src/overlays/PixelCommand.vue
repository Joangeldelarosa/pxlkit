<script setup lang="ts">
import { computed, ref, useId, useTemplateRef, watch } from 'vue';
import {
  commandClasses,
  commandLayerClasses,
  commandOptionClasses,
  commandOptionId,
  commandRows,
  matchesCommandShortcut,
  overlayBackdropClasses,
  parseCommandShortcut,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { RenderNode, type PxlNode } from '../_internal/render-node.js';
import { useEventListener } from '../composables/event-listener.js';
import { useEscape, useFocusTrap, useScrollLock } from '../composables/overlay.js';
import { useEffectiveSurface } from '../composables/surface.js';
import PixelPortal from '../overlay-foundation/PixelPortal.vue';

/** A command of the palette. */
export interface PixelCommandItem {
  id: string;
  label: string;
  icon?: PxlNode;
  /** Keyboard hint shown at the end of the row (display only). */
  shortcut?: string;
  /** Extra words the search matches. */
  keywords?: string[];
  /** Runs the command (click or Enter). Close the palette here if you want it to. */
  onSelect: () => void;
}

/** Commands under a heading. */
export interface PixelCommandGroup {
  heading: string;
  items: PixelCommandItem[];
}

/**
 * Command palette: a search field over grouped commands, with a global
 * shortcut (`mod+k` by default) that toggles it, keyboard navigation
 * (arrows wrap, Home / End, Enter runs the highlighted command), focus trap,
 * scroll lock and Escape / backdrop dismissal. Bind it with `v-model:open`.
 *
 * @example
 * <PixelCommand v-model:open="open" :groups="[{ heading: 'Go', items: [{ id: 'home', label: 'Home', onSelect: goHome }] }]" />
 */
export interface PixelCommandProps {
  /** Whether the palette is visible (`v-model:open`). */
  open: boolean;
  /** Global shortcut that toggles the palette, such as `mod+k` (Cmd or Ctrl + K). */
  shortcut?: string;
  /** Placeholder of the search field. */
  placeholder?: string;
  /** Shown instead of the list when nothing matches. */
  emptyMessage?: string;
  /** The commands, by group. */
  groups: PixelCommandGroup[];
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

const props = withDefaults(defineProps<PixelCommandProps>(), {
  shortcut: 'mod+k',
  placeholder: 'Type a command or search…',
  emptyMessage: 'No results.',
  surface: undefined,
});
const emit = defineEmits<{
  /** The requested open state: the shortcut toggles it; Escape and the backdrop close it. */
  'update:open': [open: boolean];
}>();

const surface = useEffectiveSurface(() => props.surface);
const listboxId = useId();
const panel = useTemplateRef<HTMLElement>('panel');
const input = useTemplateRef<HTMLInputElement>('input');
const query = ref('');
const highlighted = ref(0);

const list = computed(() => commandRows(props.groups, query.value));
const classes = computed(() => commandClasses(surface.value));
const activeId = computed(() => {
  const item = list.value.items[highlighted.value];
  return item ? commandOptionId(listboxId, item.id) : undefined;
});
const backdropClasses = overlayBackdropClasses('fixed');
const parsedShortcut = computed(() => (props.shortcut ? parseCommandShortcut(props.shortcut) : null));

const setOpen = (open: boolean) => emit('update:open', open);

// Keep the highlight on a listed command when the list shrinks.
watch([() => list.value.items.length, highlighted], ([count, current]) => {
  if (count === 0) {
    if (current !== 0) highlighted.value = 0;
  } else if (current > count - 1) {
    highlighted.value = count - 1;
  }
});

watch(
  () => props.open,
  (open, _previous, onCleanup) => {
    if (!open) return;
    // Every opening starts from an empty search.
    query.value = '';
    highlighted.value = 0;
    const timer = setTimeout(() => input.value?.focus(), 0);
    onCleanup(() => clearTimeout(timer));
  },
  { immediate: true },
);

useEventListener('keydown', (event) => {
  if (!parsedShortcut.value || !matchesCommandShortcut(event, parsedShortcut.value)) return;
  event.preventDefault();
  setOpen(!props.open);
});
useEscape(() => setOpen(false), () => props.open);
useScrollLock(() => props.open);
useFocusTrap(() => props.open, panel);

function onInput(event: Event) {
  query.value = (event.target as HTMLInputElement).value;
  highlighted.value = 0;
}

function onKeydown(event: KeyboardEvent) {
  const count = list.value.items.length;
  if (count === 0) return;
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      highlighted.value = (highlighted.value + 1) % count;
      break;
    case 'ArrowUp':
      event.preventDefault();
      highlighted.value = (highlighted.value - 1 + count) % count;
      break;
    case 'Home':
      event.preventDefault();
      highlighted.value = 0;
      break;
    case 'End':
      event.preventDefault();
      highlighted.value = count - 1;
      break;
    case 'Enter':
      event.preventDefault();
      list.value.items[highlighted.value]?.onSelect();
      break;
  }
}

defineExpose({
  /** The palette panel while it is open. */
  element: panel,
});
</script>

<template>
  <PixelPortal v-if="open">
    <div :class="commandLayerClasses" aria-hidden="false">
      <div aria-hidden="true" data-pxl-overlay-backdrop="" :class="backdropClasses" @click="setOpen(false)" />
      <div ref="panel" role="dialog" aria-modal="true" aria-label="Command palette" :class="classes.panel">
        <div :class="classes.search">
          <span aria-hidden="true" :class="classes.prompt">&gt;</span>
          <input
            ref="input"
            type="text"
            role="combobox"
            :aria-expanded="list.items.length > 0"
            :aria-controls="list.items.length > 0 ? listboxId : undefined"
            aria-autocomplete="list"
            :aria-activedescendant="activeId"
            :placeholder="placeholder"
            :value="query"
            :class="classes.input"
            @input="onInput"
            @keydown="onKeydown"
          />
        </div>
        <div v-if="list.items.length === 0" :class="classes.empty">{{ emptyMessage }}</div>
        <ul v-else :id="listboxId" role="listbox" :class="classes.listbox">
          <!-- Options keep focus in the search field: mousedown would move it before the click lands. -->
          <template v-for="row in list.rows" :key="row.key">
            <li v-if="row.kind === 'heading'" role="presentation" :class="classes.heading">{{ row.heading }}</li>
            <li
              v-else
              :id="commandOptionId(listboxId, row.item.id)"
              role="option"
              :aria-selected="row.index === highlighted"
              :class="commandOptionClasses(surface, row.index === highlighted)"
              @mouseenter="highlighted = row.index"
              @mousedown.prevent
              @click="row.item.onSelect()"
            >
              <span v-if="row.item.icon" :class="classes.icon"><RenderNode :node="row.item.icon" /></span>
              <span :class="classes.label">{{ row.item.label }}</span>
              <kbd v-if="row.item.shortcut" :class="classes.shortcut">{{ row.item.shortcut }}</kbd>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </PixelPortal>
</template>
