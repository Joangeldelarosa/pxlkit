import {
  DestroyRef,
  ElementRef,
  InjectionToken,
  Injector,
  afterNextRender,
  effect,
  inject,
  signal,
  type Signal,
} from '@angular/core';
import {
  DROPDOWN_TYPEAHEAD_RESET_MS,
  dropdownTypeaheadMatch,
  isTypeaheadKey,
  nextDropdownHighlight,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { injectId } from '../_internal/ids';
import { injectClickOutside, injectEscape } from '../utilities/dom';

/** An item of the menu, as the root sees it. */
export interface DropdownItemEntry {
  value(): string;
  disabled(): boolean;
  /** Text typeahead matches; items with markup in their label have none. */
  label(): string | undefined;
  /** Runs the item's `(selected)` (Enter / Space on the highlighted item). */
  select(): void;
}

/** What the parts of a dropdown share. */
export interface PixelDropdownContext {
  readonly open: Signal<boolean>;
  readonly surface: Signal<Surface>;
  readonly menuId: string;
  /** The root element, which the menu is anchored to. */
  readonly root: HTMLElement;
  readonly highlighted: Signal<string | null>;
  setOpen(open: boolean): void;
  highlight(value: string): void;
  /** Lists an item while it exists, in creation order; returns the function that removes it. */
  registerItem(item: DropdownItemEntry): () => void;
}

/** A dropdown root's context, with the keyboard handling of its element. */
export interface DropdownRoot extends PixelDropdownContext {
  onKeydown(event: KeyboardEvent): void;
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
 * The state and keyboard handling of a dropdown root whose host element
 * holds the trigger and the menu: the arrows move a highlight over the
 * enabled items (and open the closed menu on the first one), Home / End jump
 * to the ends, Enter or Space activates the highlighted item, typing jumps to
 * an item by its label, Escape or a press outside closes. Call in an
 * injection context.
 */
export function createDropdownRoot(state: {
  open: Signal<boolean>;
  setOpen(open: boolean): void;
  surface: Signal<Surface>;
}): DropdownRoot {
  const root = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  const injector = inject(Injector);
  const highlighted = signal<string | null>(null);
  const items: DropdownItemEntry[] = [];

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
    typeaheadTimer = setTimeout(() => {
      typed = '';
    }, DROPDOWN_TYPEAHEAD_RESET_MS);
  };
  inject(DestroyRef).onDestroy(() => clearTimeout(typeaheadTimer));

  injectClickOutside(() => root, close);
  injectEscape(close, () => state.open());
  effect(() => {
    if (!state.open()) highlighted.set(null);
  });

  return {
    open: state.open,
    surface: state.surface,
    menuId: injectId(),
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
    onKeydown(event) {
      const { key } = event;
      if (key === 'ArrowDown' || key === 'ArrowUp') {
        event.preventDefault();
        if (!state.open()) {
          state.setOpen(true);
          // Items are created as the menu renders: highlight the first one then
          // — unless the menu stayed closed.
          afterNextRender(
            () => {
              const [first] = enabledValues();
              if (state.open() && first) highlighted.set(first);
            },
            { injector },
          );
          return;
        }
        const values = enabledValues();
        if (values.length === 0) return;
        highlighted.set(nextDropdownHighlight(values, highlighted(), key === 'ArrowDown' ? 1 : -1) ?? null);
        return;
      }
      if (key === 'Home' || key === 'End') {
        event.preventDefault();
        const values = enabledValues();
        if (values.length === 0) return;
        state.setOpen(true);
        highlighted.set(key === 'Home' ? values[0]! : values[values.length - 1]!);
        return;
      }
      if ((key === 'Enter' || key === ' ') && state.open() && highlighted()) {
        event.preventDefault();
        selectHighlighted();
        return;
      }
      if (state.open() && isTypeaheadKey(key)) typeahead(key);
    },
  };
}
