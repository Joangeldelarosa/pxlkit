<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, useAttrs, useId, watch, type StyleValue, type VNode } from 'vue';
import { POPOVER_Z_INDEX, popoverContentClasses, type Surface } from '@pxlkit/ui-kit-core';
import { refElement, usePopoverContext, type RefTarget } from './_internal/popover-context.js';

/**
 * The floating panel of a `PixelPopover`, teleported to `<body>` while open
 * and anchored to the trigger, which points at it with `aria-controls` (the
 * panel keeps an `id` it is given, or gets a generated one). Every attribute
 * and listener goes to the panel; pair it with `aria-labelledby` for its
 * accessible name.
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

const generatedId = useId();
const id = computed(() => (attrs.id as string | undefined) ?? generatedId);

const element = shallowRef<HTMLElement | null>(null);
function setElement(target: RefTarget) {
  element.value = refElement(target);
  context.setContent(target);
  // The trigger controls the panel while it is on the page.
  context.setContentId(element.value ? id.value : null);
}
watch(id, (next) => {
  if (element.value) context.setContentId(next);
});

const classes = computed(() => popoverContentClasses(props.surface ?? context.surface.value));
const role = computed(() => (context.role.value === 'none' ? undefined : context.role.value));
// The consumer's style comes last, so it can override the positioning.
const style = computed<StyleValue>(() => [context.floatingStyles.value, { zIndex: POPOVER_Z_INDEX }, attrs.style as StyleValue]);
const rest = computed(() => {
  const { class: _class, style: _style, id: _id, ...others } = attrs;
  return others;
});

defineExpose({
  /** The panel element while the popover is open. */
  element,
});
</script>

<template>
  <Teleport v-if="context.open.value && mounted" to="body">
    <div :ref="setElement" :id="id" :role="role" :class="[classes, attrs.class]" :style="style" v-bind="rest">
      <slot />
    </div>
  </Teleport>
</template>
