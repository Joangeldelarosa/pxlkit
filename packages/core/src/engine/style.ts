/**
 * A framework-neutral inline style: camelCase CSS property names mapped to
 * string values with their units already applied (`'32px'`, never `32`).
 *
 * It is the one shape every renderer accepts without translation — React's
 * `style` prop, Vue's `:style` binding, Angular's `[style]` binding and the
 * DOM itself (`Object.assign(element.style, map)`) — which lets the engine own
 * every presentational decision while the framework adapters stay thin.
 */
export type StyleMap = Readonly<Record<string, string>>;

/** Formats a CSS length in pixels. */
export function px(value: number): string {
  return `${value}px`;
}

/** Clamps `value` into the inclusive `[min, max]` range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
