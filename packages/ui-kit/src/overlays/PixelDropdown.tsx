/* ─────────────────────────────────────────────────────────────────────────
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

   Focus: the open menu takes focus and points `aria-activedescendant` at the
   highlighted item. Escape, choosing an item and Tab hand focus back to the
   trigger; after a press outside it follows the pointer.
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { autoUpdate, useFloating } from '@floating-ui/react-dom';
import {
  DROPDOWN_PLACEMENT,
  DROPDOWN_TYPEAHEAD_RESET_MS,
  dropdownChevronClasses,
  dropdownContentClasses,
  dropdownHeaderClasses,
  dropdownItemClasses,
  dropdownItemIconClasses,
  dropdownItemLabelClasses,
  dropdownItemRoles,
  dropdownMark,
  dropdownMarkClasses,
  dropdownMenuKeyAction,
  dropdownMiddleware,
  dropdownRootClasses,
  dropdownSeparatorClasses,
  dropdownShortcutClasses,
  dropdownTriggerKeyAction,
  dropdownTypeaheadMatch,
  nextDropdownHighlight,
  returnFocusOnRemoval,
  type DropdownEdge,
  type DropdownItemKind,
  type DropdownMove,
} from '@pxlkit/ui-kit-core';
import {
  Tone, Surface, Option, cn, useClickOutside,
  useEffectiveSurface,
  ChevronDownIcon,
} from '../common';
import { PixelButton } from '../actions';
import { useEscape } from '../hooks/useEscape';
import { useControllableState } from '../hooks/useControllableState';

export type { DropdownItemKind };

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
  /** Trigger button label (legacy items[] API). */
  label?: string;
  /** Items to render (legacy items[] API). */
  items?: DropdownOption[];
  /** Called with the selected item's `value` (legacy items[] API). */
  onSelect?: (value: string) => void;
  /** Trigger tone. */
  tone?: Tone;
  /** Optional icon at the right side of the trigger button. Defaults to a chevron. */
  icon?: React.ReactNode;
  /** Disables the trigger button. */
  disabled?: boolean;
  /** Visual surface override. Falls back to nearest `<PxlKitProvider>` surface. */
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
  /** Id of the trigger, which names the menu: its own, or a generated one. */
  triggerId: string;
  setOwnTriggerId: (id: string | undefined) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
  menuRef: React.MutableRefObject<HTMLDivElement | null>;
  /** True while a press outside is closing the menu: focus then follows the pointer. */
  pressOutsideRef: React.MutableRefObject<boolean>;
  highlightedValue: string | null;
  setHighlightedValue: (v: string | null) => void;
  /** Element id of an item, for the menu's `aria-activedescendant`. */
  itemId: (value: string | null) => string | undefined;
  registerItem: (value: string, disabled: boolean, id: string) => void;
  unregisterItem: (value: string) => void;
  getOrderedValues: () => string[];
  typeaheadJump: (char: string) => void;
  labelMap: Map<string, string>;
  registerItemHandler: (value: string, onSelect: (() => void) | undefined) => void;
  selectHighlighted: () => void;
  onTriggerKeyDown: (e: React.KeyboardEvent) => void;
  onMenuKeyDown: (e: React.KeyboardEvent) => void;
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

function useDropdownContext(component: string): DropdownContextValue {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error(`${component} must be used inside <PixelDropdown.Root>`);
  return ctx;
}

/* ─── Root / compositional sub-components ───────────────────────────────── */

interface DropdownRootProps {
  /** Whether the menu is open; leave unset for an uncontrolled menu. */
  open?: boolean;
  /** Initial open state while uncontrolled. */
  defaultOpen?: boolean;
  /**
   * Called with every open state the menu asks for (the trigger and its keys, Escape, a press
   * outside, an item).
   */
  onOpenChange?: (open: boolean) => void;
  /** Surface override for the trigger and the menu; defaults to the nearest provider. */
  surface?: Surface;
  /** The trigger and the menu (`PixelDropdown.Trigger`, `PixelDropdown.Content`). */
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
  const generatedTriggerId = useId();
  const [ownTriggerId, setOwnTriggerId] = useState<string | undefined>(undefined);
  const triggerId = ownTriggerId ?? generatedTriggerId;
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pressOutsideRef = useRef(false);
  const itemsRef = useRef<{ value: string; disabled: boolean; id: string }[]>([]);
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

