import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  NO_TOAST_MESSAGES,
  TOAST_DURATION,
  TOAST_HOTKEY,
  TOAST_MAX,
  TOAST_STACK_VISIBLE,
  addToast,
  createToastAnnouncer,
  createToastFn,
  isToastHotkey,
  keepToastFocus,
  liveToastMessages,
  removeToast,
  toToastItem,
  toastFocusOrigin,
  toastLiveRegionClasses,
  toastSlotClasses,
  toastSlots,
  toastViewportClasses,
  toastViewportLabel,
  updateToast,
  type ToastFn,
  type ToastInput as ToastInputOf,
  type ToastItem as ToastItemOf,
  type ToastLiveRegions,
  type ToastPatch as ToastPatchOf,
  type ToastPosition as CoreToastPosition,
  type ToastPromiseOptions as ToastPromiseOptionsOf,
  type ToastShortcut as ToastShortcutOf,
} from '@pxlkit/ui-kit-core';
import { Tone, Surface } from '../common';
import { useEventListener } from '../hooks/useEventListener';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
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
  /** The provider's auto-dismiss delay, which a settled promise toast takes. */
  duration: number;
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
  const { push, update, dismiss, clear, toasts, duration } = ctx;

  // Build the callable+attached `toast` once per ctx identity.
  const toast = useMemo(
    () => createToastFn<React.ReactNode>({ push, update, dismiss }, () => duration),
    [push, update, dismiss, duration],
  );

  return { toast, dismiss, update, clear, toasts };
}

/* ──────────────────────────────────────────────────────────────────────────
   PxlKitToastProvider — mount once near the app root.
   ────────────────────────────────────────────────────────────────────────── */

export interface PxlKitToastProviderProps {
  /** The part of the app that shows toasts: `useToast()` works inside it. */
  children: React.ReactNode;
  /** Corner, or edge centre, of the screen the toasts appear at. */
  position?: ToastPosition;
  /** Maximum simultaneous toasts. Oldest is dropped if exceeded. Defaults to 5. */
  max?: number;
  /**
   * Auto-dismiss delay, in ms, of the toasts that set no `duration` of their
   * own; `0` keeps them until dismissed. Defaults to 4500. A promise's error
   * toast stays at least 6 s, unless this is `0`.
   */
  duration?: number;
  /**
   * Key that moves focus to the toasts, written like `F8` or `alt+t`, or
   * `false` for none. Defaults to `F8`; the viewport's accessible name tells it.
   */
  hotkey?: string | false;
  /** Surface of the toasts; defaults to the nearest provider. */
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
  duration = TOAST_DURATION,
  hotkey = TOAST_HOTKEY,
  surface,
  stacked = true,
  stackVisible = TOAST_STACK_VISIBLE,
}: PxlKitToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  // The queue as last changed, ahead of the render that shows it.
  const queue = useRef<ToastItem[]>([]);
  const [messages, setMessages] = useState<ToastLiveRegions>(NO_TOAST_MESSAGES);
  const [announce] = useState(() => createToastAnnouncer(setMessages));
  const viewport = useRef<HTMLDivElement>(null);
  // Where focus entered the viewport from: it goes back there once no toast is left.
  const returnTo = useRef<HTMLElement | null>(null);
  const restoreFocus = useRef<(() => void) | undefined>(undefined);

  // A toast that leaves while it holds focus hands it on once the change
  // has rendered.
  const change = useCallback((next: ToastItem[]) => {
    restoreFocus.current ??= keepToastFocus(viewport.current, () => returnTo.current);
    queue.current = next;
    setToasts(next);
  }, []);

  useIsomorphicLayoutEffect(() => {
    restoreFocus.current?.();
    restoreFocus.current = undefined;
  }, [toasts]);

  const dismiss = useCallback((id: string) => change(removeToast(queue.current, id)), [change]);

  const push = useCallback(
    (input: ToastInput) => {
      const toast = toToastItem(input, duration);
      change(addToast(queue.current, toast, max));
      announce(toast);
      return toast.id;
    },
    [change, announce, max, duration],
  );

  const update = useCallback(
    (id: string, patch: ToastPatch) => {
      const previous = queue.current.find((t) => t.id === id);
      change(updateToast(queue.current, id, patch));
      const toast = queue.current.find((t) => t.id === id);
      if (toast) announce(toast, previous);
    },
    [change, announce],
  );

  const clear = useCallback(() => change([]), [change]);

  // The hotkey takes focus to the toasts on screen.
  useEventListener(
    'keydown',
    (e) => {
      if (!queue.current.length || !isToastHotkey(e, hotkey)) return;
      e.preventDefault();
      viewport.current?.focus();
    },
    typeof window !== 'undefined' ? window : null,
  );

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, push, update, dismiss, clear, duration }),
    [toasts, push, update, dismiss, clear, duration],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport
        viewportRef={viewport}
        returnTo={returnTo}
        toasts={toasts}
        messages={liveToastMessages(messages, toasts)}
        label={toastViewportLabel(hotkey)}
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
  viewportRef, returnTo, toasts, messages, label, position, onDismiss, surface, stacked, stackVisible,
}: {
  viewportRef: React.RefObject<HTMLDivElement | null>;
  returnTo: React.RefObject<HTMLElement | null>;
  toasts: ToastItem[];
  messages: ToastLiveRegions;
  label: string;
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
      ref={viewportRef}
      // A landmark the hotkey moves focus to, from where Tab reaches the
      // toasts' buttons. The toasts are announced by the two live regions
      // inside it, on the page before any toast: a region inserted with its
      // text already in it — as each card used to be — is read unreliably.
      role="region"
      aria-label={label}
      tabIndex={-1}
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
      onFocus={(e) => {
        returnTo.current = toastFocusOrigin(e.currentTarget, e.relatedTarget) ?? returnTo.current;
        if (stacked) setFocused(true);
      }}
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
      <div role="status" className={toastLiveRegionClasses}>
        {messages.polite.map((message) => <p key={message.key}>{message.text}</p>)}
      </div>
      <div role="alert" className={toastLiveRegionClasses}>
        {messages.assertive.map((message) => <p key={message.key}>{message.text}</p>)}
      </div>
    </div>,
    document.body,
  );
}
