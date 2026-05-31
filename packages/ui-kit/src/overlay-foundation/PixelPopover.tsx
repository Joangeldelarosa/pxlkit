'use client';

import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  autoUpdate,
  flip,
  offset as floatingOffset,
  shift,
  useFloating,
  type Placement,
} from '@floating-ui/react-dom';
import {
  Surface,
  cn,
  surfaceClasses,
  useEffectiveSurface,
} from '../common';
import { useEscape } from '../hooks/useEscape';

type PopoverSide = 'top' | 'bottom' | 'left' | 'right';
type PopoverAlign = 'start' | 'center' | 'end';
type PopoverHasPopup = 'dialog' | 'listbox' | 'menu' | 'tree' | 'grid';
type PopoverRole = 'dialog' | 'none' | 'listbox' | 'menu';

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  refs: ReturnType<typeof useFloating>['refs'];
  floatingStyles: React.CSSProperties;
  side: PopoverSide;
  align: PopoverAlign;
  surface: Surface;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  haspopup: PopoverHasPopup;
  role: PopoverRole;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverContext(component: string): PopoverContextValue {
  const ctx = useContext(PopoverContext);
  if (!ctx) {
    throw new Error(
      `${component} must be used inside a <PixelPopover> root.`,
    );
  }
  return ctx;
}

function toPlacement(side: PopoverSide, align: PopoverAlign): Placement {
  if (align === 'center') return side;
  return `${side}-${align}` as Placement;
}

export interface PixelPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  side?: PopoverSide;
  align?: PopoverAlign;
  sideOffset?: number;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  surface?: Surface;
  /**
   * ARIA `aria-haspopup` value advertised on the trigger. Default `'dialog'`.
   * Set to `'listbox'` for combobox patterns, `'menu'` for menu patterns, etc.
   */
  haspopup?: PopoverHasPopup;
  /**
   * Role applied to the content element. Default `'dialog'`. Set to `'none'`
   * (or any non-dialog value) when the popover wraps an inner widget that
   * owns the semantics (e.g. a listbox inside a combobox).
   */
  role?: PopoverRole;
}

type PopoverRootComponent = React.FC<PixelPopoverProps> & {
  Trigger: typeof PixelPopoverTrigger;
  Content: typeof PixelPopoverContent;
  Arrow: typeof PixelPopoverArrow;
};

