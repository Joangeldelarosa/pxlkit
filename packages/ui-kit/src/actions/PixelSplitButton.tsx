import React, { forwardRef, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import {
  DROPDOWN_TYPEAHEAD_RESET_MS,
  SPLIT_BUTTON_TOGGLE_LABEL,
  dropdownChevronClasses,
  dropdownMenuKeyAction,
  dropdownTriggerKeyAction,
  dropdownTypeaheadMatch,
  nextDropdownHighlight,
  splitButtonGroupClasses,
  splitButtonItemClasses,
  splitButtonItemId,
  splitButtonMenuAlignsRight,
  splitButtonMenuClasses,
  splitButtonPrimaryClasses,
  splitButtonRootClasses,
  splitButtonToggleClasses,
  type DropdownEdge,
  type DropdownMove,
} from '@pxlkit/ui-kit-core';
import {
  Tone, Surface, Option, useClickOutside,
  useEffectiveSurface,
  ChevronDownIcon,
} from '../common';
import { useEscape } from '../hooks/useEscape';

/* ─────────────────────────────────────────────────────────────────────────
   PixelSplitButton — primary action + chevron dropdown for secondary options.

   The menu follows the WAI-ARIA menu button pattern, as PixelDropdown's
   does: it takes focus as it opens and points `aria-activedescendant` at the
   highlighted option. The arrows, Home and End move the highlight, Enter and
   Space choose it, typing jumps to an option by its label; ArrowDown on the
   chevron opens the menu on its first option, ArrowUp on its last. Escape,
   Tab and choosing close it with focus back on the chevron; a press outside
   closes it and focus follows the pointer.
   ───────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelSplitButton}. */
export interface PixelSplitButtonProps {
  /** Text shown on the primary (left) button. */
  label: string;
  /** Options shown in the dropdown menu. */
  options: Option[];
  /** Color tone (maps to `toneMap`). */
  tone?: Tone;
  /** Surface aesthetic override; defaults to nearest provider. */
  surface?: Surface;
  /** When true, both primary button and chevron trigger are disabled. */
  disabled?: boolean;
  /** Fires when the primary (label) button is clicked. */
  onPrimary?: () => void;
  /** Fires with the selected option's `value` when a menu item is chosen. */
  onSelect?: (value: string) => void;
}

export const PixelSplitButton = forwardRef<HTMLDivElement, PixelSplitButtonProps>(function PixelSplitButton(
  {
    label,
    options,
    tone = 'purple',
    surface: surfaceProp,
    disabled = false,
    onPrimary,
    onSelect,
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const toggleId = useId();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const typed = useRef('');
  const typeaheadTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const values = options.map((option) => option.value);
  const activeIndex = highlighted === null ? -1 : values.indexOf(highlighted);

  // Opened from the keyboard, the menu starts on its first or last option.
  function show(edge?: DropdownEdge) {
    if (rootRef.current) {
      setAlignRight(splitButtonMenuAlignsRight(rootRef.current.getBoundingClientRect().left, window.innerWidth));
    }
    setHighlighted(edge ? (nextDropdownHighlight(values, null, edge) ?? null) : null);
    setOpen(true);
  }

  // Focus the menu holds goes back to the chevron — but not after a press
  // outside, where it follows the pointer.
  function close(returnFocus = true) {
    if (returnFocus && menuRef.current?.contains(document.activeElement)) toggleRef.current?.focus();
    setOpen(false);
    setHighlighted(null);
  }

  function choose(value: string) {
    onSelect?.(value);
    close();
  }

  function move(to: DropdownMove) {
    const next = nextDropdownHighlight(values, highlighted, to);
    if (next) setHighlighted(next);
  }

  function typeahead(key: string) {
    clearTimeout(typeaheadTimer.current);
    typed.current = (typed.current + key).toLowerCase();
    const match = dropdownTypeaheadMatch(values, (value) => options.find((option) => option.value === value)?.label, typed.current);
    if (match) setHighlighted(match);
    typeaheadTimer.current = setTimeout(() => { typed.current = ''; }, DROPDOWN_TYPEAHEAD_RESET_MS);
  }

  useClickOutside(rootRef, () => close(false));
  useEscape(() => close(), open);
  useEffect(() => () => clearTimeout(typeaheadTimer.current), []);

  // Focus moves into the menu as it opens.
  useLayoutEffect(() => {
    if (open) menuRef.current?.focus({ preventScroll: true });
  }, [open]);

  // ArrowDown on the chevron opens the menu on its first option and ArrowUp
  // on its last; either moves into the menu when it is already open. Enter
  // and Space stay the button's own click, which toggles the menu.
  const onToggleKeyDown = (event: React.KeyboardEvent) => {
    const edge = dropdownTriggerKeyAction(event.key);
    if (!edge) return;
    event.preventDefault();
    if (!open) {
      show(edge);
      return;
    }
    menuRef.current?.focus({ preventScroll: true });
    move(event.key === 'ArrowDown' ? 1 : -1);
  };

  // The menu holds focus while open; Escape closes it from anywhere.
  const onMenuKeyDown = (event: React.KeyboardEvent) => {
    const action = dropdownMenuKeyAction(event.key);
    if (action === undefined) return;
    if (action === 'typeahead') {
      typeahead(event.key);
      return;
    }
    if (action === 'leave') {
      // Focus is back on the chevron before the browser's own Tab, which
      // then moves on from there.
      close();
      return;
    }
    event.preventDefault();
    if (action !== 'select') move(action);
    else if (highlighted !== null) choose(highlighted);
  };

  return (
    <div
      ref={(node) => {
        rootRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className={splitButtonRootClasses}
    >
      <div className={splitButtonGroupClasses(surface, tone)}>
        <button disabled={disabled} className={splitButtonPrimaryClasses(surface, tone)} onClick={onPrimary}>
          <span>{label}</span>
        </button>
        <button
          ref={toggleRef}
          id={toggleId}
          type="button"
          aria-label={SPLIT_BUTTON_TOGGLE_LABEL}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          disabled={disabled}
          className={splitButtonToggleClasses(surface, tone)}
          onClick={() => (open ? close() : show())}
          onKeyDown={onToggleKeyDown}
        >
          <ChevronDownIcon className={dropdownChevronClasses(open)} />
        </button>
      </div>
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          tabIndex={-1}
          aria-orientation="vertical"
          aria-labelledby={toggleId}
          aria-activedescendant={activeIndex >= 0 ? splitButtonItemId(menuId, activeIndex) : undefined}
          className={splitButtonMenuClasses(surface, alignRight)}
          onKeyDown={onMenuKeyDown}
        >
          {options.map((opt, index) => (
            <button
              key={opt.value}
              id={splitButtonItemId(menuId, index)}
              type="button"
              role="menuitem"
              tabIndex={-1}
              data-highlighted={index === activeIndex || undefined}
              className={splitButtonItemClasses(surface, index === activeIndex)}
              onMouseEnter={() => setHighlighted(opt.value)}
              onClick={() => choose(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

PixelSplitButton.displayName = 'PixelSplitButton';
