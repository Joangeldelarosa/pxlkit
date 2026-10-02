import { computed, shallowRef, watch, type ComputedRef, type Ref, type ShallowRef } from 'vue';
import {
  ANIMATION_TRIGGER_IDLE,
  animationTriggerEvents,
  endAnimationRun,
  isAnimationActive,
  nextAnimationTriggerState,
  observeInView,
  restartAnimations,
  restartsAnimation,
  type AnimationTrigger,
  type AnimationTriggerEvent,
} from '@pxlkit/ui-kit-core';
import { useReducedMotion } from '../../composables/media-query.js';

export interface AnimationTriggerControls {
  /** Whether the animation plays (never while the user prefers reduced motion). */
  active: ComputedRef<boolean>;
  /** Whether the user prefers reduced motion. */
  reducedMotion: Readonly<Ref<boolean>>;
  /** Listeners of the trigger mode, for `v-on` on the animated element. */
  listeners: ComputedRef<Record<string, () => void>>;
  /** `animationend` listener: the element's own animation ends the run, a child's does not. */
  ended: (event: AnimationEvent) => void;
  /** Ends a run that script plays (the typewriter's). */
  end: () => void;
}

/**
 * When an animation plays — the counterpart of the React kit's
 * `useAnimationTrigger`, on the rules of `@pxlkit/ui-kit-core`. Follows the
 * trigger mode on `element`: the pointer, focus and clicks through
 * `listeners`, whether it is in view once it is on the page. `onComplete`
 * runs at the end of every run.
 */
export function useAnimationTrigger(
  element: Readonly<ShallowRef<HTMLElement | null>>,
  trigger: () => AnimationTrigger,
  onComplete: () => void,
): AnimationTriggerControls {
  const reducedMotion = useReducedMotion();
  const state = shallowRef(ANIMATION_TRIGGER_IDLE);
  const active = computed(() => isAnimationActive(trigger(), state.value, { reducedMotion: reducedMotion.value }));

  // The element exists in the browser only, once mounted.
  watch([trigger, element], ([mode, el], _previous, onCleanup) => {
    if (mode !== 'inView' || !el) return;
    onCleanup(
      observeInView(el, (inView) => {
        state.value = { ...state.value, inView };
      }),
    );
  });

  function handle(event: AnimationTriggerEvent) {
    if (restartsAnimation(trigger(), state.value, event)) restartAnimations(element.value);
    state.value = nextAnimationTriggerState(trigger(), state.value, event);
  }

  const listeners = computed(() =>
    Object.fromEntries(animationTriggerEvents(trigger()).map((event) => [event, () => handle(event)])),
  );

  function end() {
    state.value = endAnimationRun(trigger(), state.value);
    onComplete();
  }

  return {
    active,
    reducedMotion,
    listeners,
    ended: (event) => {
      if (event.target === event.currentTarget) end();
    },
    end,
  };
}
