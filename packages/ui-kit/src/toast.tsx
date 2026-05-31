import React, {
  createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  Tone, Surface, cn,
  toneMap, surfaceClasses, useEffectiveSurface,
  CloseIcon,
} from './common';

/* ──────────────────────────────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────────────────────────────── */

export type ToastTone = Tone;
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

/** Shape of an individual toast notification. */
export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  tone?: ToastTone;
  /** Auto-dismiss in ms. Set to `0` to disable. Defaults to 4500. */
  duration?: number;
  /** Optional icon node rendered to the left of the title. */
  icon?: React.ReactNode;
  /**
   * Optional animated pxlkit icon node. When provided, takes precedence over `icon`
   * and is rendered with the same slot semantics. Typically `<AnimatedPxlKitIcon …/>`.
   */
  animatedIcon?: React.ReactNode;
  /** Optional inline action (typically a {@link PixelButton} or link). */
  action?: React.ReactNode;
  /** When `true`, render with `role="alert"` (assertive). Defaults based on tone. */
  assertive?: boolean;
  /**
   * Show a leading spinner (used by `toast.loading()` and `toast.promise()`'s
   * loading state). Has no auto-dismiss unless `duration` is also set.
   */
  loading?: boolean;
}

/** Input shape accepted by {@link useToast}. `id` is generated if omitted. */
export type ToastInput = Omit<ToastItem, 'id'> & { id?: string };

/** Patch shape for {@link UseToastReturn.update}. */
export type ToastPatch = Partial<Omit<ToastItem, 'id'>>;

/** Options for {@link UseToastReturn.promise}. */
export interface ToastPromiseOptions<T> {
  loading: Omit<ToastInput, 'tone' | 'loading'>;
  success: Omit<ToastInput, 'id'> | ((value: T) => Omit<ToastInput, 'id'>);
  error: Omit<ToastInput, 'id'> | ((err: unknown) => Omit<ToastInput, 'id'>);
}

interface ToastContextValue {
  toasts: ToastItem[];
  push: (toast: ToastInput) => string;
  update: (id: string, patch: ToastPatch) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/* ──────────────────────────────────────────────────────────────────────────
   useToast — primary public API.
   ────────────────────────────────────────────────────────────────────────── */

/** Shorthand fn for tone-locked convenience helpers (success/error/info/warning/loading). */
export type ToastShortcut = (
  titleOrInput: string | Omit<ToastInput, 'tone'>,
  message?: string,
) => string;

export interface UseToastReturn {
  /** Push a toast. Returns the toast id (useful for `dismiss()`). */
  toast: ((input: ToastInput) => string) & {
    success: ToastShortcut;
    error: ToastShortcut;
    info: ToastShortcut;
    warning: ToastShortcut;
    loading: ToastShortcut;
    update: (id: string, patch: ToastPatch) => void;
    dismiss: (id: string) => void;
    promise: <T>(p: Promise<T> | (() => Promise<T>), opts: ToastPromiseOptions<T>) => Promise<T>;
  };
  /** Dismiss a specific toast by id. */
  dismiss: (id: string) => void;
  /** Update an existing toast in place (merge patch). */
  update: (id: string, patch: ToastPatch) => void;
  /** Clear every active toast immediately. */
  clear: () => void;
  /** Current active toasts (read-only). */
  toasts: ToastItem[];
}

function normalizeShortcutArgs(
  titleOrInput: string | Omit<ToastInput, 'tone'>,
  message?: string,
): Omit<ToastInput, 'tone'> {
  if (typeof titleOrInput === 'string') {
    return message != null ? { title: titleOrInput, message } : { title: titleOrInput };
  }
  return titleOrInput;
}

export function useToast(): UseToastReturn {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <PxlKitToastProvider>.');
  }
  const { push, update, dismiss, clear, toasts } = ctx;

  // Build the callable+attached `toast` once per ctx identity.
  const toast = useMemo(() => {
    const fn = ((input: ToastInput) => push(input)) as UseToastReturn['toast'];
    fn.success = (t, m) => push({ ...normalizeShortcutArgs(t, m), tone: 'green' });
    fn.error = (t, m) => push({ ...normalizeShortcutArgs(t, m), tone: 'red' });
    fn.info = (t, m) => push({ ...normalizeShortcutArgs(t, m), tone: 'cyan' });
    fn.warning = (t, m) => push({ ...normalizeShortcutArgs(t, m), tone: 'gold' });
    fn.loading = (t, m) => push({
      ...normalizeShortcutArgs(t, m),
      tone: 'cyan',
      loading: true,
      duration: 0,
    });
    fn.update = update;
    fn.dismiss = dismiss;
    fn.promise = <T,>(
      p: Promise<T> | (() => Promise<T>),
      opts: ToastPromiseOptions<T>,
    ): Promise<T> => {
      const id = push({
        ...opts.loading,
        tone: 'cyan',
        loading: true,
        duration: 0,
      });
      const promise = typeof p === 'function' ? (p as () => Promise<T>)() : p;
      return promise.then(
        (value) => {
          const patch = typeof opts.success === 'function' ? opts.success(value) : opts.success;
          update(id, {
            tone: 'green',
            loading: false,
            duration: patch.duration ?? 4500,
            ...patch,
          });
          return value;
        },
        (err) => {
          const patch = typeof opts.error === 'function' ? opts.error(err) : opts.error;
          update(id, {
            tone: 'red',
            loading: false,
            duration: patch.duration ?? 6000,
            ...patch,
          });
          throw err;
        },
      );
    };
    return fn;
  }, [push, update, dismiss]);

