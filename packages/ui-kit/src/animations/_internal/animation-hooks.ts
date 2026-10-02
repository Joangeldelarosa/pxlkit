'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ANIMATION_TRIGGER_IDLE,
  animationTriggerEvents,
  endAnimationRun,
  isAnimationActive,
  nextAnimationTriggerState,
  observeInView,
  restartAnimations,
  restartsAnimation,
  type AnimationTriggerEvent,
} from '@pxlkit/ui-kit-core';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { AnimationTrigger } from '../types';

/** Compose multiple refs (object or callback) into a single ref callback. */
export function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined | null>): React.RefCallback<T> {
  return (node) => {
    refs.forEach((r) => {
      if (!r) return;
      if (typeof r === 'function') r(node);
      else (r as React.MutableRefObject<T | null>).current = node;
    });
  };
}

/** The React handler of each DOM event a trigger mode follows (`onFocus` / `onBlur` bubble like `focusin` / `focusout`). */
const HANDLER_PROPS: Record<AnimationTriggerEvent, 'onMouseEnter' | 'onMouseLeave' | 'onFocus' | 'onBlur' | 'onClick'> = {
  mouseenter: 'onMouseEnter',
  mouseleave: 'onMouseLeave',
  focusin: 'onFocus',
  focusout: 'onBlur',
  click: 'onClick',
};

/**
 * Shared hook that determines *when* an animation is active based on the
 * chosen trigger mode.  Returns a `ref` to attach to the outermost element,
 * an `active` boolean to conditionally apply the CSS animation, event
 * `handlers` to spread on the same element, a `handleAnimEnd` callback
 * for the animated element's `onAnimationEnd`, and the `reducedMotion`
 * flag the override below is derived from.
 *
 * Reduced motion: when the user has `prefers-reduced-motion: reduce`
 * active, `active` is forced to `false` regardless of the trigger mode, so
 * every animation component renders its children statically in their final,
 * fully visible state (no animation styles applied). Because no CSS
 * animation ever runs, `onComplete` does not fire for CSS-driven
 * animations under reduced motion — there is no animation to complete.
 * JS-driven components (PixelTypewriter) consume the returned
 * `reducedMotion` flag to render their end state immediately instead.
 * The rules themselves live in `@pxlkit/ui-kit-core`, shared with the Vue
 * and Angular kits.
 */
export function useAnimationTrigger(trigger: AnimationTrigger = 'mount', onComplete?: () => void) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null!);
  const [state, setState] = useState(ANIMATION_TRIGGER_IDLE);
  const renderedRef = useRef(state);
  // Called at the end of a run, the latest callback: a new function on every
  // render of the parent changes nothing, and restarts no typing.
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    renderedRef.current = state;
  }, [state]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    if (trigger !== 'inView') return;
    const el = ref.current;
    if (!el) return;
    return observeInView(el, (inView) => setState((current) => ({ ...current, inView })));
  }, [trigger]);

  const active = isAnimationActive(trigger, state, { reducedMotion });

  /* endAnimation — call to signal the animation finished (programmatic use) */
  const endAnimation = useCallback(() => {
    setState((current) => endAnimationRun(trigger, current));
    onCompleteRef.current?.();
  }, [trigger]);

  /* handleAnimEnd — attach to the animated element's onAnimationEnd */
  const handleAnimEnd = useCallback(
    (e: React.AnimationEvent) => {
      if (e.target !== e.currentTarget) return;
      endAnimation();
    },
    [endAnimation],
  );

  const handlers: React.DOMAttributes<HTMLElement> = {};
  for (const event of animationTriggerEvents(trigger)) {
    handlers[HANDLER_PROPS[event]] = () => {
      // A click during a run starts the animation over, where it is playing.
      if (restartsAnimation(trigger, renderedRef.current, event)) restartAnimations(ref.current);
      setState((current) => nextAnimationTriggerState(trigger, current, event));
    };
  }

  return { ref, active, reducedMotion, handlers, handleAnimEnd, endAnimation };
}
