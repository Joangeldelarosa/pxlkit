import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Tone, Size, Option, TabItem, AccordionItem, cn, useClickOutside,
  toneMap, sizeClass, focusRing, inputBase,
  ChevronDownIcon, CheckIcon, CloseIcon, FieldShell
} from './common';



const PXL_KEYFRAMES = `
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

type AnimationRepeat = number | 'infinite';

function repeatToCss(repeat: AnimationRepeat = 1): string {
  return typeof repeat === 'number' ? String(repeat) : repeat;
}

function usePixelAnimations() {
  useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById('pxl-anims')) return;
    const s = document.createElement('style');
    s.id = 'pxl-anims';
    s.textContent = PXL_KEYFRAMES;
    document.head.appendChild(s);
  }, []);
}

/* ── Animation trigger system ─────────────────────────────────────────────── */

export type AnimationTrigger = 'mount' | 'hover' | 'click' | 'focus' | 'inView' | boolean;

/**
 * Shared hook that determines *when* an animation is active based on the
 * chosen trigger mode.  Returns a `ref` to attach to the outermost element,
 * an `active` boolean to conditionally apply the CSS animation, event
 * `handlers` to spread on the same element, and a `handleAnimEnd` callback
 * for the animated element's `onAnimationEnd`.
 */
function useAnimationTrigger(trigger: AnimationTrigger = 'mount', onComplete?: () => void) {
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

  const active =
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

  return { ref, active, handlers, handleAnimEnd, endAnimation };
}

export function PixelFadeIn({
  children,
  duration = 400,
  delay = 0,
  repeat = 1,
  easing = 'ease',
  fillMode = 'both',
  trigger = 'mount',
  onComplete,
  className,
}: {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  repeat?: AnimationRepeat;
  easing?: string;
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  trigger?: AnimationTrigger;
  onComplete?: () => void;
  className?: string;
}) {
  usePixelAnimations();
  const { ref, active, handlers, handleAnimEnd } = useAnimationTrigger(trigger, onComplete);
  return (
    <div
      ref={ref}
      className={className}
      style={active ? { animation: `pxl-fade-in ${duration}ms ${easing} ${delay}ms ${repeatToCss(repeat)} ${fillMode}` } : undefined}
      {...handlers}
      onAnimationEnd={handleAnimEnd}
    >
      {children}
    </div>
  );
}

export function PixelSlideIn({
  children,
  from = 'down',
  duration = 350,
  delay = 0,
  distance = 10,
  repeat = 1,
  easing = 'ease',
  fillMode = 'both',
  trigger = 'mount',
  onComplete,
  className,
}: {
  children: React.ReactNode;
  from?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  delay?: number;
  distance?: number;
  repeat?: AnimationRepeat;
  easing?: string;
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  trigger?: AnimationTrigger;
  onComplete?: () => void;
  className?: string;
}) {
  usePixelAnimations();
  const { ref, active, handlers, handleAnimEnd } = useAnimationTrigger(trigger, onComplete);
  return (
    <div
      ref={ref}
      className={className}
      style={
        active
          ? {
              animation: `pxl-slide-${from} ${duration}ms ${easing} ${delay}ms ${repeatToCss(repeat)} ${fillMode}`,
              ['--pxl-slide-distance' as string]: `${distance}px`,
            }
          : undefined
      }
      {...handlers}
      onAnimationEnd={handleAnimEnd}
    >
      {children}
    </div>
  );
}

export function PixelPulse({
  children,
  duration = 2000,
  repeat = 'infinite',
  easing = 'ease-in-out',
  trigger = 'mount',
  onComplete,
  className,
}: {
  children: React.ReactNode;
  duration?: number;
  repeat?: AnimationRepeat;
  easing?: string;
  trigger?: AnimationTrigger;
  onComplete?: () => void;
  className?: string;
}) {
  usePixelAnimations();
  const { ref, active, handlers, handleAnimEnd } = useAnimationTrigger(trigger, onComplete);
  return (
    <div
      ref={ref}
      className={className}
      style={active ? { animation: `pxl-pulse ${duration}ms ${easing} 0ms ${repeatToCss(repeat)} both` } : undefined}
      {...handlers}
      onAnimationEnd={handleAnimEnd}
    >
      {children}
    </div>
  );
}

export function PixelBounce({
  children,
  duration = 800,
  repeat = 'infinite',
  height = 8,
  easing = 'ease',
  trigger = 'mount',
  onComplete,
  className,
}: {
  children: React.ReactNode;
  duration?: number;
  repeat?: number | 'infinite';
  height?: number;
  easing?: string;
  trigger?: AnimationTrigger;
  onComplete?: () => void;
  className?: string;
}) {
  usePixelAnimations();
  const { ref, active, handlers, handleAnimEnd } = useAnimationTrigger(trigger, onComplete);
  return (
    <div
      ref={ref}
      className={cn('inline-block', className)}
      style={
        active
          ? {
              animation: `pxl-bounce ${duration}ms ${easing} 0ms ${repeatToCss(repeat)} both`,
              ['--pxl-bounce-height' as string]: `${height}px`,
            }
          : undefined
      }
      {...handlers}
      onAnimationEnd={handleAnimEnd}
    >
      {children}
    </div>
  );
}

export function PixelTypewriter({
  text,
  speed = 60,
  delay = 0,
  cursor = true,
  tone = 'green',
  trigger = 'mount',
  onComplete,
  className,
}: {
  text: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
  tone?: Tone;
  trigger?: AnimationTrigger;
  onComplete?: () => void;
  className?: string;
}) {
  const { ref, active, handlers, endAnimation } = useAnimationTrigger(trigger, onComplete);
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) { setDisplayed(''); setDone(false); return; }
    setDisplayed('');
    setDone(false);
    let i = 0;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
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
  }, [active, text, speed, delay, endAnimation]);

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} {...(handlers as React.DOMAttributes<HTMLSpanElement>)} className={cn('font-mono', toneMap[tone].text, className)}>
      {displayed}
      {cursor && !done && active && <span className="animate-pulse">▌</span>}
    </span>
  );
}

export function PixelGlitch({
  children,
  duration = 3000,
  intensity = 4,
  trigger = 'mount',
  onComplete,
  className,
}: {
  children: React.ReactNode;
  duration?: number;
  intensity?: number;
  trigger?: AnimationTrigger;
  onComplete?: () => void;
  className?: string;
}) {
  usePixelAnimations();
  const { ref, active, handlers, handleAnimEnd } = useAnimationTrigger(trigger, onComplete);
  const cssVars = { ['--pxl-glitch-x' as string]: `${intensity}px` };
  return (
    <div ref={ref} {...handlers} className={cn('relative inline-block overflow-visible', className)}>
      {/* Ghost layer R — shifts left, fires on different clip zones */}
      {active && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            animation: `pxl-glitch-r ${duration}ms steps(1) infinite`,
            ...cssVars,
            filter: 'saturate(0) sepia(1) hue-rotate(-20deg) brightness(1.3)',
            overflow: 'hidden',
          }}
        >
          {children}
        </div>
      )}
      {/* Ghost layer C — shifts right, fires on offset clip zones */}
      {active && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            animation: `pxl-glitch-c ${duration}ms steps(1) infinite`,
            ...cssVars,
            filter: 'saturate(0) sepia(1) hue-rotate(150deg) brightness(1.1)',
            overflow: 'hidden',
          }}
        >
          {children}
        </div>
      )}
      {/* Main layer */}
      <div
        style={active ? { animation: `pxl-glitch ${duration}ms steps(1) infinite`, ...cssVars } : undefined}
        onAnimationEnd={handleAnimEnd}
      >
        {children}
      </div>
    </div>
  );
}

export function PixelFloat({
  children,
  duration = 2200,
  distance = 6,
  repeat = 'infinite',
  easing = 'ease-in-out',
  trigger = 'mount',
  onComplete,
  className,
}: {
  children: React.ReactNode;
  duration?: number;
  distance?: number;
  repeat?: AnimationRepeat;
  easing?: string;
  trigger?: AnimationTrigger;
  onComplete?: () => void;
  className?: string;
}) {
  usePixelAnimations();
  const { ref, active, handlers, handleAnimEnd } = useAnimationTrigger(trigger, onComplete);
  return (
    <div
      ref={ref}
      className={cn('inline-block', className)}
      style={
        active
          ? {
              animation: `pxl-float ${duration}ms ${easing} 0ms ${repeatToCss(repeat)} both`,
              ['--pxl-float-distance' as string]: `${distance}px`,
            }
          : undefined
      }
      {...handlers}
      onAnimationEnd={handleAnimEnd}
    >
      {children}
    </div>
  );
}

export function PixelShake({
  children,
  duration = 450,
  distance = 2,
  repeat = 1,
  easing = 'linear',
  trigger = 'mount',
  onComplete,
  className,
}: {
  children: React.ReactNode;
  duration?: number;
  distance?: number;
  repeat?: AnimationRepeat;
  easing?: string;
  trigger?: AnimationTrigger;
  onComplete?: () => void;
  className?: string;
}) {
  usePixelAnimations();
  const { ref, active, handlers, handleAnimEnd } = useAnimationTrigger(trigger, onComplete);
  return (
    <div
      ref={ref}
      className={cn('inline-block', className)}
      style={
        active
          ? {
              animation: `pxl-shake ${duration}ms ${easing} 0ms ${repeatToCss(repeat)} both`,
              ['--pxl-shake-distance' as string]: `${distance}px`,
            }
          : undefined
      }
      {...handlers}
      onAnimationEnd={handleAnimEnd}
    >
      {children}
    </div>
  );
}

export function PixelRotate({
  children,
  duration = 1800,
  repeat = 'infinite',
  direction = 'normal',
  easing = 'linear',
  trigger = 'mount',
  onComplete,
  className,
}: {
  children: React.ReactNode;
  duration?: number;
  repeat?: AnimationRepeat;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  easing?: string;
  trigger?: AnimationTrigger;
  onComplete?: () => void;
  className?: string;
}) {
  usePixelAnimations();
  const { ref, active, handlers, handleAnimEnd } = useAnimationTrigger(trigger, onComplete);
  return (
    <div
      ref={ref}
      className={cn('inline-block', className)}
      style={
        active
          ? {
              animation: `pxl-rotate ${duration}ms ${easing} 0ms ${repeatToCss(repeat)} both`,
              animationDirection: direction,
            }
          : undefined
      }
      {...handlers}
      onAnimationEnd={handleAnimEnd}
    >
      {children}
    </div>
  );
}

export function PixelZoomIn({
  children,
  duration = 320,
  delay = 0,
  startScale = 0.92,
  repeat = 1,
  easing = 'cubic-bezier(.2,.9,.2,1)',
  fillMode = 'both',
  trigger = 'mount',
  onComplete,
  className,
}: {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  startScale?: number;
  repeat?: AnimationRepeat;
  easing?: string;
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  trigger?: AnimationTrigger;
  onComplete?: () => void;
  className?: string;
}) {
  usePixelAnimations();
  const { ref, active, handlers, handleAnimEnd } = useAnimationTrigger(trigger, onComplete);
  return (
    <div
      ref={ref}
      className={className}
      style={
        active
          ? {
              animation: `pxl-zoom-in ${duration}ms ${easing} ${delay}ms ${repeatToCss(repeat)} ${fillMode}`,
              ['--pxl-zoom-start' as string]: String(startScale),
            }
          : undefined
      }
      {...handlers}
      onAnimationEnd={handleAnimEnd}
    >
      {children}
    </div>
  );
}

export function PixelFlicker({
  children,
  duration = 2200,
  repeat = 'infinite',
  trigger = 'mount',
  onComplete,
  className,
}: {
  children: React.ReactNode;
  duration?: number;
  repeat?: AnimationRepeat;
  trigger?: AnimationTrigger;
  onComplete?: () => void;
  className?: string;
}) {
  usePixelAnimations();
  const { ref, active, handlers, handleAnimEnd } = useAnimationTrigger(trigger, onComplete);
  return (
    <div
      ref={ref}
      className={className}
      style={active ? { animation: `pxl-flicker ${duration}ms steps(1) 0ms ${repeatToCss(repeat)} both` } : undefined}
      {...handlers}
      onAnimationEnd={handleAnimEnd}
    >
      {children}
    </div>
  );
}

