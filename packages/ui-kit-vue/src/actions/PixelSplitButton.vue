<script setup lang="ts">
import { computed, onScopeDispose, ref, useId, useTemplateRef, watch } from 'vue';
import {
  DROPDOWN_TYPEAHEAD_RESET_MS,
  SPLIT_BUTTON_TOGGLE_LABEL,
  dropdownChevronClasses,
  dropdownMenuKeyAction,
  dropdownTriggerKeyAction,
  dropdownTypeaheadMatch,
  nextDropdownHighlight,
  splitButtonGroupClasses,
  splitButtonItemClasses,
  splitButtonItemId,
  splitButtonMenuAlignsRight,
  splitButtonMenuClasses,
  splitButtonPrimaryClasses,
  splitButtonRootClasses,
  splitButtonToggleClasses,
  type DropdownEdge,
  type DropdownMove,
  type Surface,
  type Tone,
} from '@pxlkit/ui-kit-core';
import PixelGlyph from '../_internal/PixelGlyph.vue';
import { useClickOutside, useEscape } from '../composables/overlay.js';
import { useEffectiveSurface } from '../composables/surface.js';
import type { Option } from '../forms/_internal/option.js';
import PixelButton from './PixelButton.vue';

/**
 * A primary action joined to a chevron button that opens a menu of related
 * actions. The menu follows the WAI-ARIA menu button pattern: it takes focus
 * as it opens and points `aria-activedescendant` at the highlighted option.
 * The arrows, Home and End move the highlight, Enter and Space choose it,
 * typing jumps to an option by its label; ArrowDown on the chevron opens the
 * menu on its first option, ArrowUp on its last. Escape, Tab and choosing
 * close it with focus back on the chevron; a press outside closes it and
 * focus follows the pointer.
 */
export interface PixelSplitButtonProps {
  /** Text of the primary (left) button. */
  label: string;
  /** Options of the menu. */
  options: Option[];
  /** Color tone (maps to `toneMap`). */
  tone?: Tone;
  /** Surface aesthetic override; defaults to the nearest provider. */
  surface?: Surface;
  /** Disables the primary button and the chevron. */
  disabled?: boolean;
}

const props = withDefaults(defineProps<PixelSplitButtonProps>(), {
  tone: 'purple',
  surface: undefined,
  disabled: false,
});
const emit = defineEmits<{
  /** The primary (label) button was clicked. */
  primary: [];
  /** An option was chosen, with its `value`; the menu closes. */
  select: [value: string];
}>();

const surface = useEffectiveSurface(() => props.surface);
const open = ref(false);
const alignRight = ref(false);
const highlighted = ref<string | null>(null);
const toggleId = useId();
const menuId = useId();
const root = useTemplateRef<HTMLElement>('root');
const toggle = useTemplateRef<HTMLButtonElement>('toggle');
const menu = useTemplateRef<HTMLElement>('menu');

const values = computed(() => props.options.map((option) => option.value));
const activeIndex = computed(() => (highlighted.value === null ? -1 : values.value.indexOf(highlighted.value)));
const groupClasses = computed(() => splitButtonGroupClasses(surface.value, props.tone));
const toggleClasses = computed(() => splitButtonToggleClasses(surface.value, props.tone));
const menuClasses = computed(() => splitButtonMenuClasses(surface.value, alignRight.value));

// Opened from the keyboard, the menu starts on its first or last option.
function show(edge?: DropdownEdge) {
  if (root.value) alignRight.value = splitButtonMenuAlignsRight(root.value.getBoundingClientRect().left, window.innerWidth);
  highlighted.value = edge ? (nextDropdownHighlight(values.value, null, edge) ?? null) : null;
  open.value = true;
}

// Focus the menu holds goes back to the chevron — but not after a press
// outside, where it follows the pointer.
function close(returnFocus = true) {
  if (returnFocus && menu.value?.contains(document.activeElement)) toggle.value?.focus();
  open.value = false;
  highlighted.value = null;
}

function choose(value: string) {
  emit('select', value);
  close();
}

// A disabled button gets no clicks in a browser; synthetic ones are ignored too.
function onPrimaryClick() {
  if (!props.disabled) emit('primary');
}

function onToggleClick() {
  if (props.disabled) return;
  if (open.value) close();
  else show();
}

function move(to: DropdownMove) {
  const next = nextDropdownHighlight(values.value, highlighted.value, to);
  if (next) highlighted.value = next;
}

let typed = '';
let typeaheadTimer: ReturnType<typeof setTimeout> | undefined;
function typeahead(key: string) {
  clearTimeout(typeaheadTimer);
  typed = (typed + key).toLowerCase();
  const match = dropdownTypeaheadMatch(
    values.value,
    (value) => props.options.find((option) => option.value === value)?.label,
    typed,
  );
  if (match) highlighted.value = match;
  typeaheadTimer = setTimeout(() => {
    typed = '';
  }, DROPDOWN_TYPEAHEAD_RESET_MS);
}
onScopeDispose(() => clearTimeout(typeaheadTimer));

useClickOutside(root, () => close(false));
useEscape(() => close(), open);

// Focus moves into the menu as it opens.
watch(menu, (element) => element?.focus({ preventScroll: true }), { flush: 'post' });

// ArrowDown on the chevron opens the menu on its first option and ArrowUp on
// its last; either moves into the menu when it is already open. Enter and
// Space stay the button's own click, which toggles the menu.
function onToggleKeydown(event: KeyboardEvent) {
  const edge = dropdownTriggerKeyAction(event.key);
  if (!edge) return;
  event.preventDefault();
  if (!open.value) {
    show(edge);
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
    // Focus is back on the chevron before the browser's own Tab, which then
    // moves on from there.
    close();
    return;
  }
  event.preventDefault();
  if (action !== 'select') move(action);
  else if (highlighted.value !== null) choose(highlighted.value);
}
</script>

<template>
  <div ref="root" :class="splitButtonRootClasses">
    <div :class="groupClasses">
      <PixelButton
        :tone="tone"
        :surface="surface"
        :disabled="disabled"
        :class="splitButtonPrimaryClasses"
        @click="onPrimaryClick"
      >
        {{ label }}
      </PixelButton>
      <button
        ref="toggle"
        :id="toggleId"
        type="button"
        :aria-label="SPLIT_BUTTON_TOGGLE_LABEL"
        aria-haspopup="menu"
        :aria-expanded="open"
        :aria-controls="open ? menuId : undefined"
        :disabled="disabled"
        :class="toggleClasses"
        @click="onToggleClick"
        @keydown="onToggleKeydown"
      >
        <PixelGlyph name="chevronDown" :class="dropdownChevronClasses(open)" />
      </button>
    </div>
    <div
      v-if="open"
      ref="menu"
      :id="menuId"
      role="menu"
      tabindex="-1"
      aria-orientation="vertical"
      :aria-labelledby="toggleId"
      :aria-activedescendant="activeIndex >= 0 ? splitButtonItemId(menuId, activeIndex) : undefined"
      :class="menuClasses"
      @keydown="onMenuKeydown"
    >
      <button
        v-for="(option, index) in options"
        :key="option.value"
        :id="splitButtonItemId(menuId, index)"
        type="button"
        role="menuitem"
        tabindex="-1"
        :data-highlighted="index === activeIndex || undefined"
        :class="splitButtonItemClasses(surface, index === activeIndex)"
        @mouseenter="highlighted = option.value"
        @click="choose(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
