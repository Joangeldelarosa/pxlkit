<script setup lang="ts">
import { computed, provide, ref, useId, type VNode } from 'vue';
import { cn, type Surface } from '@pxlkit/ui-kit-core';
import { RenderNode, type PxlNode } from '../_internal/render-node.js';
import { useControllableState } from '../composables/controllable.js';
import { useEffectiveSurface } from '../composables/surface.js';
import { PIXEL_TABS, type TabsActivationMode, type TabsOrientation } from './_internal/tabs-context.js';
import PixelTabsList from './PixelTabsList.vue';
import PixelTabsPanel from './PixelTabsPanel.vue';
import PixelTabsTrigger from './PixelTabsTrigger.vue';

/** One tab of the `items` shorthand. */
export interface TabItem {
  id: string;
  label: string;
  icon?: PxlNode;
  content?: PxlNode;
}

/**
 * Tabbed panels with roving tabindex and arrow-key navigation. Pass `items`
 * for the shorthand, or compose `PixelTabsList` / `PixelTabsTrigger` /
 * `PixelTabsPanel` in the default slot. Bind the active tab with `v-model`.
 */
export interface PixelTabsProps {
  /** Shorthand; leave out to compose List / Trigger / Panel yourself. */
  items?: TabItem[];
  /** Active tab id (`v-model`); leave unset for uncontrolled tabs. */
  modelValue?: string;
  /** Initial active tab while uncontrolled. */
  defaultValue?: string;
  /** @deprecated Use `defaultValue`. */
  defaultTab?: string;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Accessible label of the tablist. */
  ariaLabel?: string;
  /** Layout direction of the tab list and of arrow-key navigation. */
  orientation?: TabsOrientation;
  /** Keep every panel in the DOM (hidden) instead of only the active one. */
  keepMounted?: boolean;
  /** Horizontal tab list scrolls with a fade mask (ignored when vertical). */
  scrollable?: boolean;
  /** `automatic` selects on focus; `manual` waits for Enter / Space. */
  activationMode?: TabsActivationMode;
}

const props = withDefaults(defineProps<PixelTabsProps>(), {
  items: undefined,
  modelValue: undefined,
  defaultValue: undefined,
  defaultTab: undefined,
  surface: undefined,
  ariaLabel: 'Tabs',
  orientation: 'horizontal',
  keepMounted: false,
  scrollable: false,
  activationMode: 'automatic',
});
const emit = defineEmits<{
  /** The newly active tab id. */
  'update:modelValue': [id: string];
}>();
defineSlots<{ default?(): VNode[] }>();

const surface = useEffectiveSurface(() => props.surface);
const sugar = computed(() => !!props.items && props.items.length > 0);
const [active, setActive] = useControllableState<string | undefined>({
  value: () => props.modelValue,
  defaultValue: () => props.defaultValue ?? props.defaultTab ?? props.items?.[0]?.id,
  onChange: (next) => {
    if (next !== undefined) emit('update:modelValue', next);
  },
});

const baseId = useId();
const triggers = new Map<string, HTMLButtonElement>();
const order = ref<string[]>([]);
const orderOf = () => (sugar.value ? props.items!.map((item) => item.id) : order.value);

provide(PIXEL_TABS, {
  baseId,
  active,
  select: (id) => setActive(id),
  registerTrigger(id, element) {
    triggers.set(id, element);
    if (!order.value.includes(id)) order.value.push(id);
    // Compositional tabs without a default: activate the first trigger so a
    // panel renders and the tablist is keyboard-reachable.
    if (!sugar.value && props.modelValue === undefined && active.value === undefined && order.value[0] === id) {
      setActive(id);
    }
  },
  unregisterTrigger(id) {
    triggers.delete(id);
    order.value = order.value.filter((x) => x !== id);
  },
  focusByOffset(currentId, offset) {
    const ids = orderOf();
    if (!ids.length) return;
    const from = Math.max(0, ids.indexOf(currentId));
    triggers.get(ids[(((from + offset) % ids.length) + ids.length) % ids.length]!)?.focus();
  },
  focusEdge(edge) {
    const ids = orderOf();
    if (!ids.length) return;
    triggers.get(edge === 'first' ? ids[0]! : ids[ids.length - 1]!)?.focus();
  },
  orientation: computed(() => props.orientation),
  activationMode: computed(() => props.activationMode),
  keepMounted: computed(() => props.keepMounted),
  surface,
});
</script>

<template>
  <div :class="cn(orientation === 'horizontal' ? 'space-y-3' : 'flex gap-3')" :data-orientation="orientation">
    <template v-if="sugar">
      <PixelTabsList :aria-label="ariaLabel" :scrollable="scrollable">
        <PixelTabsTrigger v-for="item in items" :key="item.id" :value="item.id">
          <template v-if="item.icon !== undefined" #icon><RenderNode :node="item.icon" /></template>
          {{ item.label }}
        </PixelTabsTrigger>
      </PixelTabsList>
      <div :class="cn(orientation === 'vertical' && 'flex-1 min-w-0')">
        <PixelTabsPanel v-for="item in items" :key="item.id" :value="item.id">
          <RenderNode :node="item.content" />
        </PixelTabsPanel>
      </div>
    </template>
    <slot v-else />
  </div>
</template>
