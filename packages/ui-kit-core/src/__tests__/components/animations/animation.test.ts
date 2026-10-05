import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ANIMATION_TRIGGER_IDLE,
  animationInlineClasses,
  animationTriggerEvents,
  bounceStyle,
  endAnimationRun,
  fadeInStyle,
  flickerStyle,
  floatStyle,
  glitchStyles,
  isAnimationActive,
  nextAnimationTriggerState,
  observeInView,
  pulseStyle,
  repeatToCss,
  restartAnimations,
  restartsAnimation,
  rotateStyle,
  shakeStyle,
  slideInStyle,
  spinnerAnimation,
  zoomInStyle,
  type AnimationStyle,
  type AnimationTrigger,
  type AnimationTriggerState,
} from '../../../index';

const still = { reducedMotion: false };
const idle = ANIMATION_TRIGGER_IDLE;
const all: AnimationTriggerState = { hovered: true, focused: true, inView: true, clicked: true };
const theme = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../../../../styles.css'), 'utf8');

/** The inline styles the animation components set while they play (the glitch's three layers among them). */
function playingStyles(): AnimationStyle[] {
  const glitch = glitchStyles({ duration: 3000, intensity: 4 });
  return [
    bounceStyle({ duration: 800, repeat: 'infinite', height: 8, easing: 'ease' }),
    fadeInStyle({ duration: 400, delay: 0, repeat: 1, easing: 'ease', fillMode: 'both' }),
    flickerStyle({ duration: 2200, repeat: 'infinite' }),
    floatStyle({ duration: 2200, distance: 6, repeat: 'infinite', easing: 'ease-in-out' }),
    glitch.red,
    glitch.cyan,
    glitch.main,
    pulseStyle({ duration: 2000, repeat: 'infinite', easing: 'ease-in-out' }),
    rotateStyle({ duration: 1800, repeat: 'infinite', direction: 'normal', easing: 'linear' }),
    shakeStyle({ duration: 450, distance: 2, repeat: 1, easing: 'linear' }),
    ...(['up', 'down', 'left', 'right'] as const).map((from) =>
      slideInStyle({ from, duration: 350, delay: 0, distance: 10, repeat: 1, easing: 'ease', fillMode: 'both' }),
    ),
    zoomInStyle({ duration: 320, delay: 0, startScale: 0.92, repeat: 1, easing: 'ease', fillMode: 'both' }),
  ];
}

