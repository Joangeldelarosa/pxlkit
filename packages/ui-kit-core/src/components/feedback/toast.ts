/**
 * PixelToast — one toast card (tone border and title, a leading icon or a
 * spinner while loading, message, action, dismiss button and the countdown
 * bar), the rules every kit applies to a toast, and its auto-dismiss
 * countdown, which holds still while the toast is hovered or focused, and
 * while nobody looks at the page: hidden, or in a window in the background.
 */
import { cn, surfaceClasses, toneMap, type Surface, type Tone } from '../../common';
import { isCriticalTone } from './alert';

export type ToastTone = Tone;

/**
 * One toast. `TNode` is the content type of the framework rendering it: a
 * React node, a Vue `PxlNode`, an Angular `PxlContent`.
 */
export interface ToastItem<TNode = unknown> {
  id: string;
  title: string;
  message?: string;
  tone?: ToastTone;
  /** Auto-dismiss in ms. Set to `0` to disable. Defaults to the provider's `duration` (4500). */
  duration?: number;
  /** Optional icon rendered to the left of the title. */
  icon?: TNode;
  /**
   * Optional animated pxlkit icon. When provided, takes precedence over
   * `icon` and is rendered in the same slot.
   */
  animatedIcon?: TNode;
  /** Optional inline action (typically a button or a link). */
  action?: TNode;
  /**
   * When `true`, the provider announces the toast assertively, in its
   * `role="alert"` region. Defaults based on tone.
   */
  assertive?: boolean;
  /**
   * Show a leading spinner (used by `toast.loading()` and `toast.promise()`'s
   * loading state). A loading toast never auto-dismisses: update it once the
   * work settles.
   */
  loading?: boolean;
}

/** Tone of a toast without its own. */
export const TOAST_DEFAULT_TONE: ToastTone = 'cyan';

/** Auto-dismiss delay of a toast without its own `duration`, in ms. */
export const TOAST_DURATION = 4500;

/** Accessible label of a toast's dismiss button. */
export const TOAST_DISMISS_LABEL = 'Dismiss notification';

export function toastTone(toast: Pick<ToastItem, 'tone'>): ToastTone {
  return toast.tone ?? TOAST_DEFAULT_TONE;
}

/** The toast's auto-dismiss delay; `0` (never) while it is loading. */
export function toastDuration(toast: Pick<ToastItem, 'duration' | 'loading'>): number {
  return toast.loading ? 0 : (toast.duration ?? TOAST_DURATION);
}

/**
 * Whether the toast is announced assertively (the `role="alert"` region)
 * rather than politely (the `role="status"` one): `assertive` when set, else
 * critical tones (red, gold) are.
 */
export function isAssertiveToast(toast: Pick<ToastItem, 'assertive' | 'tone'>): boolean {
  return toast.assertive ?? isCriticalTone(toastTone(toast));
}

/** What the leading slot shows: the animated icon, else a spinner while loading, else the icon. */
export type ToastLeading<TNode> = { kind: 'spinner' } | { kind: 'node'; node: TNode };

export function toastLeading<TNode>(
  toast: Pick<ToastItem<TNode>, 'icon' | 'animatedIcon' | 'loading'>,
): ToastLeading<TNode> | null {
  if (toast.animatedIcon != null) return toast.animatedIcon ? { kind: 'node', node: toast.animatedIcon } : null;
  if (toast.loading) return { kind: 'spinner' };
  return toast.icon ? { kind: 'node', node: toast.icon } : null;
}

export interface ToastClasses {
  root: string;
  /** The row of stripe, leading slot, texts and dismiss button. */
  row: string;
  /** Left accent stripe (pixel surface). */
  stripe: string;
  /** The leading slot, in the tone colour. */
  leading: string;
  /** The spinner in the leading slot while loading. */
  spinner: string;
  /** The column of title, message and action. */
  body: string;
  title: string;
  message: string;
  /** Wrapper of the action under the message. */
  action: string;
  dismiss: string;
  /** Track of the countdown bar along the bottom edge. */
  track: string;
  /** The countdown bar. */
  bar: string;
}

