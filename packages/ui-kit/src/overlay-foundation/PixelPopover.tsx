'use client';

import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { autoUpdate, useFloating } from '@floating-ui/react-dom';
import {
  POPOVER_Z_INDEX,
  anchoredMiddleware,
  popoverArrowClasses,
  popoverContentClasses,
  returnFocusOnRemoval,
  toPlacement,
  type FloatingAlign,
  type FloatingSide,
} from '@pxlkit/ui-kit-core';
import { Surface, cn, useEffectiveSurface } from '../common';
import { useEscape } from '../hooks/useEscape';
import { elementRef } from '../utils/element-ref';

type PopoverSide = FloatingSide;
type PopoverAlign = FloatingAlign;
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
  /** True while a press outside is closing the popover: focus then follows the pointer. */
  pressOutsideRef: React.MutableRefObject<boolean>;
  haspopup: PopoverHasPopup;
  role: PopoverRole;
  /** Id of the content while it is on the page, for the trigger's aria-controls. */
  contentId: string | null;
  setContentId: (id: string | null) => void;
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

export interface PixelPopoverProps {
  /** Whether the popover is open; set it from `onOpenChange`. */
  open: boolean;
  /** Called with the open state the trigger, Escape or a press outside asks for. */
  onOpenChange: (open: boolean) => void;
  /** `PixelPopover.Trigger` and `PixelPopover.Content`. */
  children: React.ReactNode;
  /** Side of the trigger the content opens on; flips when there is no room. */
  side?: PopoverSide;
  /** Alignment of the content along that side. */
  align?: PopoverAlign;
  /** Gap between trigger and content, in px. */
  sideOffset?: number;
  /** Close when Escape is pressed. */
  closeOnEscape?: boolean;
  /** Close on a press outside the trigger and the content. */
  closeOnOutsideClick?: boolean;
  /** Surface override; defaults to the nearest provider. */
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
  const pressOutsideRef = useRef(false);
  const [contentId, setContentId] = useState<string | null>(null);

  const placement = toPlacement(side, align);

  const { refs, floatingStyles } = useFloating({
    open,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: anchoredMiddleware(sideOffset),
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
      pressOutsideRef.current = true;
      setOpen(false);
    };
    document.addEventListener('pointerdown', listener);
    return () => document.removeEventListener('pointerdown', listener);
  }, [open, closeOnOutsideClick, setOpen]);

  // A press outside that did not close the popover (the parent kept it
  // open) ends with the pointer release; a new open starts clean.
  useEffect(() => {
    if (!open) return;
    pressOutsideRef.current = false;
    const release = () => {
      pressOutsideRef.current = false;
    };
    document.addEventListener('pointerup', release);
    document.addEventListener('pointercancel', release);
    return () => {
      document.removeEventListener('pointerup', release);
      document.removeEventListener('pointercancel', release);
    };
  }, [open]);

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
      pressOutsideRef,
      haspopup,
      role,
      contentId,
      setContentId,
    }),
    [open, setOpen, refs, floatingStyles, side, align, surface, haspopup, role, contentId],
  );

  return (
    <PopoverContext.Provider value={ctx}>{children}</PopoverContext.Provider>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelPopover.Trigger
   ────────────────────────────────────────────────────────────────────────── */

export interface PixelPopoverTriggerProps {
  /**
   * The trigger: one element, which toggles the popover and gets its `aria-expanded`,
   * `aria-haspopup` and `aria-controls`.
   */
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
      const original = elementRef<HTMLElement>(child);
      if (typeof original === 'function') original(node);
      else if (original && typeof original === 'object') {
        (original as React.MutableRefObject<HTMLElement | null>).current = node;
      }
      if (typeof _forwardedRef === 'function') _forwardedRef(node);
      else if (_forwardedRef && typeof _forwardedRef === 'object') {
        (_forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
      }
    };

    // Respect any aria-haspopup / aria-controls the child has already set
    // (combobox/menu patterns set their own); only inject the context values
    // when absent. aria-controls points at the content only while it is on
    // the page.
    const childProps = child.props as React.HTMLAttributes<HTMLElement>;
    const childHasPopup = childProps['aria-haspopup'];
    const resolvedHasPopup = childHasPopup ?? ctx.haspopup;
    const resolvedControls = childProps['aria-controls'] ?? ctx.contentId ?? undefined;

    return React.cloneElement(child, {
      onClick: handleClick,
      'aria-expanded': ctx.open,
      'aria-haspopup': resolvedHasPopup,
      'aria-controls': resolvedControls,
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
  /** Surface override; defaults to the popover's. */
  surface?: Surface;
}

const PixelPopoverContent = forwardRef<HTMLDivElement, PixelPopoverContentProps>(
  function PixelPopoverContent(props, forwardedRef) {
    const ctx = usePopoverContext('PixelPopover.Content');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    if (!ctx.open) return null;
    if (!mounted || typeof document === 'undefined') return null;

    return <PopoverContentPortal {...props} ctx={ctx} forwardedRef={forwardedRef} />;
  },
);
PixelPopoverContent.displayName = 'PixelPopover.Content';

/* The open content, portaled to <body>. A component of its own so its
   unmount marks the moment the content closes. */
interface PopoverContentPortalProps extends PixelPopoverContentProps {
  ctx: PopoverContextValue;
  forwardedRef: React.ForwardedRef<HTMLDivElement>;
}

function PopoverContentPortal({
  ctx,
  forwardedRef,
  className,
  children,
  surface: surfaceProp,
  style,
  id: idProp,
  ...rest
}: PopoverContentPortalProps) {
  const { contentRef, triggerRef, pressOutsideRef, setContentId } = ctx;
  const generatedId = useId();
  const id = idProp ?? generatedId;

  // The trigger controls the content while it is on the page.
  useLayoutEffect(() => {
    setContentId(id);
    return () => setContentId(null);
  }, [setContentId, id]);

  // Focus return: content that closes while holding focus hands it back to
  // the trigger — unless a press outside closed it, then focus follows the
  // pointer. Layout cleanup runs before React removes the content's DOM.
  useLayoutEffect(
    () => () => {
      if (!pressOutsideRef.current) {
        returnFocusOnRemoval(contentRef.current, () => triggerRef.current);
      }
    },
    [contentRef, triggerRef, pressOutsideRef],
  );

  const surface = surfaceProp ?? ctx.surface;

  const setRefs = (node: HTMLDivElement | null) => {
    contentRef.current = node;
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
      id={id}
      role={contentRole}
      style={{ ...ctx.floatingStyles, zIndex: POPOVER_Z_INDEX, ...style }}
      className={cn(popoverContentClasses(surface), className)}
      {...rest}
    >
      {children}
    </div>,
    document.body,
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelPopover.Arrow — purely decorative pointer aligned to the side.
   ────────────────────────────────────────────────────────────────────────── */

export interface PixelPopoverArrowProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

const PixelPopoverArrow = forwardRef<HTMLSpanElement, PixelPopoverArrowProps>(
  function PixelPopoverArrow({ className, ...rest }, ref) {
    const ctx = usePopoverContext('PixelPopover.Arrow');
    return (
      <span
        ref={ref}
        aria-hidden
        className={cn(popoverArrowClasses(ctx.surface, ctx.side), className)}
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
