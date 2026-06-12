'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { AnimationRepeat, AnimationTrigger } from '../types';

/* ─────────────────────────────────────────────────────────────────────────
   PXL_KEYFRAMES — single keyframe stylesheet shared by every animation
   component in this category. Injected once into `document.head` on mount.
   ───────────────────────────────────────────────────────────────────────── */
export const PXL_KEYFRAMES = `
@keyframes pxl-fade-in{from{opacity:0}to{opacity:1}}
@keyframes pxl-slide-down{from{opacity:0;transform:translateY(calc(var(--pxl-slide-distance,10px)*-1))}to{opacity:1;transform:translateY(0)}}
@keyframes pxl-slide-up{from{opacity:0;transform:translateY(var(--pxl-slide-distance,10px))}to{opacity:1;transform:translateY(0)}}
@keyframes pxl-slide-left{from{opacity:0;transform:translateX(var(--pxl-slide-distance,10px))}to{opacity:1;transform:translateX(0)}}
@keyframes pxl-slide-right{from{opacity:0;transform:translateX(calc(var(--pxl-slide-distance,10px)*-1))}to{opacity:1;transform:translateX(0)}}
@keyframes pxl-bounce{0%,100%{transform:translateY(0)}35%{transform:translateY(calc(var(--pxl-bounce-height,8px)*-1))}60%{transform:translateY(calc(var(--pxl-bounce-height,8px)*-0.5))}80%{transform:translateY(calc(var(--pxl-bounce-height,8px)*-0.25))}}
@keyframes pxl-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.97)}}
@keyframes pxl-glitch{0%,75%,100%{clip-path:none;transform:translate(0);filter:none}9%,10%{clip-path:polygon(0 16%,100% 16%,100% 34%,0 34%);transform:translate(calc(var(--pxl-glitch-x,4px)*-1),0)}14%,15%{clip-path:none;transform:translate(0);filter:brightness(1.6) saturate(6) hue-rotate(90deg)}16%{filter:none}21%,22%{clip-path:polygon(0 56%,100% 56%,100% 72%,0 72%);transform:translate(var(--pxl-glitch-x,4px),0)}28%{clip-path:none;transform:translate(0)}42%,43%{clip-path:polygon(0 2%,100% 2%,100% 18%,0 18%);transform:translate(calc(var(--pxl-glitch-x,4px)*1.5),0)}48%,49%{clip-path:polygon(0 80%,100% 80%,100% 96%,0 96%);transform:translate(calc(var(--pxl-glitch-x,4px)*-0.8),0)}54%{clip-path:none;transform:translate(0)}}
@keyframes pxl-glitch-r{0%,75%,100%{clip-path:none;transform:translate(0);opacity:0}9%{opacity:.65;clip-path:polygon(0 10%,100% 10%,100% 30%,0 30%);transform:translate(calc(var(--pxl-glitch-x,4px)*-1.8),0)}12%{clip-path:none;opacity:0}21%{opacity:.6;clip-path:polygon(0 50%,100% 50%,100% 68%,0 68%);transform:translate(calc(var(--pxl-glitch-x,4px)*1.4),0)}26%{clip-path:none;opacity:0}42%{opacity:.7;clip-path:polygon(0 0,100% 0,100% 14%,0 14%);transform:translate(calc(var(--pxl-glitch-x,4px)*-2),0)}46%{clip-path:none;opacity:0}}
@keyframes pxl-glitch-c{0%,75%,100%{clip-path:none;transform:translate(0);opacity:0}10%{opacity:.55;clip-path:polygon(0 22%,100% 22%,100% 42%,0 42%);transform:translate(var(--pxl-glitch-x,4px),0)}14%{clip-path:none;opacity:0}23%{opacity:.5;clip-path:polygon(0 64%,100% 64%,100% 80%,0 80%);transform:translate(calc(var(--pxl-glitch-x,4px)*-1.2),0)}29%{clip-path:none;opacity:0}44%{opacity:.6;clip-path:polygon(0 6%,100% 6%,100% 20%,0 20%);transform:translate(calc(var(--pxl-glitch-x,4px)*1.6),0)}51%{clip-path:none;opacity:0}}
@keyframes pxl-float{0%,100%{transform:translateY(0)}50%{transform:translateY(calc(var(--pxl-float-distance,6px)*-1))}}
@keyframes pxl-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(calc(var(--pxl-shake-distance,2px)*-1))}40%{transform:translateX(var(--pxl-shake-distance,2px))}60%{transform:translateX(calc(var(--pxl-shake-distance,2px)*-1))}80%{transform:translateX(var(--pxl-shake-distance,2px))}}
@keyframes pxl-rotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes pxl-zoom-in{from{opacity:0;transform:scale(var(--pxl-zoom-start,.92))}to{opacity:1;transform:scale(1)}}
@keyframes pxl-flicker{0%,100%{opacity:1}8%{opacity:.85}16%{opacity:1}32%{opacity:.65}40%{opacity:1}58%{opacity:.8}66%{opacity:1}82%{opacity:.55}90%{opacity:1}}
`;