  const registerItem = useCallback((value: string, disabled: boolean, id: string) => {
    const existing = itemsRef.current.findIndex((i) => i.value === value);
    if (existing >= 0) itemsRef.current[existing] = { value, disabled, id };
    else itemsRef.current.push({ value, disabled, id });
  }, []);
  const itemId = useCallback((value: string | null) => itemsRef.current.find((i) => i.value === value)?.id, []);
  const unregisterItem = useCallback((value: string) => {
    itemsRef.current = itemsRef.current.filter((i) => i.value !== value);
    labelMapRef.current.delete(value);
    onSelectMapRef.current.delete(value);
  }, []);
  const registerItemHandler = useCallback((value: string, onSelect: (() => void) | undefined) => {
    onSelectMapRef.current.set(value, onSelect);
  }, []);
  const getOrderedValues = useCallback(() => itemsRef.current.filter((i) => !i.disabled).map((i) => i.value), []);
  const close = useCallback(() => {
    setOpen(false);
    setHighlightedValue(null);
  }, [setHighlightedValue, setOpen]);
  const selectHighlighted = useCallback(() => {
    const v = highlightedValueRef.current;
    if (!v) return;
    const handler = onSelectMapRef.current.get(v);
    handler?.();
    close();
  }, [close]);

  const typeaheadJump = useCallback((char: string) => {
    if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
    typeaheadBuf.current = (typeaheadBuf.current + char).toLowerCase();
    const match = dropdownTypeaheadMatch(getOrderedValues(), (v) => labelMapRef.current.get(v), typeaheadBuf.current);
    if (match) setHighlightedValue(match);
    typeaheadTimer.current = setTimeout(() => { typeaheadBuf.current = ''; }, DROPDOWN_TYPEAHEAD_RESET_MS);
  }, [getOrderedValues, setHighlightedValue]);

