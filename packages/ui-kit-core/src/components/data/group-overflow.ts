/**
 * The "+N" overflow of the grouped rows (PixelAvatarGroup, PixelBadgeGroup):
 * how many items show and how many collapse into the overflow item.
 */

export interface GroupOverflow {
  /** Items shown, from the start. */
  visible: number;
  /** Items left for the "+N" overflow; 0 when everything fits. */
  hidden: number;
}

/**
 * Split `count` items for a group showing at most `max`. When they do not
 * all fit, the "+N" item takes the last place: the first `max - 1` show.
 */
export function groupOverflow(count: number, max: number): GroupOverflow {
  const visible = count > max ? Math.max(0, max - 1) : count;
  return { visible, hidden: count - visible };
}