/** Classes of every part of the toast card for a surface and tone. */
export function toastClasses(surface: Surface, tone: ToastTone): ToastClasses {
  const s = surfaceClasses(surface);
  const t = toneMap[tone];
  return {
    root: cn(
      'pointer-events-auto relative w-full max-w-sm overflow-hidden bg-retro-bg shadow-xl',
      s.border,
      s.radiusLg,
      t.border,
      'animate-pxl-toast-in motion-reduce:animate-none',
    ),
    row: cn('flex items-start gap-2.5 p-3 pl-4', surface === 'pixel' && 'pl-5'),
    stripe: cn('absolute left-0 top-0 bottom-0 w-1', t.fill),
    leading: cn('mt-0.5 shrink-0 inline-flex items-center justify-center', t.text),
    spinner: cn('inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent', t.text),
    body: 'flex-1 min-w-0',
    title: cn('text-xs font-semibold truncate', s.font, t.text),
    message: 'mt-1 text-sm text-retro-muted',
    action: 'mt-2.5',
    dismiss:
      '-mr-1 -mt-1 flex h-6 w-6 shrink-0 items-center justify-center text-retro-muted transition-colors hover:text-retro-text focus:outline-none focus-visible:ring-2 focus-visible:ring-retro-cyan/40',
    track: 'absolute inset-x-0 bottom-0 h-0.5 bg-retro-surface/40',
    bar: cn('h-full transition-[width] ease-linear', t.fill),
  };
}

/* ── Countdown ──────────────────────────────────────────────────────────── */

/** What holds a toast still: the pointer over it, focus inside it, and a page nobody looks at. */
export interface ToastHolds {
  hover: boolean;
  focus: boolean;
  /** The document is hidden: another tab is in front, or the window is minimised. */
  hidden: boolean;
  /** The window has lost focus to another window or application. */
  blurred: boolean;
}

const HOLDS = ['hover', 'focus', 'hidden', 'blurred'] as const;

/**
 * State of a toast's auto-dismiss countdown. The kits keep it per toast card,
 * run a timer for `toastCountdownDelay` while it runs and render the bar with
 * `toastCountdownStyle`.
 */
export interface ToastCountdown {
  /** Auto-dismiss delay in ms; `0` never dismisses (and shows no bar). */
  readonly duration: number;
  /** Time left, in ms, when the countdown last started or stopped. */
  readonly remaining: number;
  /** When it last started running (`Date.now()`), `null` while stopped. */
  readonly startedAt: number | null;
  readonly holds: Readonly<ToastHolds>;
}

const isHeld = (holds: Readonly<ToastHolds>) => HOLDS.some((hold) => holds[hold]);

/**
 * A countdown over `duration`, stopped with the bar full — and held already
 * when the page is hidden, so a toast shown meanwhile waits for it to come
 * back. Whether the window has focus is only known from its `blur` and
 * `focus` events.
 */
export function createToastCountdown(duration: number): ToastCountdown {
  const hidden = typeof document !== 'undefined' && document.hidden;
  return {
    duration,
    remaining: duration,
    startedAt: null,
    holds: { hover: false, focus: false, hidden, blurred: false },
  };
}

/**
 * Starts the countdown, unless it runs already, holds still, or has no
 * duration. Start it once the full bar has rendered (and its style has been
 * computed), so the bar shrinks from there.
 */
export function startToastCountdown(countdown: ToastCountdown, now: number): ToastCountdown {
  if (countdown.startedAt !== null || countdown.duration <= 0 || isHeld(countdown.holds)) return countdown;
  return { ...countdown, startedAt: now };
}

/** Counts down afresh from a new duration (the toast changed its own), keeping what holds it. */
export function resetToastCountdown(countdown: ToastCountdown, duration: number): ToastCountdown {
  return { ...countdown, duration, remaining: duration, startedAt: null };
}

/**
 * Updates what holds the toast. Anything holding it stops the countdown,
 * keeping the time left; it runs on once nothing holds it any more — so a
 * toast that is both hovered and focused keeps still until both end.
 */
export function holdToastCountdown(countdown: ToastCountdown, holds: Partial<ToastHolds>, now: number): ToastCountdown {
  const next = { ...countdown.holds, ...holds };
  if (HOLDS.every((hold) => next[hold] === countdown.holds[hold])) return countdown;
  if (isHeld(next) && countdown.startedAt !== null) {
    const remaining = Math.max(0, countdown.remaining - (now - countdown.startedAt));
    return { ...countdown, holds: next, remaining, startedAt: null };
  }
  const updated = { ...countdown, holds: next };
  return isHeld(countdown.holds) && !isHeld(next) ? startToastCountdown(updated, now) : updated;
}

/** Ms until the countdown runs out while it runs, `null` while stopped. */
export function toastCountdownDelay(countdown: ToastCountdown, now: number): number | null {
  return countdown.startedAt === null ? null : Math.max(0, countdown.remaining - (now - countdown.startedAt));
}

/**
 * Style of the countdown bar: while stopped it shows the share of time left;
 * while running it shrinks to nothing over the time left.
 */
export function toastCountdownStyle(countdown: ToastCountdown): { width: string; transitionDuration: string } {
  return countdown.startedAt === null
    ? { width: `${(countdown.remaining / countdown.duration) * 100}%`, transitionDuration: '0ms' }
    : { width: '0%', transitionDuration: `${countdown.remaining}ms` };
}
