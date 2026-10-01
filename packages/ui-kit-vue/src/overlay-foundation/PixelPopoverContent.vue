<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, useAttrs, type StyleValue, type VNode } from 'vue';
import { POPOVER_Z_INDEX, popoverContentClasses, type Surface } from '@pxlkit/ui-kit-core';
import { refElement, usePopoverContext, type RefTarget } from './_internal/popover-context.js';

/**
 * The floating panel of a `PixelPopover`, teleported to `<body>` while open
 * and anchored to the trigger. Every attribute and listener goes to the
 * panel; pair it with `aria-labelledby` for its accessible name.
 */
defineOptions({ inheritAttrs: false });
const props = defineProps<{
  /** Surface override; defaults to the popover's. */
  surface?: Surface;
}>();
defineSlots<{ default?(): VNode[] }>();

const context = usePopoverContext('PixelPopoverContent');
const attrs = useAttrs();
// Rendered only after mounting: nothing is teleported during server rendering
// or hydration.
const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});

const element = shallowRef<HTMLElement | null>(null);
function setElement(target: RefTarget) {
  element.value = refElement(target);
  context.setContent(target);
}

const classes = computed(() => popoverContentClasses(props.surface ?? context.surface.value));
const role = computed(() => (context.role.value === 'none' ? undefined : context.role.value));
// The consumer's style comes last, so it can override the positioning.
const style = computed<StyleValue>(() => [context.floatingStyles.value, { zIndex: POPOVER_Z_INDEX }, attrs.style as StyleValue]);
const rest = computed(() => {
  const { class: _class, style: _style, ...others } = attrs;
  return others;
});

defineExpose({
  /** The panel element while the popover is open. */
  element,
});
</script>

<template>
  <Teleport v-if="context.open.value && mounted" to="body">
    <div :ref="setElement" :role="role" :class="[classes, attrs.class]" :style="style" v-bind="rest">
      <slot />
    </div>
  </Teleport>
</template>
