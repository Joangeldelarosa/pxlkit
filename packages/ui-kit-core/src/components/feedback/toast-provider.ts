/**
 * PxlKitToastProvider — the toast queue every kit's provider holds, the
 * imperative API over it (`toast()`, its tone shortcuts and `promise()`), and
 * the viewport the toasts render in, stacked or as a list.
 */
import { cn } from '../../common';
import { TOAST_DURATION, type ToastItem, type ToastTone } from './toast';

export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

/** Input of `toast()`. `id` is generated if omitted. */
export type ToastInput<TNode = unknown> = Omit<ToastItem<TNode>, 'id'> & { id?: string };

/** Patch of `update()`, merged into the toast. */
export type ToastPatch<TNode = unknown> = Partial<Omit<ToastItem<TNode>, 'id'>>;

/** Options of `toast.promise()`: the toast while pending, then once it resolves or rejects. */
export interface ToastPromiseOptions<T, TNode = unknown> {
  loading: Omit<ToastInput<TNode>, 'tone' | 'loading'>;
  success: Omit<ToastInput<TNode>, 'id'> | ((value: T) => Omit<ToastInput<TNode>, 'id'>);
  error: Omit<ToastInput<TNode>, 'id'> | ((err: unknown) => Omit<ToastInput<TNode>, 'id'>);
}

/** Tone-locked shorthand (`success` / `error` / `info` / `warning` / `loading`). */
export type ToastShortcut<TNode = unknown> = (
  titleOrInput: string | Omit<ToastInput<TNode>, 'tone'>,
  message?: string,
) => string;

/** `toast()`: push a toast and get its id, with the shortcuts attached. */
export interface ToastFn<TNode = unknown> {
  (input: ToastInput<TNode>): string;
  success: ToastShortcut<TNode>;
  error: ToastShortcut<TNode>;
  info: ToastShortcut<TNode>;
  warning: ToastShortcut<TNode>;
  loading: ToastShortcut<TNode>;
  update: (id: string, patch: ToastPatch<TNode>) => void;
  dismiss: (id: string) => void;
  /**
   * Shows a loading toast while the promise (or the one the function returns)
   * is pending, then turns it into the success or error toast. Returns the
   * promise's outcome: its value, or its rejection.
   */
  promise: <T>(p: Promise<T> | (() => Promise<T>), opts: ToastPromiseOptions<T, TNode>) => Promise<T>;
}

/** What a provider does with its queue, the base of `createToastFn`. */
export interface ToastQueueActions<TNode = unknown> {
  push: (input: ToastInput<TNode>) => string;
  update: (id: string, patch: ToastPatch<TNode>) => void;
  dismiss: (id: string) => void;
}

/** Most toasts on screen at once by default; the oldest go first. */
export const TOAST_MAX = 5;

/** Cards peeking behind the front one in a collapsed stack, by default. */
export const TOAST_STACK_VISIBLE = 2;

/** Auto-dismiss delays of a settled `promise()` toast without its own `duration`, in ms. */
export const TOAST_PROMISE_DURATION = { success: 4500, error: 6000 } as const;

/** Accessible name of the viewport landmark. */
export const TOAST_VIEWPORT_LABEL = 'Notifications';

let sequence = 0;

/** A new toast id, unique on the page. */
export function createToastId(): string {
  return `pxl-toast-${++sequence}`;
}

/** The toast an input describes: with the default duration unless it sets one, and its id or a new one. */
export function toToastItem<TNode>(input: ToastInput<TNode>): ToastItem<TNode> {
  return { duration: TOAST_DURATION, ...input, id: input.id ?? createToastId() };
}

/**
 * `toasts` with `toast` added as the newest — in place of any toast with its
 * id — and the oldest dropped beyond `max`.
 */
export function addToast<T extends { id: string }>(toasts: readonly T[], toast: T, max: number): T[] {
  const next = [...toasts.filter((t) => t.id !== toast.id), toast];
  return next.length > max ? next.slice(next.length - max) : next;
}

/** `toasts` with `patch` merged into the toast `id` (unchanged when there is none). */
export function updateToast<T extends { id: string }>(
  toasts: readonly T[],
  id: string,
  patch: NoInfer<Partial<Omit<T, 'id'>>>,
): T[] {
  return toasts.map((t) => (t.id === id ? { ...t, ...patch } : t));
}

/** `toasts` without the toast `id`. */
export function removeToast<T extends { id: string }>(toasts: readonly T[], id: string): T[] {
  return toasts.filter((t) => t.id !== id);
}

function shortcutInput<TNode>(
  titleOrInput: string | Omit<ToastInput<TNode>, 'tone'>,
  message?: string,
): Omit<ToastInput<TNode>, 'tone'> {
  if (typeof titleOrInput === 'string') {
    return message != null ? { title: titleOrInput, message } : { title: titleOrInput };
  }
  return titleOrInput;
}