/** Selector and declarations of each rule in the stylesheet's `@media <condition>` block. */
function mediaRules(condition: string): Array<[selector: string, declarations: string]> {
  const start = theme.indexOf(`@media ${condition} {`);
  if (start < 0) return [];
  const open = theme.indexOf('{', start);
  let depth = 0;
  let close = open;
  for (let i = open; i < theme.length; i++) {
    if (theme[i] === '{') depth++;
    if (theme[i] === '}' && --depth === 0) {
      close = i;
      break;
    }
  }
  return Array.from(theme.slice(open + 1, close).matchAll(/([^{}]+)\{([^{}]*)\}/g), (m) => [m[1]!.trim(), m[2]!.trim()]);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('animation values', () => {
  it('writes the repeat as an iteration count, once by default', () => {
    expect(repeatToCss(3)).toBe('3');
    expect(repeatToCss('infinite')).toBe('infinite');
    expect(repeatToCss()).toBe('1');
  });

  it('keeps the moving animations in an inline box', () => {
    expect(animationInlineClasses).toBe('inline-block');
  });

  it('animates with keyframes the stylesheet defines', () => {
    for (const { animation } of playingStyles()) {
      const [keyframes] = animation.split(' ');
      expect(theme).toMatch(new RegExp(`@keyframes ${keyframes}\\s*\\{`));
    }
  });

  it('holds still for a reader who prefers reduced motion, before the page hydrates too', () => {
    // Server markup is rendered for a reader who allows motion: the
    // stylesheet stops the animation it carries inline, however a framework
    // or the browser writes the style, and drops the glitch's colour copies,
    // which would cover the text once still.
    const rules = mediaRules('(prefers-reduced-motion: reduce)');
    const [stop] = rules.find(([, declarations]) => declarations === 'animation: none !important;') ?? [];
    const [hide] = rules.find(([, declarations]) => declarations === 'display: none !important;') ?? [];
    expect(stop).toBeDefined();
    expect(hide).toBeDefined();
    const element = document.createElement('span');
    const spinners = (['pixel', 'linear'] as const).map((surface) => ({ animation: spinnerAnimation(surface, still)! }));
    for (const { animation } of [...playingStyles(), ...spinners]) {
      const [keyframes] = animation.split(' ');
      for (const written of [
        `animation:${animation}`,
        `--pxl-glitch-x: 4px; animation: ${animation};`,
        `animation-name: ${keyframes}; animation-duration: 1s;`,
      ]) {
        element.setAttribute('style', written);
        expect(element.matches(stop!), written).toBe(true);
      }
    }
    // A label's copies, drawn by the stylesheet, go too.
    expect(hide!.split(/,\s*/)).toEqual(expect.arrayContaining(['.pxl-glitch-copies::before', '.pxl-glitch-copies::after']));
    const glitch = glitchStyles({ duration: 3000, intensity: 4 });
    for (const [layer, hidden] of [[glitch.red, true], [glitch.cyan, true], [glitch.main, false]] as const) {
      element.setAttribute('style', `animation:${layer.animation}`);
      expect(element.matches(hide!), layer.animation).toBe(hidden);
    }
    for (const other of ['--pxl-scrollbar-size:8px', 'animation:spin 1s linear infinite', 'opacity:0.5']) {
      element.setAttribute('style', other);
      expect(element.matches(stop!), other).toBe(false);
      expect(element.matches(hide!), other).toBe(false);
    }
  });
});

describe('animation triggers', () => {
  it('listens to the events of its mode only', () => {
    expect(animationTriggerEvents('hover')).toEqual(['mouseenter', 'mouseleave']);
    expect(animationTriggerEvents('click')).toEqual(['click']);
    expect(animationTriggerEvents('focus')).toEqual(['focusin', 'focusout']);
    const silent: AnimationTrigger[] = ['mount', 'inView', true, false, 'other' as AnimationTrigger];
    for (const trigger of silent) {
      expect(animationTriggerEvents(trigger)).toEqual([]);
    }
  });

  it('follows the pointer, focus and clicks of its mode', () => {
    expect(nextAnimationTriggerState('hover', idle, 'mouseenter')).toEqual({ ...idle, hovered: true });
    expect(nextAnimationTriggerState('hover', all, 'mouseleave')).toEqual({ ...all, hovered: false });
    expect(nextAnimationTriggerState('focus', idle, 'focusin')).toEqual({ ...idle, focused: true });
    expect(nextAnimationTriggerState('focus', all, 'focusout')).toEqual({ ...all, focused: false });
    expect(nextAnimationTriggerState('click', idle, 'click')).toEqual({ ...idle, clicked: true });
  });

  it('ignores the events of other modes', () => {
    expect(nextAnimationTriggerState('hover', idle, 'click')).toBe(idle);
    expect(nextAnimationTriggerState('click', idle, 'focusin')).toBe(idle);
    expect(nextAnimationTriggerState('mount', idle, 'mouseenter')).toBe(idle);
    expect(nextAnimationTriggerState(true, idle, 'click')).toBe(idle);
  });

  it('restarts on a click during a run of a click-triggered animation', () => {
    expect(restartsAnimation('click', { ...idle, clicked: true }, 'click')).toBe(true);
    expect(restartsAnimation('click', idle, 'click')).toBe(false);
    expect(restartsAnimation('hover', all, 'click')).toBe(false);
    expect(restartsAnimation('click', all, 'mouseenter')).toBe(false);
  });

  it('waits for the next click once a click-triggered run ends', () => {
    expect(endAnimationRun('click', all)).toEqual({ ...all, clicked: false });
    expect(endAnimationRun('hover', all)).toBe(all);
    expect(endAnimationRun('mount', idle)).toBe(idle);
  });

  it('plays on mount, while its input lasts, or as controlled', () => {
    expect(isAnimationActive('mount', idle, still)).toBe(true);
    expect(isAnimationActive(true, idle, still)).toBe(true);
    expect(isAnimationActive(false, all, still)).toBe(false);
    expect(isAnimationActive('other' as AnimationTrigger, idle, still)).toBe(true);
    const inputs = { hover: 'hovered', focus: 'focused', inView: 'inView', click: 'clicked' } as const;
    for (const [trigger, input] of Object.entries(inputs) as Array<[AnimationTrigger, keyof AnimationTriggerState]>) {
      expect(isAnimationActive(trigger, idle, still)).toBe(false);
      expect(isAnimationActive(trigger, { ...idle, [input]: true }, still)).toBe(true);
    }
  });

  it('never plays when the user prefers reduced motion', () => {
    for (const trigger of ['mount', 'hover', 'click', 'focus', 'inView', true] as const) {
      expect(isAnimationActive(trigger, all, { reducedMotion: true })).toBe(false);
    }
  });
});

describe('observeInView', () => {
  it('reports the element in view at once without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const onChange = vi.fn();
    const stop = observeInView(document.createElement('div'), onChange);
    expect(onChange).toHaveBeenCalledExactlyOnceWith(true);
    expect(stop).not.toThrow();
  });

  it('follows the latest intersection of 15 % of the element', () => {
    const observers: Array<{ callback: IntersectionObserverCallback; options?: IntersectionObserverInit }> = [];
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
          observers.push({ callback, options });
        }
        observe = observe;
        disconnect = disconnect;
      },
    );
    const element = document.createElement('div');
    const onChange = vi.fn();
    const stop = observeInView(element, onChange);
    expect(observe).toHaveBeenCalledExactlyOnceWith(element);
    expect(observers[0]!.options).toEqual({ threshold: 0.15 });
    const report = (...states: boolean[]) =>
      observers[0]!.callback(
        states.map((isIntersecting) => ({ isIntersecting }) as IntersectionObserverEntry),
        {} as IntersectionObserver,
      );
    report(true);
    report(true, false);
    expect(onChange.mock.calls).toEqual([[true], [false]]);
    stop();
    expect(disconnect).toHaveBeenCalledOnce();
  });
});

describe('restartAnimations', () => {
  it('starts the animations of the element and its subtree over', () => {
    const animation = { cancel: vi.fn(), play: vi.fn() };
    const getAnimations = vi.fn(() => [animation]);
    const element = Object.assign(document.createElement('div'), { getAnimations });
    restartAnimations(element);
    expect(getAnimations).toHaveBeenCalledWith({ subtree: true });
    expect(animation.cancel).toHaveBeenCalledOnce();
    expect(animation.play).toHaveBeenCalledOnce();
    expect(animation.cancel.mock.invocationCallOrder[0]).toBeLessThan(animation.play.mock.invocationCallOrder[0]!);
  });

  it('does nothing without the Web Animations API or an element', () => {
    expect(() => restartAnimations(document.createElement('div'))).not.toThrow();
    expect(() => restartAnimations(null)).not.toThrow();
    expect(() => restartAnimations(undefined)).not.toThrow();
  });
});