/** Coerce an `AnimationRepeat` value to a valid CSS `animation-iteration-count`. */
export function repeatToCss(repeat: AnimationRepeat = 1): string {
  return typeof repeat === 'number' ? String(repeat) : repeat;
}

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

/**
 * Injects the shared keyframes stylesheet into the document head exactly once.
 * Safe to call from every animation component on mount.
 */
export function usePixelAnimations() {
  useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById('pxl-anims')) return;
    const s = document.createElement('style');
    s.id = 'pxl-anims';
    s.textContent = PXL_KEYFRAMES;
    document.head.appendChild(s);
  }, []);
}

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
 * This is implemented once here rather than in each of the 11 components.
 */
export function useAnimationTrigger(trigger: AnimationTrigger = 'mount', onComplete?: () => void) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null!);
  const [hov, setHov] = useState(false);
  const [foc, setFoc] = useState(false);
  const [iv, setIV] = useState(false);
  const [clicking, setClicking] = useState(false);
  const wasClickRef = useRef(false);

  useEffect(() => {
    wasClickRef.current = clicking;
  }, [clicking]);

  // IntersectionObserver for inView trigger
  useEffect(() => {
    if (trigger !== 'inView') return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setIV(e.isIntersecting), { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [trigger]);

  const triggerActive =
    typeof trigger === 'boolean'
      ? trigger
      : trigger === 'mount'
        ? true
        : trigger === 'hover'
          ? hov
          : trigger === 'click'
            ? clicking
            : trigger === 'focus'
              ? foc
              : trigger === 'inView'
                ? iv
                : true;

  /* prefers-reduced-motion wins over every trigger mode (incl. controlled). */
  const active = reducedMotion ? false : triggerActive;

  /* endAnimation — call to signal the animation finished (programmatic use) */
  const endAnimation = useCallback(() => {
    if (trigger === 'click') setClicking(false);
    onComplete?.();
  }, [trigger, onComplete]);

  /* handleAnimEnd — attach to the animated element's onAnimationEnd */
  const handleAnimEnd = useCallback(
    (e: React.AnimationEvent) => {
      if (e.target !== e.currentTarget) return;
      endAnimation();
    },
    [endAnimation],
  );

  const handlers: React.DOMAttributes<HTMLElement> = {};

  if (trigger === 'hover') {
    handlers.onMouseEnter = () => setHov(true);
    handlers.onMouseLeave = () => setHov(false);
  } else if (trigger === 'click') {
    handlers.onClick = () => {
      /* If already playing, restart via Web Animations API */
      if (wasClickRef.current) {
        ref.current?.getAnimations({ subtree: true }).forEach((a) => {
          a.cancel();
          a.play();
        });
      }
      setClicking(true);
    };
  } else if (trigger === 'focus') {
    handlers.onFocus = () => setFoc(true);
    handlers.onBlur = () => setFoc(false);
  }

  return { ref, active, reducedMotion, handlers, handleAnimEnd, endAnimation };
}
