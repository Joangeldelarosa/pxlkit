import {
  DOCUMENT,
  DestroyRef,
  ElementRef,
  InjectionToken,
  Injector,
  NgZone,
  afterNextRender,
  afterRenderEffect,
  computed,
  effect,
  inject,
  signal,
  untracked,
  type Signal,
} from '@angular/core';
import {
  DROPDOWN_TYPEAHEAD_RESET_MS,
  dropdownMenuKeyAction,
  dropdownTriggerKeyAction,
  dropdownTypeaheadMatch,
  nextDropdownHighlight,
  returnFocusOnRemoval,
  type DropdownMove,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { injectId } from '../_internal/ids';
import { injectClickOutside, injectEscape, injectEventListener } from '../utilities/dom';

/** An item of the menu, as the root sees it. */
export interface DropdownItemEntry {
  value(): string;
  /** Id of the item's element, which the menu's `aria-activedescendant` points at. */
  id(): string;
  disabled(): boolean;
  /** Text typeahead matches; items with markup in their label have none. */
  label(): string | undefined;
  /** Runs the item's `(selected)` (Enter / Space on the highlighted item). */
  select(): void;
}

/** The trigger, as the root sees it. */
export interface DropdownTriggerEntry {
  /** Its own id, if it has one. */
  id(): string | undefined;
  /** The button, which focus returns to. */
  element(): HTMLElement | undefined;
}

/** What the parts of a dropdown share. */
export interface PixelDropdownContext {
  readonly open: Signal<boolean>;
  readonly surface: Signal<Surface>;
  readonly menuId: string;
  /** Id of the trigger, which names the menu: its own, or a generated one. */
  readonly triggerId: Signal<string>;
  /** Id of the highlighted item's element, for the menu's `aria-activedescendant`. */
  readonly activeId: Signal<string | undefined>;
  /** The root element, which the menu is anchored to. */
  readonly root: HTMLElement;
  readonly highlighted: Signal<string | null>;
  setOpen(open: boolean): void;
  highlight(value: string): void;
  /** Lists an item while it exists, in creation order; returns the function that removes it. */
  registerItem(item: DropdownItemEntry): () => void;
  /** Lists the trigger while it exists; returns the function that removes it. */
  registerTrigger(trigger: DropdownTriggerEntry): () => void;
  /**
   * The menu panel while it is on the page — `null` right before it leaves:
   * focus moves into it as it opens and back to the trigger as it closes.
   */
  setMenu(menu: HTMLElement | null): void;
  /** Keyboard handling of the trigger. */
  onTriggerKeydown(event: KeyboardEvent): void;
  /** Keyboard handling of the open menu, which holds focus. */
  onMenuKeydown(event: KeyboardEvent): void;
}

export const PIXEL_DROPDOWN = new InjectionToken<PixelDropdownContext>('PIXEL_DROPDOWN');

export function injectDropdownContext(component: string): PixelDropdownContext {
  const context = inject(PIXEL_DROPDOWN, { optional: true });
  if (!context) throw new Error(`${component} must be used inside a <pxl-dropdown-root>`);
  return context;
}

/**
 * The label of an item for typeahead: its text, when the label holds text
 * only — as the React kit reads string children.
 */
export function labelText(element: HTMLElement | undefined): string | undefined {
  if (!element || element.children.length > 0) return undefined;
  return element.textContent?.trim();
}

/**
 * The state, focus and keyboard handling of a dropdown root whose host
 * element holds the trigger and the menu. The open menu takes focus, is named
 * by the trigger and points `aria-activedescendant` at a highlight the arrows
 * move over the enabled items (ArrowDown on the trigger opens the closed menu
 * on the first one, ArrowUp on the last); Home / End jump to the ends, Enter
 * or Space activates the highlighted item and typing jumps to an item by its
 * label. Escape, choosing an item and Tab close the menu with focus back on
 * the trigger; a press outside closes it too, and focus follows the pointer.
 * Call in an injection context.
 */
export function createDropdownRoot(state: {
  open: Signal<boolean>;
  setOpen(open: boolean): void;
  surface: Signal<Surface>;
}): PixelDropdownContext {
  const root = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  const injector = inject(Injector);
  const highlighted = signal<string | null>(null);
  const items: DropdownItemEntry[] = [];
  const trigger = signal<DropdownTriggerEntry | null>(null);
  const menu = signal<HTMLElement | null>(null);
  const generatedTriggerId = injectId();
  // True while a press outside is closing the menu: focus then follows the
  // pointer instead of returning to the trigger.
  let pressOutside = false;

  const enabledValues = () => items.filter((item) => !item.disabled()).map((item) => item.value());
  const close = () => {
    state.setOpen(false);
    highlighted.set(null);
  };
  const selectHighlighted = () => {
    const value = highlighted();
    if (!value) return;
    items.find((item) => item.value() === value)?.select();
    close();
  };

  // Letters typed before a pause add up into one search. The pause only
  // forgets them: its timer runs outside the zone, so a zone.js application
  // stays stable meanwhile and checks nothing when it ends.
  const zone = inject(NgZone);
  let typed = '';
  let typeaheadTimer: ReturnType<typeof setTimeout> | undefined;
  const typeahead = (key: string) => {
    clearTimeout(typeaheadTimer);
    typed = (typed + key).toLowerCase();
    const match = dropdownTypeaheadMatch(
      enabledValues(),
      (value) => items.find((item) => item.value() === value)?.label(),
      typed,
    );
    if (match) highlighted.set(match);
    typeaheadTimer = zone.runOutsideAngular(() =>
      setTimeout(() => {
        typed = '';
      }, DROPDOWN_TYPEAHEAD_RESET_MS),
    );
  };
  inject(DestroyRef).onDestroy(() => clearTimeout(typeaheadTimer));

  const move = (to: DropdownMove) => {
    const next = nextDropdownHighlight(enabledValues(), highlighted(), to);
    if (next) highlighted.set(next);
  };

  // A press outside asks to close only while the menu is open, so presses on
  // the rest of the page cost nothing.
  injectClickOutside(
    () => root,
    () => {
      if (!state.open()) return;
      pressOutside = true;
      close();
    },
  );
  injectEscape(close, () => state.open());
  // A press outside that did not close the menu (the parent kept it open)
  // ends with the pointer release; a new open starts clean.
  const document = inject(DOCUMENT);
  const releasePress = () => {
    pressOutside = false;
  };
  injectEventListener('pointerup', releasePress, () => document);
  injectEventListener('pointercancel', releasePress, () => document);
  effect(() => {
    if (state.open()) pressOutside = false;
    else highlighted.set(null);
  });
  // Focus moves into the menu as it opens.
  afterRenderEffect(() => menu()?.focus({ preventScroll: true }));

  return {
    open: state.open,
    surface: state.surface,
    menuId: injectId(),
    triggerId: computed(() => trigger()?.id() ?? generatedTriggerId),
    activeId: computed(() => {
      const value = highlighted();
      return value ? items.find((item) => item.value() === value)?.id() : undefined;
    }),
    root,
    highlighted: highlighted.asReadonly(),
    setOpen: (open) => state.setOpen(open),
    highlight: (value) => highlighted.set(value),
    registerItem(item) {
      items.push(item);
      return () => {
        const index = items.indexOf(item);
        if (index >= 0) items.splice(index, 1);
      };
    },
    registerTrigger(entry) {
      trigger.set(entry);
      return () => {
        if (untracked(trigger) === entry) trigger.set(null);
      };
    },
    setMenu(element) {
      const previous = untracked(menu);
      if (!element && previous && !pressOutside) returnFocusOnRemoval(previous, () => untracked(trigger)?.element());
      menu.set(element);
    },
    // ArrowDown on the trigger opens the menu on its first item and ArrowUp
    // on its last; either moves into the menu when it is already open. Enter
    // and Space stay the button's own click, which toggles the menu.
    onTriggerKeydown(event) {
      const edge = dropdownTriggerKeyAction(event.key);
      if (!edge) return;
      event.preventDefault();
      if (!state.open()) {
        state.setOpen(true);
        // Items are created as the menu renders: highlight the first or last
        // one then — unless the menu stayed closed.
        afterNextRender(
          () => {
            if (state.open()) move(edge);
          },
          { injector },
        );
        return;
      }
      untracked(menu)?.focus({ preventScroll: true });
      move(event.key === 'ArrowDown' ? 1 : -1);
    },
    // The menu holds focus while open; Escape closes it from anywhere.
    onMenuKeydown(event) {
      const action = dropdownMenuKeyAction(event.key);
      if (action === undefined) return;
      if (action === 'typeahead') {
        typeahead(event.key);
        return;
      }
      if (action === 'leave') {
        // Focus is back on the trigger before the browser's own Tab, which
        // then moves on from there.
        untracked(trigger)?.element()?.focus();
        close();
        return;
      }
      event.preventDefault();
      if (action === 'select') selectHighlighted();
      else move(action);
    },
  };
}