function PixelPopoverRoot({
  open,
  onOpenChange,
  children,
  side = 'bottom',
  align = 'center',
  sideOffset = 8,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  surface: surfaceProp,
  haspopup = 'dialog',
  role = 'dialog',
}: PixelPopoverProps) {
  const surface = useEffectiveSurface(surfaceProp);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const placement = toPlacement(side, align);

  const { refs, floatingStyles } = useFloating({
    open,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [floatingOffset(sideOffset), flip(), shift({ padding: 8 })],
  });

  const setOpen = useCallback(
    (next: boolean) => onOpenChange(next),
    [onOpenChange],
  );

  useEscape(() => {
    if (open) setOpen(false);
  }, open && closeOnEscape);

  // Outside-click excludes BOTH the content AND the trigger. The trigger
  // sits outside the portaled content, so a naive useClickOutside on the
  // content alone would fire close on every trigger click, then the
  // trigger's own onClick would also toggle — double-firing onOpenChange.
  useEffect(() => {
    if (!open || !closeOnOutsideClick) return;
    const listener = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (contentRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', listener);
    return () => document.removeEventListener('pointerdown', listener);
  }, [open, closeOnOutsideClick, setOpen]);

  const ctx = useMemo<PopoverContextValue>(
    () => ({
      open,
      setOpen,
      refs,
      floatingStyles,
      side,
      align,
      surface,
      contentRef,
      triggerRef,
      haspopup,
      role,
    }),
    [open, setOpen, refs, floatingStyles, side, align, surface, haspopup, role],
  );

  return (
    <PopoverContext.Provider value={ctx}>{children}</PopoverContext.Provider>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelPopover.Trigger
   ────────────────────────────────────────────────────────────────────────── */

export interface PixelPopoverTriggerProps {
  children: React.ReactElement;
}

const PixelPopoverTrigger = forwardRef<HTMLElement, PixelPopoverTriggerProps>(
  function PixelPopoverTrigger({ children }, _forwardedRef) {
    const ctx = usePopoverContext('PixelPopover.Trigger');
    const child = React.Children.only(children) as React.ReactElement<
      React.HTMLAttributes<HTMLElement> & {
        ref?: React.Ref<HTMLElement>;
      }
    >;

    const childOnClick = child.props.onClick;

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
      childOnClick?.(e as React.MouseEvent<HTMLElement, MouseEvent>);
      if (!e.defaultPrevented) ctx.setOpen(!ctx.open);
    };

    const setRef = (node: HTMLElement | null) => {
      ctx.refs.setReference(node);
      ctx.triggerRef.current = node;
      const original = (child as { ref?: React.Ref<HTMLElement> }).ref;
      if (typeof original === 'function') original(node);
      else if (original && typeof original === 'object') {
        (original as React.MutableRefObject<HTMLElement | null>).current = node;
      }
      if (typeof _forwardedRef === 'function') _forwardedRef(node);
      else if (_forwardedRef && typeof _forwardedRef === 'object') {
        (_forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
      }
    };

    // Respect any aria-haspopup the child has already set (combobox/menu
    // patterns set their own); only inject the context default when absent.
    const childProps = child.props as React.HTMLAttributes<HTMLElement>;
    const childHasPopup = childProps['aria-haspopup'];
    const resolvedHasPopup = childHasPopup ?? ctx.haspopup;

    return React.cloneElement(child, {
      onClick: handleClick,
      'aria-expanded': ctx.open,
      'aria-haspopup': resolvedHasPopup,
      ref: setRef,
    } as React.HTMLAttributes<HTMLElement> & { ref: React.Ref<HTMLElement> });
  },
);
PixelPopoverTrigger.displayName = 'PixelPopover.Trigger';

/* ──────────────────────────────────────────────────────────────────────────
   PixelPopover.Content
   ────────────────────────────────────────────────────────────────────────── */

export interface PixelPopoverContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  surface?: Surface;
}

const PixelPopoverContent = forwardRef<HTMLDivElement, PixelPopoverContentProps>(
  function PixelPopoverContent(
    { className, children, surface: surfaceProp, style, ...rest },
    forwardedRef,
  ) {
    const ctx = usePopoverContext('PixelPopover.Content');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    if (!ctx.open) return null;
    if (!mounted || typeof document === 'undefined') return null;

    const surface = surfaceProp ?? ctx.surface;
    const s = surfaceClasses(surface);

    const setRefs = (node: HTMLDivElement | null) => {
      ctx.contentRef.current = node;
      ctx.refs.setFloating(node);
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef && typeof forwardedRef === 'object') {
        (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    };

    // role="none" => omit role attribute entirely so AT does not see a
    // spurious dialog/group layer when the inner widget owns semantics.
    const contentRole = ctx.role === 'none' ? undefined : ctx.role;

    return createPortal(
      <div
        ref={setRefs}
        role={contentRole}
        style={{ ...ctx.floatingStyles, zIndex: 70, ...style }}
        className={cn(
          'bg-retro-bg shadow-xl p-3 outline-none',
          s.border,
          s.radiusLg,
          'border-retro-border',
          className,
        )}
        {...rest}
      >
        {children}
      </div>,
      document.body,
    );
  },
);
PixelPopoverContent.displayName = 'PixelPopover.Content';

/* ──────────────────────────────────────────────────────────────────────────
   PixelPopover.Arrow — purely decorative pointer aligned to the side.
   ────────────────────────────────────────────────────────────────────────── */

export interface PixelPopoverArrowProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

const PixelPopoverArrow = forwardRef<HTMLSpanElement, PixelPopoverArrowProps>(
  function PixelPopoverArrow({ className, ...rest }, ref) {
    const ctx = usePopoverContext('PixelPopover.Arrow');
    const s = surfaceClasses(ctx.surface);
    const sidePos: Record<PopoverSide, string> = {
      top: 'bottom-[-5px] left-1/2 -translate-x-1/2',
      bottom: 'top-[-5px] left-1/2 -translate-x-1/2',
      left: 'right-[-5px] top-1/2 -translate-y-1/2',
      right: 'left-[-5px] top-1/2 -translate-y-1/2',
    };
    return (
      <span
        ref={ref}
        aria-hidden
        className={cn(
          'absolute h-2 w-2 rotate-45 bg-retro-bg',
          s.border,
          'border-retro-border',
          sidePos[ctx.side],
          className,
        )}
        {...rest}
      />
    );
  },
);
PixelPopoverArrow.displayName = 'PixelPopover.Arrow';

/* ──────────────────────────────────────────────────────────────────────────
   Public root with dot-notation sub-components.
   ────────────────────────────────────────────────────────────────────────── */

export const PixelPopover = PixelPopoverRoot as PopoverRootComponent;
PixelPopover.Trigger = PixelPopoverTrigger;
PixelPopover.Content = PixelPopoverContent;
PixelPopover.Arrow = PixelPopoverArrow;
