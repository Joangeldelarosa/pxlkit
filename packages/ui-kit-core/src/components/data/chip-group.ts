/**
 * PixelChipGroup — the chip row, the toggle button around each chip, and the
 * selection logic: single selection is a radio group (roving tabindex, arrow
 * keys select), multiple selection a group of checkboxes.
 */
import { cn, surfaceClasses, type Surface } from '../../common';

/** The row. */
export const chipGroupClasses = 'inline-flex flex-row flex-wrap items-center gap-1.5';

/**
 * The toggle button around a chip: a bare button (the chip paints itself).
 * On the linear surface a selected chip is ringed, and keyboard focus sets
 * the ring off the chip, so focus and selection read apart. The pixel
 * surface's cut corners clip any ring: there a selected chip carries a
 * frame inside its border, and focus lights up the chip's edge from a layer
 * over the chip — the chip, which clips itself, paints over the button's
 * own outline.
 */
export function chipGroupItemClasses(surface: Surface, selected: boolean): string {
  const pixel = surface === 'pixel';
  return cn(
    'bg-transparent border-0 p-0 m-0 text-inherit cursor-pointer',
    'inline-flex items-center transition-colors',
    'focus-visible:outline-hidden',
    surfaceClasses(surface).radius,
    pixel
      ? 'relative focus-visible:after:absolute focus-visible:after:inset-0 focus-visible:after:pxl-focus-inset'
      : 'focus-visible:ring-2 focus-visible:ring-retro-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg',
    selected && (pixel ? '*:outline-2 *:outline-solid *:-outline-offset-4 *:outline-retro-cyan/60' : 'ring-2 ring-retro-cyan/60'),
  );
}

/**
 * Role of the row: a radio group for single selection; for multiple
 * selection a group only when it has an accessible name, as an unnamed
 * group would be announced for nothing.
 */
export function chipGroupRole(multiple: boolean, named: boolean): 'radiogroup' | 'group' | undefined {
  if (!multiple) return 'radiogroup';
  return named ? 'group' : undefined;
}

/** The selection after a chip is toggled: added or removed (multiple), selected alone or cleared (single). */
export function toggleChipSelection(selection: readonly string[], value: string, multiple: boolean): string[] {
  const selected = selection.includes(value);
  if (multiple) return selected ? selection.filter((v) => v !== value) : [...selection, value];
  return selected ? [] : [value];
}

/** Where a key moves in single selection: to a neighbour, or to the first / last chip. */
export type ChipGroupMove = 1 | -1 | 'first' | 'last';

/**
 * What a key does on a chip: Enter and Space toggle it; in single selection
 * the arrow keys, Home and End move between chips.
 */
export function chipGroupKeyAction(key: string, multiple: boolean): 'toggle' | ChipGroupMove | undefined {
  if (key === 'Enter' || key === ' ') return 'toggle';
  if (multiple) return undefined;
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return 1;
    case 'ArrowLeft':
    case 'ArrowUp':
      return -1;
    case 'Home':
      return 'first';
    case 'End':
      return 'last';
    default:
      return undefined;
  }
}

export interface ChipGroupMoveResult {
  /** The chip that receives focus. */
  focus: string;
  /** The new selection; `undefined` when the chip is already the one selected. */
  selection: string[] | undefined;
}

/**
 * A move in single selection, from the chip `current`: the neighbour on that
 * side (stopping at the ends) or the first / last chip gets focus and is
 * selected — a move never clears the selection. `undefined` when there is
 * nowhere to go.
 */
export function chipGroupMove(
  values: readonly string[],
  selection: readonly string[],
  current: string,
  move: ChipGroupMove,
): ChipGroupMoveResult | undefined {
  if (values.length === 0) return undefined;
  let index: number;
  if (move === 'first') index = 0;
  else if (move === 'last') index = values.length - 1;
  else {
    const from = values.indexOf(current);
    if (from === -1) return undefined;
    index = Math.max(0, Math.min(values.length - 1, from + move));
  }
  const focus = values[index];
  return { focus, selection: selection.includes(focus) ? undefined : [focus] };
}

/** The chip Tab reaches in single selection: the selected one, else the first. */
export function chipGroupTabStop(values: readonly string[], selection: readonly string[]): string | undefined {
  return selection[0] ?? values[0];
}
