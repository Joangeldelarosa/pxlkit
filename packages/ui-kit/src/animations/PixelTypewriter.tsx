'use client';

import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { cn, Tone, toneMap } from '../common';
import type { AnimationTrigger } from './types';
import { mergeRefs, useAnimationTrigger } from './_internal/animation-hooks';

/* ─────────────────────────────────────────────────────────────────────────
   PixelTypewriter — types out a string one character at a time with a
   blinking caret while writing.
   ───────────────────────────────────────────────────────────────────────── */

export interface PixelTypewriterProps {
  /** Label (text) to type out. Canonical prop. */
  label?: string;
  /**
   * @deprecated Use `label` instead. Retained as alias for one minor.
   */
  text?: string;
  /** Milliseconds between each character. Default `60`. */
  speed?: number;
  /** Delay before typing starts, in milliseconds. Default `0`. */
  delay?: number;
  /** Show a blinking caret while writing. Default `true`. */
  cursor?: boolean;
  /** Tone token applied to the text color. Default `'green'`. */
  tone?: Tone;
  /** When the animation should play. Default `'mount'`. */
  trigger?: AnimationTrigger;
  /** Fires once the full string is rendered. */
  onComplete?: () => void;
  /** Extra class names applied to the wrapping `<span>`. */
  className?: string;
}

export const PixelTypewriter = forwardRef<HTMLSpanElement, PixelTypewriterProps>(function PixelTypewriter(
  {
    label,
    text,
    speed = 60,
    delay = 0,
    cursor = true,
    tone = 'green',
    trigger = 'mount',
    onComplete,
    className,
  },
  forwardedRef,
) {
  const resolvedText = label ?? text ?? '';
  const { ref, active, reducedMotion, handlers, endAnimation } = useAnimationTrigger(trigger, onComplete);
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const reducedCompleteRef = useRef(false);

  useEffect(() => {
    if (reducedMotion) {
      /* Reduced motion: skip the typing animation — show the full text
         immediately, regardless of trigger mode. `onComplete` still fires
         (once) because its contract is "full string rendered", which is
         satisfied instantly. */
      setDisplayed(resolvedText);
      setDone(true);
      if (!reducedCompleteRef.current) {
        reducedCompleteRef.current = true;
        endAnimation();
      }
      return;
    }
    if (!active) {
      setDisplayed('');
      setDone(false);
      return;
    }
    setDisplayed('');
    setDone(false);
    let i = 0;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        i++;
        setDisplayed(resolvedText.slice(0, i));
        if (i >= resolvedText.length) {
          clearInterval(intervalId);
          setDone(true);
          endAnimation();
        }
      }, speed);
    }, delay);
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [active, reducedMotion, resolvedText, speed, delay, endAnimation]);

  return (
    <span
      ref={mergeRefs(ref as unknown as React.Ref<HTMLSpanElement>, forwardedRef)}
      {...(handlers as React.DOMAttributes<HTMLSpanElement>)}
      className={cn('font-mono', toneMap[tone].text, className)}
    >
      {displayed}
      {cursor && !done && active && <span className="animate-pulse">▌</span>}
    </span>
  );
});

PixelTypewriter.displayName = 'PixelTypewriter';
