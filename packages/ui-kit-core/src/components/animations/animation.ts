/**
 * What every animation component shares: when an animation plays — its
 * trigger mode, overruled by reduced motion — how a run ends, and the CSS
 * values the components compose. The keyframes they name are plain
 * `@keyframes` of the theme stylesheet (`styles.css`).
 */

/**
 * Possible trigger modes that decide *when* a `Pixel*` animation runs.
 *
 * - `'mount'`   — run as soon as the component mounts (default).
 * - `'hover'`   — run while the user hovers the wrapper.
 * - `'click'`   — run once per click, restarts on subsequent clicks.
 * - `'focus'`   — run while the wrapper has keyboard focus.
 * - `'inView'`  — run while the wrapper intersects the viewport.
 * - `boolean`   — fully controlled: `true` plays, `false` pauses/resets.
 */
export type AnimationTrigger = 'mount' | 'hover' | 'click' | 'focus' | 'inView' | boolean;

/**
 * CSS `animation-iteration-count` shape: a finite number of repeats, or the
 * string literal `'infinite'`.
 */
export type AnimationRepeat = number | 'infinite';

/** CSS `animation-fill-mode`. */
export type AnimationFillMode = 'none' | 'forwards' | 'backwards' | 'both';

/** CSS `animation-direction`. */
export type AnimationDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';

/** Coerce an `AnimationRepeat` value to a valid CSS `animation-iteration-count`. */
export function repeatToCss(repeat: AnimationRepeat = 1): string {
  return typeof repeat === 'number' ? String(repeat) : repeat;
}

/**
 * Inline style of an animated element while it plays: the `animation`
 * shorthand, and the custom properties its keyframes read.
 */
export interface AnimationStyle {
  animation: string;
  [property: string]: string;
}

/**
 * Wrapper of the animations that move their content (bounce, float, rotate,
 * shake): an inline box, sized to the content it moves.
 */
export const animationInlineClasses = 'inline-block';

/** What the trigger modes follow on the animated element. */
export interface AnimationTriggerState {
  /** The pointer is over it (`'hover'`). */
  hovered: boolean;
  /** Focus is inside it (`'focus'`). */
  focused: boolean;
  /** It intersects the viewport (`'inView'`). */
  inView: boolean;
  /** A click started a run that has not ended yet (`'click'`). */
  clicked: boolean;
}

/** The state on mount: nothing hovered, focused, in view or clicked. */
export const ANIMATION_TRIGGER_IDLE: AnimationTriggerState = Object.freeze({
  hovered: false,
  focused: false,
  inView: false,
  clicked: false,
});

/** A DOM event of the animated element that a trigger mode follows. */
export type AnimationTriggerEvent = 'mouseenter' | 'mouseleave' | 'focusin' | 'focusout' | 'click';

const TRIGGER_EVENTS: Record<Exclude<AnimationTrigger, boolean>, readonly AnimationTriggerEvent[]> = {
  mount: [],
  hover: ['mouseenter', 'mouseleave'],
  click: ['click'],
  focus: ['focusin', 'focusout'],
  inView: [],
};

/**
 * The DOM events of the animated element its trigger mode follows: the
 * pointer entering and leaving for `'hover'`, clicks for `'click'`, focus
 * moving in and out (bubbling, so focus anywhere inside counts) for
 * `'focus'`. The other modes listen to none.
 */
export function animationTriggerEvents(trigger: AnimationTrigger): readonly AnimationTriggerEvent[] {
  return typeof trigger === 'boolean' ? [] : (TRIGGER_EVENTS[trigger] ?? []);
}

/**
 * The state after `event` on the animated element. Events the trigger mode
 * does not follow leave it as it is.
 */
export function nextAnimationTriggerState(
  trigger: AnimationTrigger,
  state: AnimationTriggerState,
  event: AnimationTriggerEvent,
): AnimationTriggerState {
  if (!animationTriggerEvents(trigger).includes(event)) return state;
  switch (event) {
    case 'mouseenter':
    case 'mouseleave':
      return { ...state, hovered: event === 'mouseenter' };
    case 'focusin':
    case 'focusout':
      return { ...state, focused: event === 'focusin' };
    case 'click':
      return { ...state, clicked: true };
  }
}

/**
 * Whether `event` starts the animation over: a click on a click-triggered
 * animation whose run is still playing (see `restartAnimations`).
 */
export function restartsAnimation(
  trigger: AnimationTrigger,
  state: AnimationTriggerState,
  event: AnimationTriggerEvent,
): boolean {
  return trigger === 'click' && event === 'click' && state.clicked;
}

/** The state once a run has ended: a click-triggered animation waits for the next click. */
export function endAnimationRun(trigger: AnimationTrigger, state: AnimationTriggerState): AnimationTriggerState {
  return trigger === 'click' ? { ...state, clicked: false } : state;
}

/**
 * Whether the animation plays: a controlled trigger decides by itself,
 * `'mount'` always plays, and the other modes while what they follow lasts.
 * Reduced motion overrules every mode, controlled included — the content
 * then shows still, in its final, fully visible state.
 */
export function isAnimationActive(
  trigger: AnimationTrigger,
  state: AnimationTriggerState,
  { reducedMotion }: { reducedMotion: boolean },
): boolean {
  if (reducedMotion) return false;
  switch (trigger) {
    case true:
    case false:
      return trigger;
    case 'hover':
      return state.hovered;
    case 'click':
      return state.clicked;
    case 'focus':
      return state.focused;
    case 'inView':
      return state.inView;
    default:
      return true;
  }
}

/** Share of the element that has to be visible for `'inView'`. */
const IN_VIEW_THRESHOLD = 0.15;

/**
 * Reports whether `element` is in view — at least 15 % of it inside the
 * viewport — until the returned function is called. Without
 * `IntersectionObserver` (old WebViews, jsdom-based test suites) it reports
 * the element in view at once, so `'inView'` content is never stuck hidden.
 */
export function observeInView(element: Element, onChange: (inView: boolean) => void): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    onChange(true);
    return () => {};
  }
  // Several entries arrive when the element crossed the threshold more than
  // once since the last report: the last one is current.
  const observer = new IntersectionObserver((entries) => onChange(entries[entries.length - 1].isIntersecting), {
    threshold: IN_VIEW_THRESHOLD,
  });
  observer.observe(element);
  return () => observer.disconnect();
}

/**
 * Starts the CSS animations of `element` and its subtree over. Needs the Web
 * Animations API; without it the running animations carry on.
 */
export function restartAnimations(element: Element | null | undefined): void {
  if (typeof element?.getAnimations !== 'function') return;
  for (const animation of element.getAnimations({ subtree: true })) {
    animation.cancel();
    animation.play();
  }
}
