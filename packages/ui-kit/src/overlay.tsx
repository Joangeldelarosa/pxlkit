import React, { forwardRef, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  autoUpdate,
  flip,
  offset as floatingOffset,
  shift,
  useFloating,
  type Placement,
} from '@floating-ui/react-dom';
import {
  Tone, Surface, Option, cn, useClickOutside,
  surfaceClasses, useEffectiveSurface,
  ChevronDownIcon, CloseIcon,
} from './common';
import { PixelButton } from './actions';
import { usePxlKitLocale } from './locale';
import { PixelPortal } from './overlay-foundation/PixelPortal';
import { useFocusTrap } from './hooks/useFocusTrap';
import { useScrollLock } from './hooks/useScrollLock';
import { useEscape } from './hooks/useEscape';
import { useControllableState } from './hooks/useControllableState';
import { useReducedMotion } from './hooks/useReducedMotion';

/* ──────────────────────────────────────────────────────────────────────────
   PixelModal — dialog with title bar (pixel surface = old-school window).
   ────────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelModal}. */
export interface PixelModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  surface?: Surface;
  /** Optional override for the close button's accessible label. */
  closeLabel?: string;
  /** Optional footer node, rendered at the bottom separated by a surface-aware divider. */
  footer?: React.ReactNode;
  /** Optional description, wired via `aria-describedby` for AT users. */
  description?: React.ReactNode;
  /**
   * When provided, the close button awaits this promise (and shows a loading
   * state) before the consumer-controlled `onClose` is invoked. Lets callers
   * persist or animate-out before unmounting.
   */
  asyncClose?: () => Promise<void>;
  /** Optional portal container override. Defaults to `document.body`. */
  container?: HTMLElement | null;
}

