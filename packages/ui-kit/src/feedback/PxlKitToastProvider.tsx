import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  TOAST_MAX,
  TOAST_STACK_VISIBLE,
  TOAST_VIEWPORT_LABEL,
  addToast,
  createToastFn,
  removeToast,
  toToastItem,
  toastSlotClasses,
  toastSlots,
  toastViewportClasses,
  updateToast,
  type ToastFn,
  type ToastInput as ToastInputOf,
  type ToastItem as ToastItemOf,
  type ToastPatch as ToastPatchOf,
  type ToastPosition as CoreToastPosition,
  type ToastPromiseOptions as ToastPromiseOptionsOf,
  type ToastShortcut as ToastShortcutOf,
} from '@pxlkit/ui-kit-core';
import { Tone, Surface } from '../common';
// PixelToast.tsx imports `ToastItem` (and friends) back from this module as
// type-only imports (erased at runtime), so this value import does NOT form a
// runtime cycle.
import { PixelToast } from './PixelToast';

/* ──────────────────────────────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────────────────────────────── */

export type ToastTone = Tone;
export type ToastPosition = CoreToastPosition;

/**
 * Shape of an individual toast notification. `icon`, `animatedIcon` (e.g.
 * `<AnimatedPxlKitIcon …/>`, which wins over `icon`) and `action` (typically
 * a {@link PixelButton} or link) take React nodes.
 */
export type ToastItem = ToastItemOf<React.ReactNode>;

/** Input shape accepted by {@link useToast}. `id` is generated if omitted. */
export type ToastInput = ToastInputOf<React.ReactNode>;

/** Patch shape for {@link UseToastReturn.update}. */
export type ToastPatch = ToastPatchOf<React.ReactNode>;

/** Options for {@link UseToastReturn.promise}. */
export type ToastPromiseOptions<T> = ToastPromiseOptionsOf<T, React.ReactNode>;

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
export type ToastShortcut = ToastShortcutOf<React.ReactNode>;

export interface UseToastReturn {
  /** Push a toast. Returns the toast id (useful for `dismiss()`). */
  toast: ToastFn<React.ReactNode>;
  /** Dismiss a specific toast by id. */
  dismiss: (id: string) => void;
  /** Update an existing toast in place (merge patch). */
  update: (id: string, patch: ToastPatch) => void;
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
  const { push, update, dismiss, clear, toasts } = ctx;

  // Build the callable+attached `toast` once per ctx identity.
  const toast = useMemo(() => createToastFn<React.ReactNode>({ push, update, dismiss }), [push, update, dismiss]);

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

export function PxlKitToastProvider({
  children,
  position = 'top-right',
  max = TOAST_MAX,
  surface,
  stacked = true,
  stackVisible = TOAST_STACK_VISIBLE,
}: PxlKitToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((cur) => removeToast(cur, id));
  }, []);

  const push = useCallback(
    (input: ToastInput) => {
      const toast = toToastItem(input);
      setToasts((cur) => addToast(cur, toast, max));
      return toast.id;
    },
    [max],
  );

  const update = useCallback((id: string, patch: ToastPatch) => {
    setToasts((cur) => updateToast(cur, id, patch));
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
  // Hovered or focused, a stack opens into a list — and stays open until
  // both the pointer and focus have left.
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted || typeof document === 'undefined') return null;

  const expanded = hovered || focused;

  return createPortal(
    <div
      // Single live region rule: each PixelToast already declares role=alert/status
      // + its own aria-live. Nesting another aria-live here causes double / dropped
      // announcements on real screen readers. Keep role=region as the landmark only.
      role="region"
      aria-label={TOAST_VIEWPORT_LABEL}
      data-pxl-toast-viewport
      data-expanded={expanded ? 'true' : 'false'}
      data-stacked={stacked ? 'true' : 'false'}
      onMouseEnter={() => stacked && setHovered(true)}
      onMouseLeave={(e) => {
        if (!stacked) return;
        setHovered(false);
        // Removing the focused toast takes focus away, and need not fire a blur.
        setFocused(e.currentTarget.contains(document.activeElement));
      }}
      onFocus={() => stacked && setFocused(true)}
      onBlur={(e) => {
        if (!stacked) return;
        // Only collapse when focus leaves the viewport entirely.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setFocused(false);
        }
      }}
      className={toastViewportClasses(position)}
    >
      {toastSlots(toasts, { position, stacked, expanded, stackVisible }).map(({ toast, depth, style }) => (
        <div key={toast.id} data-pxl-toast-slot data-depth={depth} style={style} className={toastSlotClasses}>
          <PixelToast toast={toast} onDismiss={() => onDismiss(toast.id)} surface={surface} />
        </div>
      ))}
    </div>,
    document.body,
  );
}
