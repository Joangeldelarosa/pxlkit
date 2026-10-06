/**
 * PxlKitToastProvider — the toast queue every kit's provider holds, the
 * imperative API over it (`toast()`, its tone shortcuts and `promise()`), and
 * the viewport the toasts render in, stacked or as a list: a landmark a
 * hotkey reaches, holding the two live regions that announce the toasts, and
 * keeping focus when a focused toast leaves it.
 */
import { cn } from '../../common';
import { matchesCommandShortcut, parseCommandShortcut, type CommandKeyPress } from '../overlays/command';
import { TOAST_DURATION, isAssertiveToast, toastTone, type ToastItem, type ToastTone } from './toast';

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

/** Least auto-dismiss delay of a settled `promise()` error toast without its own `duration`, in ms. */
export const TOAST_ERROR_DURATION = 6000;

/**
 * Auto-dismiss delay of a settled `promise()` error toast without its own
 * `duration`, from the provider's `duration`: never shorter than the other
 * toasts nor than 6 s — and never, like them, when the provider's is `0`.
 */
export function toastErrorDuration(duration: number): number {
  return duration > 0 ? Math.max(duration, TOAST_ERROR_DURATION) : 0;
}

/** Accessible name of the viewport landmark. */
export const TOAST_VIEWPORT_LABEL = 'Notifications';

let sequence = 0;

/** A new toast id, unique on the page. */
export function createToastId(): string {
  return `pxl-toast-${++sequence}`;
}

/**
 * The toast an input describes: with the provider's `duration` unless it sets
 * its own, and its id or a new one.
 */
export function toToastItem<TNode>(input: ToastInput<TNode>, duration = TOAST_DURATION): ToastItem<TNode> {
  return { ...input, duration: input.duration ?? duration, id: input.id ?? createToastId() };
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

/**
 * The `toast()` API over a provider's queue. `duration` reads the provider's
 * auto-dismiss delay, which a settled promise toast takes unless it sets its
 * own — an error toast at least 6 s.
 */
export function createToastFn<TNode>(
  { push, update, dismiss }: ToastQueueActions<TNode>,
  duration: () => number = () => TOAST_DURATION,
): ToastFn<TNode> {
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
        update(id, { tone: 'green', loading: false, duration: patch.duration ?? duration(), ...patch });
        return value;
      },
      (err: unknown) => {
        const patch = typeof opts.error === 'function' ? opts.error(err) : opts.error;
        update(id, { tone: 'red', loading: false, duration: patch.duration ?? toastErrorDuration(duration()), ...patch });
        throw err;
      },
    );
  };
  return fn;
}

/* ── Hotkey ─────────────────────────────────────────────────────────────── */

/** The key that moves focus to the viewport, by default. */
export const TOAST_HOTKEY = 'F8';

/**
 * Whether a key press is the provider's `hotkey`, written like `F8` or
 * `alt+t` (see `parseCommandShortcut`); `false` is none. It is honoured in
 * text fields too: a function key types nothing.
 */
export function isToastHotkey(press: CommandKeyPress, hotkey: string | false): boolean {
  return hotkey !== false && matchesCommandShortcut(press, parseCommandShortcut(hotkey));
}

/** Accessible name of the viewport, telling the hotkey that reaches it: "Notifications (F8)". */
export function toastViewportLabel(hotkey: string | false): string {
  return hotkey ? `${TOAST_VIEWPORT_LABEL} (${hotkey})` : TOAST_VIEWPORT_LABEL;
}

/* ── Announcements ──────────────────────────────────────────────────────── */

/** What announces a toast: its title, then its message. */
export function toastAnnouncement(toast: Pick<ToastItem, 'title' | 'message'>): string {
  return toast.message ? `${toast.title} ${toast.message}` : toast.title;
}

/** One message of a live region. */
export interface ToastLiveMessage {
  /** Unique: a message repeated later is new content, which the region reads again. */
  key: number;
  /** The toast it announces; the message leaves the region with it. */
  toastId: string;
  text: string;
}

