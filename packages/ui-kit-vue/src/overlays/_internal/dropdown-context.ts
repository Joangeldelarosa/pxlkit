import { inject, type ComputedRef, type InjectionKey, type Ref } from 'vue';
import type { Surface, Tone } from '@pxlkit/ui-kit-core';

/** An item of the menu, as the root sees it. */
export interface DropdownItemEntry {
  value(): string;
  /** Id of the item's element, which the menu's `aria-activedescendant` points at. */
  id(): string;
  disabled(): boolean;
  /** Text typeahead matches; items with markup in their label have none. */
  label(): string | undefined;
  /** Runs the item's `select` (Enter / Space on the highlighted item). */
  select(): void;
}

/** The trigger, as the root sees it. */
export interface DropdownTriggerEntry {
  /** Its own id, if it has one. */
  id(): string | undefined;
  /** The button, which focus returns to. */
  element(): HTMLElement | null;
}

export interface PixelDropdownContext {
  open: Readonly<Ref<boolean>>;
  setOpen(open: boolean): void;
  surface: ComputedRef<Surface>;
  menuId: string;
  /** Id of the trigger, which names the menu: its own, or a generated one. */
  triggerId: ComputedRef<string>;
  /** Id of the highlighted item's element, for the menu's `aria-activedescendant`. */
  activeId: ComputedRef<string | undefined>;
  /** The root element, which the menu is anchored to. */
  root: Readonly<Ref<HTMLElement | null>>;
  highlighted: Readonly<Ref<string | null>>;
  highlight(value: string): void;
  /** Lists an item while it is rendered, in render order; returns the function that removes it. */
  registerItem(item: DropdownItemEntry): () => void;
  /** Lists the trigger while it is rendered; returns the function that removes it. */
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

export const PIXEL_DROPDOWN: InjectionKey<PixelDropdownContext> = Symbol('pixel-dropdown');

export function useDropdownContext(component: string): PixelDropdownContext {
  const context = inject(PIXEL_DROPDOWN, null);
  if (!context) throw new Error(`${component} must be used inside a <PixelDropdownRoot>`);
  return context;
}

/** Props of `PixelDropdownItem`, shared by the checkbox and radio items. */
export interface PixelDropdownItemProps {
  /** Identity of the item for highlight and typeahead (not a form value); generated when left out. */
  value?: string;
  /** Skipped by the keyboard and ignores the pointer. */
  disabled?: boolean;
  /** Red text, for a destructive action — same as `tone="red"`. */
  destructive?: boolean;
  /** Text tone. */
  tone?: Tone;
  /** Keyboard hint shown at the end of the row (display only). */
  shortcut?: string;
}

/**
 * The label of an item for typeahead: its text, when the label holds text
 * only — as the React kit reads string children.
 */
export function labelText(element: HTMLElement | null): string | undefined {
  if (!element || element.children.length > 0) return undefined;
  return element.textContent?.trim();
}
