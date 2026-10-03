/**
 * PixelToggleGroup — a row of toggles sharing one value: the radios of a
 * radiogroup in single mode, pressed buttons in multiple mode, with arrow
 * keys moving focus between them.
 */

/** `single`: one value (a string, `''` for none); `multiple`: any number of values. */
export type ToggleGroupType = 'single' | 'multiple';

/** The row holding the toggles. */
export const toggleGroupClasses = 'inline-flex items-center gap-1';

/**
 * Role of the row: a radiogroup in single mode. In multiple mode a group, but
 * only when it has a name — an unnamed group adds nothing a screen reader can
 * announce.
 */
export function toggleGroupRole(type: ToggleGroupType, named: boolean): 'radiogroup' | 'group' | undefined {
  if (type === 'single') return 'radiogroup';
  return named ? 'group' : undefined;
}

/** The value of a group with nothing pressed. */
export function toggleGroupEmptyValue(type: ToggleGroupType): string | string[] {
  return type === 'multiple' ? [] : '';
}

/** Whether the toggle `item` is pressed in a group holding `value`. */
export function toggleGroupIsPressed(type: ToggleGroupType, value: string | string[], item: string): boolean {
  if (type === 'multiple') return Array.isArray(value) && value.includes(item);
  return value === item;
}

/**
 * The group's value once `item` is pressed: in multiple mode the item is
 * added, or removed when it was in; in single mode it becomes the value, or
 * the value empties when it already was.
 */
export function toggleGroupToggle(type: ToggleGroupType, value: string | string[], item: string): string | string[] {
  if (type === 'multiple') {
    const current = Array.isArray(value) ? value : [];
    return current.includes(item) ? current.filter((v) => v !== item) : [...current, item];
  }
  return value === item ? '' : item;
}

/** A focus move between toggles: one step forward or back, or to an end. */
export type ToggleGroupMove = 1 | -1 | 'first' | 'last';

/** The move a key makes from a toggle, or `undefined` for a key that makes none. */
export function toggleGroupKeyMove(key: string): ToggleGroupMove | undefined {
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

/**
 * The toggle a move from `current` lands on, among `order` (the toggles in
 * the order they registered): the next or previous one — wrapping round with
 * `loop`, else stopping at the ends — or the first or last. `undefined` when
 * the group has no toggles, or `current` is not one of them.
 */
export function toggleGroupMoveTarget(
  order: readonly string[],
  current: string,
  move: ToggleGroupMove,
  loop: boolean,
): string | undefined {
  if (order.length === 0) return undefined;
  if (move === 'first') return order[0];
  if (move === 'last') return order[order.length - 1];
  const index = order.indexOf(current);
  if (index === -1) return undefined;
  const next = index + move;
  return order[loop ? (next + order.length) % order.length : Math.max(0, Math.min(order.length - 1, next))];
}