/** What the viewport's live regions say: `polite` in its `role="status"` region, `assertive` in its `role="alert"` one. */
export interface ToastLiveRegions {
  polite: readonly ToastLiveMessage[];
  assertive: readonly ToastLiveMessage[];
}

/** Live regions with nothing to say, as the viewport renders them at first. */
export const NO_TOAST_MESSAGES: ToastLiveRegions = { polite: [], assertive: [] };

/** Announces a toast just pushed, or `toast` once an update made it from `previous`. */
export type ToastAnnouncer = (toast: ToastItem, previous?: ToastItem) => void;

/**
 * The announcements of a provider, written to its live regions through
 * `onChange`. A toast is announced when pushed, and when an update changes
 * its title, message or tone (a settled promise), in the region its urgency
 * picks (`isAssertiveToast`). Toasts announced together — in one task — are
 * read together; the next announcement replaces them with new messages, so
 * a repeated text is read again.
 */
export function createToastAnnouncer(onChange: (regions: ToastLiveRegions) => void): ToastAnnouncer {
  let regions = NO_TOAST_MESSAGES;
  let open = false;
  let key = 0;
  return (toast, previous) => {
    if (
      previous &&
      previous.title === toast.title &&
      previous.message === toast.message &&
      toastTone(previous) === toastTone(toast)
    ) {
      return;
    }
    if (!open) {
      open = true;
      regions = NO_TOAST_MESSAGES;
      queueMicrotask(() => {
        open = false;
      });
    }
    const message: ToastLiveMessage = { key: ++key, toastId: toast.id, text: toastAnnouncement(toast) };
    regions = isAssertiveToast(toast)
      ? { ...regions, assertive: [...regions.assertive, message] }
      : { ...regions, polite: [...regions.polite, message] };
    onChange(regions);
  };
}

/** What the live regions say about the toasts still in the queue. */
export function liveToastMessages(regions: ToastLiveRegions, toasts: readonly { id: string }[]): ToastLiveRegions {
  const shown = (messages: readonly ToastLiveMessage[]) =>
    messages.filter((message) => toasts.some((toast) => toast.id === message.toastId));
  return { polite: shown(regions.polite), assertive: shown(regions.assertive) };
}

/* ── Focus ──────────────────────────────────────────────────────────────── */

/**
 * Call right before the queue of `viewport` changes. When focus is inside one
 * of its toasts, returns what to call once the change has rendered: if that
 * toast has left, taking focus with it, focus moves to the dismiss button of
 * the next toast still in the viewport, else of the previous one, else to
 * `returnTo()` — the element focus entered the viewport from — while it is on
 * the page; otherwise it stays on `<body>`.
 */
export function keepToastFocus(
  viewport: HTMLElement | null | undefined,
  returnTo: () => HTMLElement | null | undefined,
): (() => void) | undefined {
  if (!viewport) return undefined;
  const cards = Array.from(viewport.querySelectorAll<HTMLElement>('[data-pxl-toast]'));
  const index = cards.findIndex((card) => card.contains(viewport.ownerDocument.activeElement));
  const card = cards[index];
  if (!card) return undefined;
  return () => {
    const active = card.ownerDocument.activeElement;
    if (card.isConnected || (active && active !== card.ownerDocument.body)) return;
    const neighbour =
      cards.slice(index + 1).find((other) => other.isConnected) ??
      cards
        .slice(0, index)
        .reverse()
        .find((other) => other.isConnected);
    const target = neighbour ? neighbour.querySelector<HTMLElement>('[data-pxl-toast-dismiss]') : returnTo();
    if (target?.isConnected) target.focus();
  };
}

/**
 * The element focus came from into `viewport`, to return to once no toast is
 * left — none when it came from inside, or from nowhere: focus handed on
 * from a toast that left comes from the body, and keeps the first origin.
 */
export function toastFocusOrigin(viewport: Element, from: EventTarget | null): HTMLElement | undefined {
  return from instanceof HTMLElement && !viewport.contains(from) ? from : undefined;
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

/** The viewport's live regions, read by assistive technology only. */
export const toastLiveRegionClasses = 'sr-only';

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
