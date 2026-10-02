<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue';
import { TYPEWRITER_CARET, typeText, typewriterClasses, type AnimationTrigger, type Tone } from '@pxlkit/ui-kit-core';
import { useAnimationTrigger } from './_internal/animation-trigger.js';

/**
 * Types a text out one character at a time, with a blinking caret while it
 * writes. Assistive technology reads the whole text from the first render
 * (a visually hidden copy); the typing itself is hidden from it. When the
 * user prefers reduced motion the text shows at once. Attributes fall
 * through to the wrapping `<span>`.
 *
 * @example
 * <PixelTypewriter label="Types when scrolled into view." trigger="inView" tone="purple" @complete="next" />
 */
export interface PixelTypewriterProps {
  /** Label (text) to type out. Canonical prop. */
  label?: string;
  /** @deprecated Use `label` instead. Retained as alias for one minor. */
  text?: string;
  /** Milliseconds between each character. */
  speed?: number;
  /** Delay before typing starts, in milliseconds. */
  delay?: number;
  /** Show a blinking caret while writing. */
  cursor?: boolean;
  /** Tone token applied to the text color. */
  tone?: Tone;
  /**
   * When the typing plays: `'mount'`, `'hover'`, `'click'`, `'focus'`,
   * `'inView'`, or `true` / `false` to control it.
   */
  trigger?: AnimationTrigger;
}

const props = withDefaults(defineProps<PixelTypewriterProps>(), {
  label: undefined,
  text: undefined,
  speed: 60,
  delay: 0,
  cursor: true,
  tone: 'green',
  trigger: 'mount',
});
const emit = defineEmits<{
  /** Once the full string is rendered (at once under reduced motion, then only once). */
  complete: [];
}>();

const element = useTemplateRef<HTMLElement>('element');
const { active, reducedMotion, listeners, end } = useAnimationTrigger(
  element,
  () => props.trigger,
  () => emit('complete'),
);
const fullText = computed(() => props.label ?? props.text ?? '');
const classes = computed(() => typewriterClasses(props.tone));
const typed = ref('');
const done = ref(false);
// The caret shows while the text is being typed.
const typing = computed(() => props.cursor && !done.value && active.value);
let completedStill = false;

// Typing runs in the browser only, once mounted, and starts over whenever
// the text, its pace or the trigger changes.
onMounted(() => {
  watch(
    [active, reducedMotion, fullText, () => props.speed, () => props.delay, () => props.trigger],
    ([playing, still, text, speed, delay], _previous, onCleanup) => {
      if (still) {
        // Reduced motion shows the whole text at once: the full string is
        // there, so complete fires — once.
        typed.value = text;
        done.value = true;
        if (!completedStill) {
          completedStill = true;
          end();
        }
        return;
      }
      typed.value = '';
      done.value = false;
      if (!playing) return;
      onCleanup(
        typeText(
          text,
          { speed, delay },
          (next) => {
            typed.value = next;
          },
          () => {
            done.value = true;
            end();
          },
        ),
      );
    },
    { immediate: true },
  );
});
</script>

<template>
  <span ref="element" :class="classes.root" v-on="listeners">
    <span class="sr-only">{{ fullText }}</span>
    <span aria-hidden="true">{{ typed }}<span v-if="typing" :class="classes.caret">{{ TYPEWRITER_CARET }}</span></span>
  </span>
</template>