  return { toast, dismiss, update, clear, toasts };
}

/* ──────────────────────────────────────────────────────────────────────────
   PxlKitToastProvider — mount once near the app root.
   ────────────────────────────────────────────────────────────────────────── */

export interface PxlKitToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  /** Maximum simultaneous toasts. Oldest is dropped if exceeded. Defaults to 5. */
  max?: number;
  surface?: Surface;
  /**
   * Sonner-style stacked-offset visual: toasts collapse into a small stack
   * showing only the front card; hover expands them into a vertical list.
   * Defaults to `true`.
   */
  stacked?: boolean;
  /** How many additional cards peek behind the front when stacked. Defaults to 2. */
  stackVisible?: number;
}

let toastSeq = 0;
const nextId = () => `pxl-toast-${++toastSeq}`;

export function PxlKitToastProvider({
  children,
  position = 'top-right',
  max = 5,
  surface,
  stacked = true,
  stackVisible = 2,
}: PxlKitToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (input: ToastInput) => {
      const id = input.id ?? nextId();
      setToasts((cur) => {
        const next = [...cur.filter((t) => t.id !== id), { id, duration: 4500, ...input }];
        return next.length > max ? next.slice(next.length - max) : next;
      });
      return id;
    },
    [max],
  );

  const update = useCallback((id: string, patch: ToastPatch) => {
    setToasts((cur) => cur.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const clear = useCallback(() => setToasts([]), []);

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, push, update, dismiss, clear }),
    [toasts, push, update, dismiss, clear],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport
        toasts={toasts}
        position={position}
        onDismiss={dismiss}
        surface={surface}
        stacked={stacked}
        stackVisible={stackVisible}
      />
    </ToastContext.Provider>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Toast viewport (portal target).
   ────────────────────────────────────────────────────────────────────────── */

const POSITION_CLASS: Record<ToastPosition, string> = {
  'top-right': 'top-4 right-4 items-end',
  'top-left': 'top-4 left-4 items-start',
  'bottom-right': 'bottom-4 right-4 items-end',
  'bottom-left': 'bottom-4 left-4 items-start',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
};

function isBottomPosition(p: ToastPosition) {
  return p.startsWith('bottom');
}

function ToastViewport({
  toasts, position, onDismiss, surface, stacked, stackVisible,
}: {
  toasts: ToastItem[];
  position: ToastPosition;
  onDismiss: (id: string) => void;
  surface?: Surface;
  stacked: boolean;
  stackVisible: number;
}) {
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted || typeof document === 'undefined') return null;

  const bottom = isBottomPosition(position);
  // Visually we want the newest toast in front. For bottom positions, newest is
  // at the top of the rendered list; for top positions, newest at the bottom.
  // Stacking puts the newest at offset 0 and older ones peeking behind.
  const ordered = bottom ? [...toasts].reverse() : toasts;
  const frontIndex = ordered.length - 1;

  return createPortal(
    <div
      // Single live region rule: each PixelToast already declares role=alert/status
      // + its own aria-live. Nesting another aria-live here causes double / dropped
      // announcements on real screen readers. Keep role=region as the landmark only.
      role="region"
      aria-label="Notifications"
      data-pxl-toast-viewport
      data-expanded={expanded ? 'true' : 'false'}
      data-stacked={stacked ? 'true' : 'false'}
      onMouseEnter={() => stacked && setExpanded(true)}
      onMouseLeave={() => stacked && setExpanded(false)}
      onFocus={() => stacked && setExpanded(true)}
      onBlur={(e) => {
        if (!stacked) return;
        // Only collapse when focus leaves the viewport entirely.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setExpanded(false);
        }
      }}
      className={cn(
        'pointer-events-none fixed z-[90] flex w-full max-w-sm flex-col gap-2 p-0',
        POSITION_CLASS[position],
      )}
    >
      {ordered.map((t, i) => {
        // Depth = how far behind the front this card is (0 = front).
        const depth = frontIndex - i;
        const visible = !stacked || expanded || depth <= stackVisible;
        const offsetPx = stacked && !expanded ? depth * 8 : 0;
        const scale = stacked && !expanded ? Math.max(0.92, 1 - depth * 0.04) : 1;
        const translateY = bottom ? -offsetPx : offsetPx;
        return (
          <div
            key={t.id}
            data-pxl-toast-slot
            data-depth={depth}
            style={{
              transform: `translateY(${translateY}px) scale(${scale})`,
              transformOrigin: bottom ? 'bottom center' : 'top center',
              opacity: visible ? 1 : 0,
              pointerEvents: visible ? undefined : 'none',
              transition: 'transform 200ms ease, opacity 200ms ease',
              zIndex: 100 + i,
            }}
            className="w-full"
          >
            <PixelToast toast={t} onDismiss={() => onDismiss(t.id)} surface={surface} />
          </div>
        );
      })}
    </div>,
    document.body,
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelToast — individual toast card.
   ────────────────────────────────────────────────────────────────────────── */

/** Public prop bag for the individual {@link PixelToast} card. Usually used
 *  through {@link useToast}, but exported for advanced custom rendering. */
export interface PixelToastProps {
  toast: ToastItem;
  onDismiss: () => void;
  surface?: Surface;
}

/** Tiny inline spinner used when `toast.loading === true`. Keeps PixelToast
 *  self-contained (no cross-module import from feedback.tsx). */
function ToastSpinner({ tone }: { tone: Tone }) {
  return (
    <span
      role="presentation"
      aria-hidden
      className={cn(
        'inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent',
        toneMap[tone].text,
      )}
    />
  );
}

export const PixelToast = forwardRef<HTMLDivElement, PixelToastProps>(function PixelToast(
  { toast, onDismiss, surface: surfaceProp },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const tone: Tone = toast.tone ?? 'cyan';
  const duration = toast.loading ? 0 : (toast.duration ?? 4500);
  const assertive = toast.assertive ?? (tone === 'red' || tone === 'gold');

  const [paused, setPaused] = useState(false);
  const start = useRef<number>(0);
  const remaining = useRef<number>(duration);

  // Keep the latest onDismiss in a ref so re-rendered ToastViewport children
  // (e.g. another toast pushed mid-duration) don't reset the auto-dismiss timer.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => { onDismissRef.current = onDismiss; }, [onDismiss]);

  // Reset the timer whenever the underlying toast changes its duration
  // (e.g. promise resolved → loading→success patch flips duration 0→4500).
  useEffect(() => {
    remaining.current = duration;
  }, [duration]);

  useEffect(() => {
    if (!duration) return;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    if (!paused) {
      start.current = Date.now();
      timeout = setTimeout(() => onDismissRef.current(), remaining.current);
    }
    return () => { if (timeout) clearTimeout(timeout); };
  }, [duration, paused]);

  const onMouseEnter = () => {
    if (!duration) return;
    remaining.current = Math.max(0, remaining.current - (Date.now() - start.current));
    setPaused(true);
  };
  const onMouseLeave = () => {
    if (!duration) return;
    setPaused(false);
  };

  const leadingIcon = toast.animatedIcon
    ?? (toast.loading ? <ToastSpinner tone={tone} /> : toast.icon);

  return (
    <div
      ref={ref}
      role={assertive ? 'alert' : 'status'}
      aria-live={assertive ? 'assertive' : 'polite'}
      aria-atomic="true"
      data-pxl-toast
      data-tone={tone}
      data-loading={toast.loading ? 'true' : 'false'}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onMouseEnter}
      onBlur={onMouseLeave}
      className={cn(
        'pointer-events-auto relative w-full max-w-sm overflow-hidden bg-retro-bg shadow-xl',
        s.border, s.radiusLg,
        toneMap[tone].border,
        'animate-in fade-in slide-in-from-top-2 duration-200',
      )}
    >
      <div className={cn('flex items-start gap-2.5 p-3 pl-4', surface === 'pixel' && 'pl-5')}>
        {surface === 'pixel' && (
          <span aria-hidden className={cn('absolute left-0 top-0 bottom-0 w-1', toneMap[tone].fill)} />
        )}
        {leadingIcon && (
          <span
            data-pxl-toast-leading
            className={cn('mt-0.5 shrink-0 inline-flex items-center justify-center', toneMap[tone].text)}
            aria-hidden
          >
            {leadingIcon}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <p className={cn('text-xs font-semibold truncate', s.font, toneMap[tone].text)}>{toast.title}</p>
          {toast.message && <p className="mt-1 text-sm text-retro-muted">{toast.message}</p>}
          {toast.action && <div className="mt-2.5">{toast.action}</div>}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="-mr-1 -mt-1 flex h-6 w-6 shrink-0 items-center justify-center text-retro-muted transition-colors hover:text-retro-text focus:outline-none focus-visible:ring-2 focus-visible:ring-retro-cyan/40"
        >
          <CloseIcon />
        </button>
      </div>
      {duration > 0 && (
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-retro-surface/40" aria-hidden>
          <div
            className={cn('h-full transition-[width] ease-linear', toneMap[tone].fill)}
            style={{
              width: paused ? `${(remaining.current / duration) * 100}%` : '0%',
              transitionDuration: paused ? '0ms' : `${remaining.current}ms`,
            }}
          />
        </div>
      )}
    </div>
  );
});