/** The `toast()` API over a provider's queue. */
export function createToastFn<TNode>({ push, update, dismiss }: ToastQueueActions<TNode>): ToastFn<TNode> {
  const toned =
    (tone: ToastTone): ToastShortcut<TNode> =>
    (titleOrInput, message) =>
      push({ ...shortcutInput(titleOrInput, message), tone });
  const fn = ((input: ToastInput<TNode>) => push(input)) as ToastFn<TNode>;
  fn.success = toned('green');
  fn.error = toned('red');
  fn.info = toned('cyan');
  fn.warning = toned('gold');
  fn.loading = (titleOrInput, message) =>
    push({ ...shortcutInput(titleOrInput, message), tone: 'cyan', loading: true, duration: 0 });
  fn.update = update;
  fn.dismiss = dismiss;
  fn.promise = <T>(p: Promise<T> | (() => Promise<T>), opts: ToastPromiseOptions<T, TNode>): Promise<T> => {
    const id = push({ ...opts.loading, tone: 'cyan', loading: true, duration: 0 });
    const promise = typeof p === 'function' ? p() : p;
    return promise.then(
      (value) => {
        const patch = typeof opts.success === 'function' ? opts.success(value) : opts.success;
        update(id, { tone: 'green', loading: false, duration: patch.duration ?? TOAST_PROMISE_DURATION.success, ...patch });
        return value;
      },
      (err: unknown) => {
        const patch = typeof opts.error === 'function' ? opts.error(err) : opts.error;
        update(id, { tone: 'red', loading: false, duration: patch.duration ?? TOAST_PROMISE_DURATION.error, ...patch });
        throw err;
      },
    );
  };
  return fn;
}

/* ── Viewport ───────────────────────────────────────────────────────────── */

/** Placement of the viewport per position. */
export const toastPositionClasses: Record<ToastPosition, string> = {
  'top-right': 'top-4 right-4 items-end',
  'top-left': 'top-4 left-4 items-start',
  'bottom-right': 'bottom-4 right-4 items-end',
  'bottom-left': 'bottom-4 left-4 items-start',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
};

/** The viewport: a fixed column at `position` that lets clicks through around the toasts. */
export function toastViewportClasses(position: ToastPosition): string {
  return cn(
    'pointer-events-none fixed z-[90] flex w-full max-w-[min(24rem,calc(100vw-2rem))] flex-col gap-2 p-0',
    toastPositionClasses[position],
  );
}

/** The slot around each toast in the viewport. */
export const toastSlotClasses = 'w-full';

/**
 * Inline style of a toast's slot in the viewport — an object type rather than
 * an interface, so it fits each framework's style property as is.
 */
export type ToastSlotStyle = {
  transform: string;
  transformOrigin: string;
  opacity: number;
  /** Set on toasts hidden in a collapsed stack. */
  pointerEvents?: 'none';
  transition: string;
  zIndex: number;
};

export interface ToastSlot<T> {
  toast: T;
  /** How far behind the front toast it is (`0`: the front, the newest). */
  depth: number;
  style: ToastSlotStyle;
}

export interface ToastStackOptions {
  position: ToastPosition;
  /** Collapse the toasts into a stack (unless `expanded`). */
  stacked: boolean;
  /** The viewport is hovered or focused: the stack opens into a list. */
  expanded: boolean;
  /** Cards that stay visible behind the front one in a collapsed stack. */
  stackVisible: number;
}

/**
 * The toasts in render order, with the layout of each slot. The newest toast
 * is the front one, farthest from the screen edge: rendered last at the top,
 * first at the bottom. In a collapsed stack the older toasts shift towards it
 * and shrink a little per step of depth, and fade out beyond `stackVisible`.
 */
export function toastSlots<T>(
  toasts: readonly T[],
  { position, stacked, expanded, stackVisible }: ToastStackOptions,
): ToastSlot<T>[] {
  const bottom = position.startsWith('bottom');
  const ordered = bottom ? [...toasts].reverse() : [...toasts];
  const front = ordered.length - 1;
  const collapsed = stacked && !expanded;
  return ordered.map((toast, i) => {
    const depth = bottom ? i : front - i;
    const visible = !collapsed || depth <= stackVisible;
    const offset = collapsed ? depth * 8 : 0;
    const scale = collapsed ? Math.max(0.92, 1 - depth * 0.04) : 1;
    return {
      toast,
      depth,
      style: {
        transform: `translateY(${bottom ? -offset : offset}px) scale(${scale})`,
        transformOrigin: bottom ? 'bottom center' : 'top center',
        opacity: visible ? 1 : 0,
        ...(visible ? {} : { pointerEvents: 'none' as const }),
        transition: 'transform 200ms ease, opacity 200ms ease',
        zIndex: 100 + front - depth,
      },
    };
  });
}