  useClickOutside(containerRef, () => { pressOutsideRef.current = true; close(); });
  useEscape(close, open);
  useEffect(() => { if (!open) setHighlightedValue(null); }, [open, setHighlightedValue]);
  useEffect(() => () => { if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current); }, []);

  // A press outside that did not close the menu (the parent kept it open)
  // ends with the pointer release; a new open starts clean.
  useEffect(() => {
    if (!open) return;
    pressOutsideRef.current = false;
    const release = () => { pressOutsideRef.current = false; };
    document.addEventListener('pointerup', release);
    document.addEventListener('pointercancel', release);
    return () => {
      document.removeEventListener('pointerup', release);
      document.removeEventListener('pointercancel', release);
    };
  }, [open]);

  const moveHighlight = useCallback((move: DropdownMove) => {
    const next = nextDropdownHighlight(getOrderedValues(), highlightedValueRef.current, move);
    if (next) setHighlightedValue(next);
  }, [getOrderedValues, setHighlightedValue]);

  // An arrow key on the closed menu opens it on its first or last item.
  // Items register once the menu renders, so the highlight waits for them;
  // a parent that keeps the menu closed drops the request.
  const [highlightOnOpen, setHighlightOnOpen] = useState<DropdownEdge | null>(null);
  useEffect(() => {
    if (!highlightOnOpen) return;
    setHighlightOnOpen(null);
    if (open) moveHighlight(highlightOnOpen);
  }, [highlightOnOpen, open, moveHighlight]);

  // ArrowDown on the trigger opens the menu on its first item and ArrowUp on
  // its last; either moves into the menu when it is already open. Enter and
  // Space stay the button's own click, which toggles the menu.
  const onTriggerKeyDown = useCallback((e: React.KeyboardEvent) => {
    const edge = dropdownTriggerKeyAction(e.key);
    if (!edge) return;
    e.preventDefault();
    if (!open) { setHighlightOnOpen(edge); setOpen(true); return; }
    menuRef.current?.focus({ preventScroll: true });
    moveHighlight(e.key === 'ArrowDown' ? 1 : -1);
  }, [open, setOpen, moveHighlight]);

  // The menu holds focus while open; Escape closes it from anywhere.
  const onMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    const action = dropdownMenuKeyAction(e.key);
    if (action === undefined) return;
    if (action === 'typeahead') { typeaheadJump(e.key); return; }
    if (action === 'leave') {
      // Focus is back on the trigger before the browser's own Tab, which
      // then moves on from there.
      triggerRef.current?.focus();
      close();
      return;
    }
    e.preventDefault();
    if (action === 'select') selectHighlighted();
    else moveHighlight(action);
  }, [typeaheadJump, close, selectHighlighted, moveHighlight]);

  const labelMap = labelMapRef.current;
  const ctx: DropdownContextValue = useMemo(() => ({
    open, setOpen, surface, menuId, triggerId, setOwnTriggerId,
    containerRef, triggerRef, menuRef, pressOutsideRef,
    highlightedValue, setHighlightedValue, itemId,
    registerItem, unregisterItem, getOrderedValues, typeaheadJump,
    labelMap,
    registerItemHandler,
    selectHighlighted,
    onTriggerKeyDown, onMenuKeyDown,
  }), [open, setOpen, surface, menuId, triggerId, highlightedValue, setHighlightedValue, itemId, registerItem, unregisterItem, getOrderedValues, typeaheadJump, labelMap, registerItemHandler, selectHighlighted, onTriggerKeyDown, onMenuKeyDown]);

  return (
    <DropdownContext.Provider value={ctx}>
      <div ref={containerRef} className={dropdownRootClasses}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

interface DropdownTriggerProps {
  /** Button label. */
  children?: React.ReactNode;
  /** Button tone. */
  tone?: Tone;
  /** Icon at the end of the button, in place of the chevron. */
  icon?: React.ReactNode;
  /** Disables the button. */
  disabled?: boolean;
  /** Accessible label, for a label that is only decorative. */
  ariaLabel?: string;
  /** Id of the button, which names the menu; generated when left out. */
  id?: string;
}

const DropdownTrigger = forwardRef<HTMLButtonElement, DropdownTriggerProps>(function DropdownTrigger(
  { children, tone = 'neutral', icon, disabled = false, ariaLabel, id },
  ref,
) {
  const { open, setOpen, surface, menuId, triggerId, setOwnTriggerId, triggerRef, onTriggerKeyDown } = useDropdownContext('PixelDropdown.Trigger');
  // The menu is named after the trigger, by its own id when it has one.
  useLayoutEffect(() => {
    setOwnTriggerId(id);
    return () => setOwnTriggerId(undefined);
  }, [id, setOwnTriggerId]);
  const setRefs = (node: HTMLButtonElement | null) => {
    triggerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };
  return (
    <PixelButton
      ref={setRefs}
      id={id ?? triggerId}
      tone={tone}
      surface={surface}
      disabled={disabled}
      iconRight={icon ?? <ChevronDownIcon className={dropdownChevronClasses(open)} />}
      onClick={() => setOpen(!open)}
      onKeyDown={onTriggerKeyDown}
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
  /** The items. */
  children?: React.ReactNode;
  /** Extra classes on the menu. */
  className?: string;
}

const DropdownContent = forwardRef<HTMLDivElement, DropdownContentProps>(function DropdownContent(
  { children, className },
  ref,
) {
  const ctx = useDropdownContext('PixelDropdown.Content');
  if (!ctx.open) return null;
  return (
    <DropdownMenu ctx={ctx} forwardedRef={ref} className={className}>
      {children}
    </DropdownMenu>
  );
});
DropdownContent.displayName = 'PixelDropdown.Content';

interface DropdownMenuProps extends DropdownContentProps {
  ctx: DropdownContextValue;
  forwardedRef: React.ForwardedRef<HTMLDivElement>;
}

/** The open menu, mounted for as long as it is open. */
function DropdownMenu({ ctx, forwardedRef, children, className }: DropdownMenuProps) {
  const { surface, menuId, triggerId, containerRef, triggerRef, menuRef, pressOutsideRef, highlightedValue, itemId, onMenuKeyDown } = ctx;
  const { refs, floatingStyles } = useFloating({
    open: true,
    placement: DROPDOWN_PLACEMENT,
    whileElementsMounted: autoUpdate,
    elements: { reference: containerRef.current },
    middleware: dropdownMiddleware(),
  });

  // Focus moves into the menu as it opens, and back to the trigger as it
  // closes — unless a press outside closed it, then focus follows the
  // pointer. Layout cleanup runs before React removes the menu's DOM.
  useLayoutEffect(() => {
    const menu = menuRef.current;
    menu?.focus({ preventScroll: true });
    return () => {
      if (!pressOutsideRef.current) returnFocusOnRemoval(menu, () => triggerRef.current);
    };
  }, [menuRef, triggerRef, pressOutsideRef]);

  const setRefs = (node: HTMLDivElement | null) => {
    menuRef.current = node;
    refs.setFloating(node);
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };
  return (
    <div
      ref={setRefs}
      id={menuId}
      role="menu"
      tabIndex={-1}
      aria-orientation="vertical"
      aria-labelledby={triggerId}
      aria-activedescendant={itemId(highlightedValue)}
      style={floatingStyles}
      className={cn(dropdownContentClasses(surface), className)}
      onKeyDown={onMenuKeyDown}
    >
      {children}
    </div>
  );
}

interface DropdownItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'onSelect'> {
  /** Item identity for highlight/typeahead registration (NOT the HTML form `value`). */
  value?: string;
  /** Label. */
  children: React.ReactNode;
  /** Selection callback (NOT the DOM `select` event). */
  onSelect?: () => void;
  /** Skipped by the keyboard and ignores the pointer. */
  disabled?: boolean;
  /** Visually marks the row red; equivalent to `tone="red"`. */
  destructive?: boolean;
  /** Text tone. */
  tone?: Tone;
  /** Icon before the label (plain items). */
  icon?: React.ReactNode;
  /** Keyboard hint shown at the end of the row (display only). */
  shortcut?: string;
}

const DropdownItem = forwardRef<HTMLButtonElement, DropdownItemProps>(function DropdownItem(
  {
    value, id, children, onSelect, disabled = false, destructive = false, tone, icon, shortcut,
    className, onClick, onMouseEnter, ...rest
  },
  ref,
) {
  const { setOpen, surface, highlightedValue, setHighlightedValue, registerItem, unregisterItem, labelMap, registerItemHandler } = useDropdownContext('PixelDropdown.Item');
  const autoIdRaw = useId();
  const itemValue = value ?? autoIdRaw;
  // The element id the menu's `aria-activedescendant` points at.
  const itemId = id ?? autoIdRaw;
  const effectiveTone: Tone | undefined = destructive ? 'red' : tone;

  // Registered while mounted; later changes update the registration in
  // place, so the item keeps its position in the keyboard order.
  useEffect(() => () => unregisterItem(itemValue), [itemValue, unregisterItem]);
  useEffect(() => {
    registerItem(itemValue, disabled, itemId);
    if (typeof children === 'string') labelMap.set(itemValue, children);
    else labelMap.delete(itemValue);
  }, [itemValue, disabled, itemId, registerItem, labelMap, children]);

  // Keep the latest onSelect handler registered for keyboard activation.
  useEffect(() => {
    registerItemHandler(itemValue, disabled ? undefined : onSelect);
  }, [itemValue, disabled, onSelect, registerItemHandler]);

  const isHighlighted = highlightedValue === itemValue;

  return (
    <button
      ref={ref}
      id={itemId}
      type="button"
      role={dropdownItemRoles.item}
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      data-highlighted={isHighlighted || undefined}
      disabled={disabled}
      className={cn(dropdownItemClasses(surface, { highlighted: isHighlighted, disabled, tone: effectiveTone }), className)}
      onMouseEnter={(e) => {
        onMouseEnter?.(e);
        if (!disabled) setHighlightedValue(itemValue);
      }}
      onClick={(e) => {
        onClick?.(e);
        if (disabled) return;
        onSelect?.();
        setOpen(false);
      }}
      {...rest}
    >
      {icon && <span className={dropdownItemIconClasses}>{icon}</span>}
      <span className={dropdownItemLabelClasses}>{children}</span>
      {shortcut && (
        <kbd
          data-testid="dropdown-shortcut"
          className={dropdownShortcutClasses(surface)}
        >
          {shortcut}
        </kbd>
      )}
    </button>
  );
});
DropdownItem.displayName = 'PixelDropdown.Item';

function DropdownSeparator() {
  return <div role="separator" data-testid="dropdown-separator" className={dropdownSeparatorClasses} />;
}
(DropdownSeparator as React.FC).displayName = 'PixelDropdown.Separator';

function DropdownHeader({ children }: {
  /** Text of the header row. */
  children: React.ReactNode;
}) {
  return (
    <div
      role="presentation"
      data-testid="dropdown-header"
      className={dropdownHeaderClasses}
    >
      {children}
    </div>
  );
}
(DropdownHeader as React.FC<{ children: React.ReactNode }>).displayName = 'PixelDropdown.Header';

interface DropdownCheckboxItemProps extends Omit<DropdownItemProps, 'icon'> {
  /** Shows the check mark, and sets `aria-checked`. */
  checked?: boolean;
}

const DropdownCheckboxItem = forwardRef<HTMLButtonElement, DropdownCheckboxItemProps>(function DropdownCheckboxItem(
  { checked, children, ...rest },
  ref,
) {
  return (
    <DropdownItem
      ref={ref}
      role={dropdownItemRoles.checkbox}
      aria-checked={!!checked}
      {...rest}
      icon={<span aria-hidden className={dropdownMarkClasses}>{dropdownMark('checkbox', checked)}</span>}
    >
      {children}
    </DropdownItem>
  );
});
DropdownCheckboxItem.displayName = 'PixelDropdown.CheckboxItem';

interface DropdownRadioItemProps extends Omit<DropdownItemProps, 'icon'> {
  /** Shows the dot, and sets `aria-checked`. */
  checked?: boolean;
}

const DropdownRadioItem = forwardRef<HTMLButtonElement, DropdownRadioItemProps>(function DropdownRadioItem(
  { checked, children, ...rest },
  ref,
) {
  return (
    <DropdownItem
      ref={ref}
      role={dropdownItemRoles.radio}
      aria-checked={!!checked}
      {...rest}
      icon={<span aria-hidden className={dropdownMarkClasses}>{dropdownMark('radio', checked)}</span>}
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
