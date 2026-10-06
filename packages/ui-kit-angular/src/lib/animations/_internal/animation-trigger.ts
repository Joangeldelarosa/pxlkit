import { ElementRef, PLATFORM_ID, afterRenderEffect, computed, inject, signal, type Signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
} from '@pxlkit/ui-kit-core';
import { injectReducedMotion } from '../../utilities/media-query';

export interface AnimationTriggerRef {
  /** Whether the animation plays (never while the user prefers reduced motion). */
  readonly active: Signal<boolean>;
  /** Whether the user prefers reduced motion. */
  readonly reducedMotion: Signal<boolean>;
  /** `animationend` handler: the element's own animation ends the run, a child's does not. */
  ended(event: Event): void;
  /** Ends a run that script plays (the typewriter's). */
  end(): void;
}

/**
 * When an animation plays — the counterpart of the React kit's
 * `useAnimationTrigger`, on the rules of `@pxlkit/ui-kit-core`. Follows the
 * trigger mode on the host: in the browser, once rendered, it listens to the
 * pointer, focus or clicks the mode follows, or watches whether the host is
 * in view. `onComplete` runs at the end of every run. Call in an injection
 * context.
 */
export function injectAnimationTrigger(trigger: () => AnimationTrigger, onComplete: () => void): AnimationTriggerRef {
  const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  const reducedMotion = injectReducedMotion();
  const state = signal(ANIMATION_TRIGGER_IDLE);
  const active = computed(() => isAnimationActive(trigger(), state(), { reducedMotion: reducedMotion() }));

  if (isPlatformBrowser(inject(PLATFORM_ID))) {
    afterRenderEffect((onCleanup) => {
      const mode = trigger();
      const stops = animationTriggerEvents(mode).map((event) => {
        const listener = () => {
          if (restartsAnimation(mode, state(), event)) restartAnimations(host);
          state.update((current) => nextAnimationTriggerState(mode, current, event));
        };
        host.addEventListener(event, listener);
        return () => host.removeEventListener(event, listener);
      });
      if (mode === 'inView') {
        stops.push(observeInView(host, (inView) => state.update((current) => ({ ...current, inView }))));
      }
      onCleanup(() => {
        for (const stop of stops) stop();
      });
    });
  }

  const end = () => {
    state.update((current) => endAnimationRun(trigger(), current));
    onComplete();
  };

  return {
    active,
    reducedMotion,
    ended: (event) => {
      if (event.target === event.currentTarget) end();
    },
    end,
  };
}
