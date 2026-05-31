/* ─────────────────────────────────────────────────────────────────────────
   animations — public types
   Shared, re-exported type vocabulary for the animation category.
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Possible trigger modes that decide *when* a `Pixel*` animation runs.
 *
 * - `'mount'`   — run as soon as the component mounts (default).
 * - `'hover'`   — run while the user hovers the wrapper.
 * - `'click'`   — run once per click, restarts on subsequent clicks.
 * - `'focus'`   — run while the wrapper has keyboard focus.
 * - `'inView'`  — run while the wrapper intersects the viewport.
 * - `boolean`   — fully controlled: `true` plays, `false` pauses/resets.
 */
export type AnimationTrigger = 'mount' | 'hover' | 'click' | 'focus' | 'inView' | boolean;

/**
 * CSS `animation-iteration-count` shape: a finite number of repeats, or the
 * string literal `'infinite'`.
 */
export type AnimationRepeat = number | 'infinite';
