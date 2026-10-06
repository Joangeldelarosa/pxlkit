/**
 * Floating content (popovers, tooltips, menus) anchored to a reference
 * element, positioned with Floating UI.
 *
 * The inline styles follow `@floating-ui/react-dom`'s `floatingStyles`
 * exactly, so the Vue and Angular kits position their floating elements the
 * way the React kit does: `position` + `left: 0; top: 0` until the element
 * exists, then a `translate()` rounded to the device pixel ratio.
 */
import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  type Middleware,
  type Placement,
  type Strategy,
} from '@floating-ui/dom';

export type FloatingSide = 'top' | 'bottom' | 'left' | 'right';
export type FloatingAlign = 'start' | 'center' | 'end';
export type { Middleware, Placement, Strategy };

/** `side` + `align` → a Floating UI placement (`bottom`, `right-start`, …). */
export function toPlacement(side: FloatingSide, align: FloatingAlign): Placement {
  return align === 'center' ? side : (`${side}-${align}` as Placement);
}

/** Offset from the reference, flip to the opposite side when needed, shift to stay in view. */
export function anchoredMiddleware(sideOffset: number): Middleware[] {
  return [offset(sideOffset), flip(), shift({ padding: 8 })];
}

/** Inline styles of a floating element, camelCase keys with CSS string values. */
export type FloatingStyles = Record<string, string>;

function devicePixelRatio(element: Element): number {
  if (typeof window === 'undefined') return 1;
  const view = element.ownerDocument.defaultView ?? window;
  return view.devicePixelRatio || 1;
}

function roundByDevicePixelRatio(element: Element, value: number): number {
  const ratio = devicePixelRatio(element);
  return Math.round(value * ratio) / ratio;
}

/**
 * The inline styles of a floating element: `floating` is the element (or
 * `null` before it exists) and `x` / `y` its last computed position.
 */
export function floatingStyles(
  floating: Element | null,
  x: number,
  y: number,
  strategy: Strategy = 'absolute',
): FloatingStyles {
  const initial: FloatingStyles = { position: strategy, left: '0px', top: '0px' };
  if (!floating) return initial;
  const styles: FloatingStyles = {
    ...initial,
    transform: `translate(${roundByDevicePixelRatio(floating, x)}px, ${roundByDevicePixelRatio(floating, y)}px)`,
  };
  if (devicePixelRatio(floating) >= 1.5) styles.willChange = 'transform';
  return styles;
}

export interface AnchorOptions {
  placement: Placement;
  middleware: Middleware[];
  strategy?: Strategy;
}

/**
 * Keep `floating` positioned against `reference` — on scroll, resize and
 * layout changes — reporting each new position. Returns the stop function.
 */
export function anchorFloating(
  reference: Element,
  floating: HTMLElement,
  options: AnchorOptions,
  onPosition: (position: { x: number; y: number; placement: Placement }) => void,
): () => void {
  let stopped = false;
  const update = () => {
    void computePosition(reference, floating, {
      placement: options.placement,
      strategy: options.strategy ?? 'absolute',
      middleware: options.middleware,
    }).then(({ x, y, placement }) => {
      if (!stopped) onPosition({ x, y, placement });
    });
  };
  const cleanup = autoUpdate(reference, floating, update);
  return () => {
    stopped = true;
    cleanup();
  };
}