export const PixelModal = forwardRef<HTMLDivElement, PixelModalProps>(function PixelModal({
  open, title, children, onClose,
  size = 'md',
  surface: surfaceProp,
  closeLabel = 'Close',
  footer,
  description,
  asyncClose,
  container,
}, forwardedRef) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const { upper } = usePxlKitLocale();
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const reducedMotion = useReducedMotion();
  const pulseClass = reducedMotion ? '' : 'animate-pulse';

  const setRefs = useCallback((node: HTMLDivElement | null) => {
    (dialogRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef && typeof forwardedRef === 'object') {
      (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  }, [forwardedRef]);

  useFocusTrap(open, dialogRef);
  useScrollLock(open);
  useEscape(() => { if (!closing) void handleClose(); }, open);

  async function handleClose() {
    if (asyncClose) {
      try {
        setClosing(true);
        await asyncClose();
      } finally {
        setClosing(false);
        onClose();
      }
      return;
    }
    onClose();
  }

  if (!open) return null;

  const maxW =
    size === 'sm' ? 'max-w-sm' :
    size === 'lg' ? 'max-w-2xl' :
    size === 'xl' ? 'max-w-4xl' :
    size === 'full' ? 'max-w-[95vw] max-h-[95vh] overflow-y-auto' :
    'max-w-md';

  const dividerClass = surface === 'pixel'
    ? 'border-t-2 border-retro-border'
    : 'border-t border-retro-border';

  return (
    <PixelPortal container={container}>
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
      >
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => { if (!closing) void handleClose(); }}
          aria-hidden="true"
        />
        <div
          ref={setRefs}
          className={cn(
            'relative w-full bg-retro-bg shadow-2xl',
            s.border, s.radiusLg, 'border-retro-border',
            surface === 'pixel' ? 'p-0' : 'p-5',
            maxW,
          )}
        >
          {surface === 'pixel' ? (
            <>
              <div className={cn('flex items-center justify-between border-b-2 border-retro-border bg-retro-surface/60 px-3 py-2')}>
                <h4 id={titleId} className="font-pixel text-[11px] text-retro-green">{upper(title)}</h4>
                <button
                  type="button"
                  onClick={() => { void handleClose(); }}
                  aria-label={closeLabel}
                  aria-busy={closing || undefined}
                  disabled={closing}
                  className={cn(
                    'flex h-6 w-6 items-center justify-center border-2 border-retro-border text-retro-muted transition-colors hover:bg-retro-red/10 hover:border-retro-red/40 hover:text-retro-red focus:outline-none focus-visible:ring-2 focus-visible:ring-retro-red/40',
                    closing && 'opacity-60 cursor-wait',
                  )}
                >
                  {closing ? <span aria-hidden className={cn('block h-2 w-2 bg-retro-muted', pulseClass)} /> : <CloseIcon />}
                </button>
              </div>
              <div className="p-5 text-sm text-retro-muted">
                {description && <p id={descId} className="mb-3 text-xs text-retro-muted/80">{description}</p>}
                {children}
              </div>
              {footer && (
                <div className={cn(dividerClass, 'flex items-center justify-end gap-2 bg-retro-surface/40 px-5 py-3')}>
                  {footer}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h4 id={titleId} className={cn('text-base font-semibold text-retro-text', s.fontDisplay)}>{upper(title)}</h4>
                <button
                  type="button"
                  onClick={() => { void handleClose(); }}
                  aria-label={closeLabel}
                  aria-busy={closing || undefined}
                  disabled={closing}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-md border border-retro-border text-retro-muted transition-colors hover:bg-retro-surface hover:text-retro-text focus:outline-none focus-visible:ring-2 focus-visible:ring-retro-cyan/40',
                    closing && 'opacity-60 cursor-wait',
                  )}
                >
                  {closing ? <span aria-hidden className={cn('block h-2 w-2 rounded-full bg-retro-muted', pulseClass)} /> : <CloseIcon />}
                </button>
              </div>
              {description && <p id={descId} className="mb-3 text-xs text-retro-muted/80">{description}</p>}
              <div className="text-sm text-retro-muted">{children}</div>
              {footer && (
                <div className={cn(dividerClass, 'mt-5 flex items-center justify-end gap-2 pt-4')}>
                  {footer}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PixelPortal>
  );
});
PixelModal.displayName = 'PixelModal';

/* ──────────────────────────────────────────────────────────────────────────
   PixelTooltip — floating-ui-positioned tooltip with hover/click/focus
   triggers, controlled/uncontrolled state, and ReactNode content. Renders
   into a portal so it escapes overflow/transform ancestors.
   ────────────────────────────────────────────────────────────────────────── */

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
type TooltipTrigger = 'hover' | 'click' | 'focus';

/** Public prop bag for {@link PixelTooltip}. */
export interface PixelTooltipProps {
  /** Tooltip body. Accepts any ReactNode; falls back to {@link PixelTooltipProps.label} when omitted. */
  content?: React.ReactNode;
  /** Backwards-compat string alias for {@link PixelTooltipProps.content}. */
  label?: string;
  children: React.ReactNode;
  /** Preferred placement. floating-ui will flip/shift away from viewport edges. */
  position?: TooltipPosition;
  surface?: Surface;
  /**
   * Open/close delays in ms. A bare `number` is treated as `{ open }` for
   * backwards-compat with the previous API. Defaults to `{ open: 200, close: 100 }`.
   */
  delay?: number | { open?: number; close?: number };
  /** Controlled open state. When provided, the tooltip ignores its internal state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called whenever the tooltip wants to change open state (controlled or uncontrolled). */
  onOpenChange?: (open: boolean) => void;
  /** How the tooltip opens. Default `'hover'`. */
  trigger?: TooltipTrigger;
  /** Distance in px from the trigger. Default `8`. */
  sideOffset?: number;
}

const DEFAULT_OPEN_DELAY = 200;
const DEFAULT_CLOSE_DELAY = 100;

function resolveDelays(delay: PixelTooltipProps['delay']): { open: number; close: number } {
  if (typeof delay === 'number') return { open: delay, close: DEFAULT_CLOSE_DELAY };
  return {
    open: delay?.open ?? DEFAULT_OPEN_DELAY,
    close: delay?.close ?? DEFAULT_CLOSE_DELAY,
  };
}

export const PixelTooltip = forwardRef<HTMLSpanElement, PixelTooltipProps>(function PixelTooltip({
  content,
  label,
  children,
  position = 'top',
  surface: surfaceProp,
  delay,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  trigger = 'hover',
  sideOffset = 8,
}, forwardedRef) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const tipId = useId();
  const delays = useMemo(() => resolveDelays(delay), [delay]);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const floatingNodeRef = useRef<HTMLSpanElement | null>(null);

  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const { refs, floatingStyles } = useFloating({
    open,
    placement: position as Placement,
    whileElementsMounted: autoUpdate,
    middleware: [floatingOffset(sideOffset), flip(), shift({ padding: 8 })],
  });

  const clearTimers = useCallback(() => {
    if (openTimer.current) { clearTimeout(openTimer.current); openTimer.current = null; }
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  }, []);

  const scheduleOpen = useCallback(() => {
    clearTimers();
    if (delays.open <= 0) { setOpen(true); return; }
    openTimer.current = setTimeout(() => setOpen(true), delays.open);
  }, [clearTimers, delays.open, setOpen]);

  const scheduleClose = useCallback(() => {
    clearTimers();
    if (delays.close <= 0) { setOpen(false); return; }
    closeTimer.current = setTimeout(() => setOpen(false), delays.close);
  }, [clearTimers, delays.close, setOpen]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // Click-trigger needs explicit dismissal: outside-pointerdown + Escape.
  useEffect(() => {
    if (trigger !== 'click' || !open) return;
    const handler = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (wrapperRef.current?.contains(target)) return;
      if (floatingNodeRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [trigger, open, setOpen]);
  useEscape(() => setOpen(false), trigger === 'click' && open);

  const triggerProps: React.HTMLAttributes<HTMLSpanElement> = {};
  if (trigger === 'hover') {
    triggerProps.onMouseEnter = scheduleOpen;
    triggerProps.onMouseLeave = scheduleClose;
    triggerProps.onFocus = scheduleOpen;
    triggerProps.onBlur = scheduleClose;
  } else if (trigger === 'focus') {
    triggerProps.onFocus = scheduleOpen;
    triggerProps.onBlur = scheduleClose;
  } else if (trigger === 'click') {
    triggerProps.onClick = () => { clearTimers(); setOpen(!open); };
    // Make wrapper focusable so keyboard users can open a click tooltip.
    triggerProps.tabIndex = 0;
    triggerProps.onKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        clearTimers();
        setOpen(!open);
      }
    };
    triggerProps.role = 'button';
    (triggerProps as Record<string, unknown>)['aria-expanded'] = open;
    (triggerProps as Record<string, unknown>)['aria-controls'] = open ? tipId : undefined;
  }

  const setWrapperRef = (node: HTMLSpanElement | null) => {
    wrapperRef.current = node;
    (refs.setReference as unknown as (n: HTMLSpanElement | null) => void)(node);
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef && typeof forwardedRef === 'object') {
      (forwardedRef as React.MutableRefObject<HTMLSpanElement | null>).current = node;
    }
  };

  const setFloatingRef = (node: HTMLSpanElement | null) => {
    floatingNodeRef.current = node;
    (refs.setFloating as unknown as (n: HTMLSpanElement | null) => void)(node);
  };

  const body = content ?? label;

  return (
    <>
      <span
        ref={setWrapperRef}
        className="relative inline-flex"
        aria-describedby={open ? tipId : undefined}
        {...triggerProps}
      >
        {children}
      </span>
      {open && body != null && (
        <PixelPortal>
          <span
            ref={setFloatingRef}
            id={tipId}
            role="tooltip"
            style={{ ...floatingStyles, zIndex: 70 }}
            className={cn(
              'whitespace-nowrap bg-retro-bg px-2 py-1 text-[11px] text-retro-text shadow-lg',
              // Hover/focus tooltips are non-interactive; click tooltips
              // must accept clicks (e.g. to copy text or click links inside).
              trigger === 'click' ? '' : 'pointer-events-none',
              s.border, s.radius, s.font, 'border-retro-border',
            )}
          >
            {body}
          </span>
        </PixelPortal>
      )}
    </>
  );
});
PixelTooltip.displayName = 'PixelTooltip';

/* ──────────────────────────────────────────────────────────────────────────
   PixelDropdown — button + dropdown menu of actions, keyboard navigable.

   Two APIs supported additively:
   1. items[] sugar (legacy): <PixelDropdown items={[…]} onSelect={…} />
   2. Compositional: <PixelDropdown.Root><Trigger><Content><Item/></Content></PixelDropdown.Root>

   Option kinds (in items[] form):
   - 'item'      (default) — selectable row.
   - 'separator' — horizontal divider, non-interactive.
   - 'header'    — group label, non-interactive.
   - 'submenu'   — placeholder kind (renders chevron, not yet nested-navigable).
   - 'checkbox'  — toggleable row, shows ✓ when selected.
   - 'radio'     — exclusive selection row, shows ● when selected.

   Extra fields:
   - shortcut    — kbd string rendered right-aligned ("⌘K", "Ctrl+S").
   - tone        — 'red' (and others) tones styling; 'red' = destructive.
   - disabled    — non-interactive, skipped by keyboard.

   Typeahead: while open, typing a printable character jumps highlight to the
   first item whose label starts with the typed prefix (resets after 600ms).
   ────────────────────────────────────────────────────────────────────────── */

export type DropdownItemKind = 'item' | 'separator' | 'header' | 'submenu' | 'checkbox' | 'radio';

/**
 * Extended option shape accepted by {@link PixelDropdown} via `items[]`.
 * Backward-compat: plain `{value,label,icon}` still works (defaults to `kind:'item'`).
 */
export type DropdownOption = Option & {
  disabled?: boolean;
  tone?: Tone;
  kind?: DropdownItemKind;
  shortcut?: string;
  /** For 'checkbox'/'radio' kinds: current checked state (display-only). */
  checked?: boolean;
};

/** Public prop bag for {@link PixelDropdown}. */
export interface PixelDropdownProps {
  label?: string;
  items?: DropdownOption[];
  onSelect?: (value: string) => void;
  tone?: Tone;
  icon?: React.ReactNode;
  disabled?: boolean;
  surface?: Surface;
  /** ARIA label override when the trigger label is purely decorative. */
  ariaLabel?: string;
  /** When using compositional API, children replace items[] rendering. */
  children?: React.ReactNode;
}

/* ─── Compositional context ─────────────────────────────────────────────── */

interface DropdownContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  surface: Surface;
  menuId: string;
  highlightedValue: string | null;
  setHighlightedValue: (v: string | null) => void;
  registerItem: (value: string, disabled: boolean) => void;
  unregisterItem: (value: string) => void;
  getOrderedValues: () => string[];
  typeaheadJump: (char: string) => void;
  labelMap: Map<string, string>;
  registerItemHandler: (value: string, onSelect: (() => void) | undefined) => void;
  selectHighlighted: () => void;
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

function useDropdownContext(component: string): DropdownContextValue {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error(`${component} must be used inside <PixelDropdown.Root>`);
  return ctx;
}

const TYPEAHEAD_RESET_MS = 600;

function isItemKindSelectable(kind: DropdownItemKind): boolean {
  return kind === 'item' || kind === 'checkbox' || kind === 'radio' || kind === 'submenu';
}

function isPrintableChar(key: string): boolean {
  return key.length === 1 && !!key.match(/\S/);
}

function toneTextClass(tone: Tone | undefined): string {
  if (!tone) return '';
  if (tone === 'red') return 'text-retro-red';
  if (tone === 'green') return 'text-retro-green';
  if (tone === 'cyan') return 'text-retro-cyan';
  if (tone === 'gold') return 'text-retro-gold';
  if (tone === 'purple') return 'text-retro-purple';
  if (tone === 'pink') return 'text-retro-pink';
  return '';
}

/* ─── Root / compositional sub-components ───────────────────────────────── */

interface DropdownRootProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  surface?: Surface;
  children: React.ReactNode;
}

function DropdownRoot({ open: openProp, defaultOpen = false, onOpenChange, surface: surfaceProp, children }: DropdownRootProps) {
  const surface = useEffectiveSurface(surfaceProp);
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<{ value: string; disabled: boolean }[]>([]);
  const labelMapRef = useRef<Map<string, string>>(new Map());
  const onSelectMapRef = useRef<Map<string, (() => void) | undefined>>(new Map());
  const highlightedValueRef = useRef<string | null>(null);
  const [highlightedValue, _setHighlightedValue] = useState<string | null>(null);
  const setHighlightedValue = useCallback((v: string | null) => {
    highlightedValueRef.current = v;
    _setHighlightedValue(v);
  }, []);
  const typeaheadBuf = useRef<string>('');
  const typeaheadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const registerItem = useCallback((value: string, disabled: boolean) => {
    const existing = itemsRef.current.findIndex((i) => i.value === value);
    if (existing >= 0) itemsRef.current[existing] = { value, disabled };
    else itemsRef.current.push({ value, disabled });
  }, []);
  const unregisterItem = useCallback((value: string) => {
    itemsRef.current = itemsRef.current.filter((i) => i.value !== value);
    labelMapRef.current.delete(value);
    onSelectMapRef.current.delete(value);
  }, []);
  const registerItemHandler = useCallback((value: string, onSelect: (() => void) | undefined) => {
    onSelectMapRef.current.set(value, onSelect);
  }, []);
  const getOrderedValues = useCallback(() => itemsRef.current.filter((i) => !i.disabled).map((i) => i.value), []);
  const selectHighlighted = useCallback(() => {
    const v = highlightedValueRef.current;
    if (!v) return;
    const handler = onSelectMapRef.current.get(v);
    handler?.();
    setOpen(false);
    setHighlightedValue(null);
  }, [setHighlightedValue, setOpen]);

  const typeaheadJump = useCallback((char: string) => {
    if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
    typeaheadBuf.current = (typeaheadBuf.current + char).toLowerCase();
    const buf = typeaheadBuf.current;
    const ordered = getOrderedValues();
    // Prefer items whose label starts with buf; fall back to substring match.
    let match = ordered.find((v) => (labelMapRef.current.get(v) || '').toLowerCase().startsWith(buf));
    if (!match) match = ordered.find((v) => (labelMapRef.current.get(v) || '').toLowerCase().includes(buf));
    if (match) setHighlightedValue(match);
    typeaheadTimer.current = setTimeout(() => { typeaheadBuf.current = ''; }, TYPEAHEAD_RESET_MS);
  }, [getOrderedValues]);

  useClickOutside(containerRef, () => { setOpen(false); setHighlightedValue(null); });
  useEscape(() => { setOpen(false); setHighlightedValue(null); }, open);
  useEffect(() => { if (!open) setHighlightedValue(null); }, [open]);
  useEffect(() => () => { if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current); }, []);

  const labelMap = labelMapRef.current;
  const ctx: DropdownContextValue = useMemo(() => ({
    open, setOpen, surface, menuId,
    highlightedValue, setHighlightedValue,
    registerItem, unregisterItem, getOrderedValues, typeaheadJump,
    labelMap,
    registerItemHandler,
    selectHighlighted,
  }), [open, setOpen, surface, menuId, highlightedValue, setHighlightedValue, registerItem, unregisterItem, getOrderedValues, typeaheadJump, labelMap, registerItemHandler, selectHighlighted]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const ordered = getOrderedValues();
      if (ordered.length === 0) return;
      if (!open) { setOpen(true); setHighlightedValue(ordered[0]); return; }
      const idx = highlightedValue ? ordered.indexOf(highlightedValue) : -1;
      const next = e.key === 'ArrowDown'
        ? ordered[Math.min(idx + 1, ordered.length - 1)]
        : ordered[Math.max(idx - 1, 0)];
      setHighlightedValue(next ?? ordered[0]);
      return;
    }
    if (e.key === 'Home') {
      e.preventDefault();
      const ordered = getOrderedValues();
      if (ordered.length) { setOpen(true); setHighlightedValue(ordered[0]); }
      return;
    }
    if (e.key === 'End') {
      e.preventDefault();
      const ordered = getOrderedValues();
      if (ordered.length) { setOpen(true); setHighlightedValue(ordered[ordered.length - 1]); }
      return;
    }
    if ((e.key === 'Enter' || e.key === ' ') && open && highlightedValueRef.current) {
      e.preventDefault();
      selectHighlighted();
      return;
    }
    if (open && isPrintableChar(e.key)) {
      typeaheadJump(e.key);
    }
  };

  return (
    <DropdownContext.Provider value={ctx}>
      <div ref={containerRef} className="relative inline-block" onKeyDown={onKey}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

interface DropdownTriggerProps {
  children?: React.ReactNode;
  tone?: Tone;
  icon?: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
}

const DropdownTrigger = forwardRef<HTMLButtonElement, DropdownTriggerProps>(function DropdownTrigger(
  { children, tone = 'neutral', icon, disabled = false, ariaLabel },
  ref,
) {
  const { open, setOpen, surface, menuId } = useDropdownContext('PixelDropdown.Trigger');
  return (
    <PixelButton
      ref={ref}
      tone={tone}
      surface={surface}
      disabled={disabled}
      iconRight={icon ?? <ChevronDownIcon className={cn('transition-transform', open && 'rotate-180')} />}
      onClick={() => setOpen(!open)}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={open ? menuId : undefined}
      aria-label={ariaLabel}
    >
      {children}
    </PixelButton>
  );
});
DropdownTrigger.displayName = 'PixelDropdown.Trigger';

interface DropdownContentProps {
  children?: React.ReactNode;
  className?: string;
}

const DropdownContent = forwardRef<HTMLDivElement, DropdownContentProps>(function DropdownContent(
  { children, className },
  ref,
) {
  const { open, surface, menuId } = useDropdownContext('PixelDropdown.Content');
  const s = surfaceClasses(surface);
  if (!open) return null;
  return (
    <div
      ref={ref}
      id={menuId}
      role="menu"
      aria-orientation="vertical"
      className={cn(
        'absolute left-0 top-full z-40 mt-1.5 min-w-44 bg-retro-bg p-1 shadow-xl',
        s.border, s.radiusLg, 'border-retro-border',
        className,
      )}
    >
      {children}
    </div>
  );
});
DropdownContent.displayName = 'PixelDropdown.Content';

interface DropdownItemProps {
  value?: string;
  children: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  /** Visually marks the row red; equivalent to `tone="red"`. */
  destructive?: boolean;
  tone?: Tone;
  icon?: React.ReactNode;
  shortcut?: string;
}

const DropdownItem = forwardRef<HTMLButtonElement, DropdownItemProps>(function DropdownItem(
  { value, children, onSelect, disabled = false, destructive = false, tone, icon, shortcut },
  ref,
) {
  const { setOpen, surface, highlightedValue, setHighlightedValue, registerItem, unregisterItem, labelMap, registerItemHandler } = useDropdownContext('PixelDropdown.Item');
  const s = surfaceClasses(surface);
  const autoIdRaw = useId();
  const itemValue = value ?? autoIdRaw;
  const effectiveTone: Tone | undefined = destructive ? 'red' : tone;

  useEffect(() => {
    registerItem(itemValue, disabled);
    if (typeof children === 'string') labelMap.set(itemValue, children);
    return () => unregisterItem(itemValue);
  }, [itemValue, disabled, registerItem, unregisterItem, labelMap, children]);

  // Keep the latest onSelect handler registered for keyboard activation.
  useEffect(() => {
    registerItemHandler(itemValue, disabled ? undefined : onSelect);
  }, [itemValue, disabled, onSelect, registerItemHandler]);

  const isHighlighted = highlightedValue === itemValue;

  return (
    <button
      ref={ref}
      type="button"
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      data-highlighted={isHighlighted || undefined}
      disabled={disabled}
      className={cn(
        'flex w-full items-center px-3 py-2 text-left text-xs text-retro-muted transition-colors hover:bg-retro-surface hover:text-retro-text',
        isHighlighted && 'bg-retro-surface text-retro-text',
        disabled && 'cursor-not-allowed opacity-50',
        toneTextClass(effectiveTone),
        s.font, s.radius,
      )}
      onMouseEnter={() => { if (!disabled) setHighlightedValue(itemValue); }}
      onClick={() => {
        if (disabled) return;
        onSelect?.();
        setOpen(false);
      }}
    >
      {icon && <span className="mr-2 inline-flex items-center justify-center opacity-80 shrink-0">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
      {shortcut && (
        <kbd
          data-testid="dropdown-shortcut"
          className={cn(
            'ml-3 inline-flex items-center gap-0.5 border px-1.5 py-0.5 text-[10px] text-retro-muted',
            s.border, s.radius, 'border-retro-border', s.font,
          )}
        >
          {shortcut}
        </kbd>
      )}
    </button>
  );
});
DropdownItem.displayName = 'PixelDropdown.Item';

function DropdownSeparator() {
  return <div role="separator" data-testid="dropdown-separator" className="my-1 h-px bg-retro-border/60" />;
}
(DropdownSeparator as React.FC).displayName = 'PixelDropdown.Separator';

function DropdownHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="presentation"
      data-testid="dropdown-header"
      className="px-3 pt-2 pb-1 text-[10px] font-pixel uppercase tracking-wider text-retro-muted/70"
    >
      {children}
    </div>
  );
}
(DropdownHeader as React.FC<{ children: React.ReactNode }>).displayName = 'PixelDropdown.Header';

interface DropdownCheckboxItemProps extends Omit<DropdownItemProps, 'icon'> {
  checked?: boolean;
}

const DropdownCheckboxItem = forwardRef<HTMLButtonElement, DropdownCheckboxItemProps>(function DropdownCheckboxItem(
  { checked, children, ...rest },
  ref,
) {
  return (
    <DropdownItem
      ref={ref}
      {...rest}
      icon={<span aria-hidden className="inline-block w-3 text-center">{checked ? '✓' : ''}</span>}
    >
      {children}
    </DropdownItem>
  );
});
DropdownCheckboxItem.displayName = 'PixelDropdown.CheckboxItem';

interface DropdownRadioItemProps extends Omit<DropdownItemProps, 'icon'> {
  checked?: boolean;
}

const DropdownRadioItem = forwardRef<HTMLButtonElement, DropdownRadioItemProps>(function DropdownRadioItem(
  { checked, children, ...rest },
  ref,
) {
  return (
    <DropdownItem
      ref={ref}
      {...rest}
      icon={<span aria-hidden className="inline-block w-3 text-center">{checked ? '●' : ''}</span>}
    >
      {children}
    </DropdownItem>
  );
});
DropdownRadioItem.displayName = 'PixelDropdown.RadioItem';

/* ─── Main forwardRef component (items[] sugar OR composition) ──────────── */

interface PixelDropdownComponent extends React.ForwardRefExoticComponent<PixelDropdownProps & React.RefAttributes<HTMLDivElement>> {
  Root: typeof DropdownRoot;
  Trigger: typeof DropdownTrigger;
  Content: typeof DropdownContent;
  Item: typeof DropdownItem;
  Separator: typeof DropdownSeparator;
  Header: typeof DropdownHeader;
  CheckboxItem: typeof DropdownCheckboxItem;
  RadioItem: typeof DropdownRadioItem;
}

const PixelDropdownBase = forwardRef<HTMLDivElement, PixelDropdownProps>(function PixelDropdown(
  { label, items, onSelect, tone = 'neutral', icon, disabled = false, surface: surfaceProp, ariaLabel, children },
  ref,
) {
  // Compositional form: forward children inside a Root + a shared container ref.
  if (children) {
    return (
      <DropdownRoot surface={surfaceProp}>
        <div ref={ref} className="contents">
          {children}
        </div>
      </DropdownRoot>
    );
  }

  // Legacy items[] form preserved 1:1 (with extended kinds support).
  return (
    <DropdownRoot surface={surfaceProp}>
      <ItemsRenderer
        ref={ref}
        label={label ?? ''}
        items={items ?? []}
        onSelect={onSelect ?? (() => {})}
        tone={tone}
        icon={icon}
        disabled={disabled}
        ariaLabel={ariaLabel}
      />
    </DropdownRoot>
  );
});

interface ItemsRendererProps {
  label: string;
  items: DropdownOption[];
  onSelect: (value: string) => void;
  tone: Tone;
  icon?: React.ReactNode;
  disabled: boolean;
  ariaLabel?: string;
}

const ItemsRenderer = forwardRef<HTMLDivElement, ItemsRendererProps>(function ItemsRenderer(
  { label, items, onSelect, tone, icon, disabled, ariaLabel },
  ref,
) {
  // Read context from the Root we sit inside.
  return (
    <div ref={ref} className="contents">
      <DropdownTrigger tone={tone} icon={icon} disabled={disabled} ariaLabel={ariaLabel}>
        {label}
      </DropdownTrigger>
      <DropdownContent>
        {items.map((item, idx) => {
          const kind: DropdownItemKind = item.kind ?? 'item';
          if (kind === 'separator') return <DropdownSeparator key={`sep-${idx}`} />;
          if (kind === 'header') return <DropdownHeader key={`hdr-${idx}-${item.label}`}>{item.label}</DropdownHeader>;
          const common = {
            value: item.value,
            disabled: item.disabled,
            tone: item.tone,
            shortcut: item.shortcut,
            onSelect: () => onSelect(item.value),
          };
          if (kind === 'checkbox') {
            return (
              <DropdownCheckboxItem key={item.value} {...common} checked={item.checked}>
                {item.label}
              </DropdownCheckboxItem>
            );
          }
          if (kind === 'radio') {
            return (
              <DropdownRadioItem key={item.value} {...common} checked={item.checked}>
                {item.label}
              </DropdownRadioItem>
            );
          }
          // 'item' or 'submenu' (submenu = item w/ chevron affordance for now)
          return (
            <DropdownItem
              key={item.value}
              {...common}
              icon={item.icon ?? (kind === 'submenu' ? <span aria-hidden>▸</span> : undefined)}
            >
              {item.label}
            </DropdownItem>
          );
        })}
      </DropdownContent>
    </div>
  );
});
ItemsRenderer.displayName = 'PixelDropdown.ItemsRenderer';

export const PixelDropdown = PixelDropdownBase as PixelDropdownComponent;
PixelDropdown.Root = DropdownRoot;
PixelDropdown.Trigger = DropdownTrigger;
PixelDropdown.Content = DropdownContent;
PixelDropdown.Item = DropdownItem;
PixelDropdown.Separator = DropdownSeparator;
PixelDropdown.Header = DropdownHeader;
PixelDropdown.CheckboxItem = DropdownCheckboxItem;
PixelDropdown.RadioItem = DropdownRadioItem;
