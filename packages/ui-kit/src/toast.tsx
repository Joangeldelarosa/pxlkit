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
  /** Optional inline action (typically a {@link PixelButton} or link). */
  action?: React.ReactNode;
  /** When `true`, render with `role="alert"` (assertive). Defaults based on tone. */
  assertive?: boolean;
}

/** Input shape accepted by {@link useToast}. `id` is generated if omitted. */
export type ToastInput = Omit<ToastItem, 'id'> & { id?: string };

interface ToastContextValue {
  toasts: ToastItem[];
  push: (toast: ToastInput) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/* ──────────────────────────────────────────────────────────────────────────
   useToast — primary public API.
   ────────────────────────────────────────────────────────────────────────── */

export interface UseToastReturn {
  /** Push a toast. Returns the toast id (useful for `dismiss()`). */
  toast: (input: ToastInput) => string;
  /** Dismiss a specific toast by id. */
  dismiss: (id: string) => void;
  /** Clear every active toast immediately. */
  clear: () => void;
  /** Current active toasts (read-only). */
  toasts: ToastItem[];
}

export function useToast(): UseToastReturn {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <PxlKitToastProvider>.');
  }
  return { toast: ctx.push, dismiss: ctx.dismiss, clear: ctx.clear, toasts: ctx.toasts };
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
}

let toastSeq = 0;
const nextId = () => `pxl-toast-${++toastSeq}`;

export function PxlKitToastProvider({
  children,
  position = 'top-right',
  max = 5,
  surface,
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

  const clear = useCallback(() => setToasts([]), []);

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, push, dismiss, clear }),
    [toasts, push, dismiss, clear],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} position={position} onDismiss={dismiss} surface={surface} />
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

function ToastViewport({
  toasts, position, onDismiss, surface,
}: {
  toasts: ToastItem[];
  position: ToastPosition;
  onDismiss: (id: string) => void;
  surface?: Surface;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted || typeof document === 'undefined') return null;
  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="false"
      role="region"
      aria-label="Notifications"
      className={cn(
        'pointer-events-none fixed z-[90] flex w-full max-w-sm flex-col gap-2 p-0',
        POSITION_CLASS[position],
      )}
    >
      {toasts.map((t) => (
        <PixelToast key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} surface={surface} />
      ))}
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

export const PixelToast = forwardRef<HTMLDivElement, PixelToastProps>(function PixelToast(
  { toast, onDismiss, surface: surfaceProp },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const tone: Tone = toast.tone ?? 'cyan';
  const duration = toast.duration ?? 4500;
  const assertive = toast.assertive ?? (tone === 'red' || tone === 'gold');

  const [paused, setPaused] = useState(false);
  const start = useRef<number>(0);
  const remaining = useRef<number>(duration);

  useEffect(() => {
    if (!duration) return;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const schedule = () => {
      start.current = Date.now();
      timeout = setTimeout(onDismiss, remaining.current);
    };
    if (!paused) schedule();
    return () => { if (timeout) clearTimeout(timeout); };
  }, [duration, paused, onDismiss]);

  const onMouseEnter = () => {
    if (!duration) return;
    remaining.current = Math.max(0, remaining.current - (Date.now() - start.current));
    setPaused(true);
  };
  const onMouseLeave = () => {
    if (!duration) return;
    setPaused(false);
  };

  return (
    <div
      ref={ref}
      role={assertive ? 'alert' : 'status'}
      aria-live={assertive ? 'assertive' : 'polite'}
      aria-atomic="true"
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
        {toast.icon && (
          <span className={cn('mt-0.5 shrink-0 inline-flex items-center justify-center', toneMap[tone].text)} aria-hidden>
            {toast.icon}
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
