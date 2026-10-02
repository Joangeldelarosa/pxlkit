'use client';

import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { TYPEWRITER_CARET, typeText, typewriterClasses } from '@pxlkit/ui-kit-core';
import { cn, Tone } from '../common';
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
  const classes = typewriterClasses(tone);

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
    setDisplayed('');
    setDone(false);
    if (!active) return;
    return typeText(resolvedText, { speed, delay }, setDisplayed, () => {
      setDone(true);
      endAnimation();
    });
  }, [active, reducedMotion, resolvedText, speed, delay, endAnimation]);

  return (
    <span
      ref={mergeRefs(ref as unknown as React.Ref<HTMLSpanElement>, forwardedRef)}
      {...(handlers as React.DOMAttributes<HTMLSpanElement>)}
      className={cn(classes.root, className)}
    >
      {/* Screen readers get the complete string from the first render; the
          character-by-character churn below is purely visual (announcing
          each partial slice would be noise, not typing). */}
      <span className="sr-only">{resolvedText}</span>
      <span aria-hidden="true">
        {displayed}
        {cursor && !done && active && <span className={classes.caret}>{TYPEWRITER_CARET}</span>}
      </span>
    </span>
  );
});

PixelTypewriter.displayName = 'PixelTypewriter';
