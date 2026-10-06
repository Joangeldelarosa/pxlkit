/**
 * PixelParallaxLayer — a layer that moves with the scroll, faster or slower
 * than the page, re-placed on every animation frame.
 */

/** Axis a layer moves along. */
export type ParallaxAxis = 'x' | 'y' | 'both';

/** The layer moves on every frame: it is composited on its own. */
export const parallaxLayerClasses = 'will-change-transform';

export interface ParallaxLayerOptions {
  /** Multiplier of the scroll: 0 holds the layer in place, 1 moves it at scroll speed, a negative one reverses it. */
  speed: number;
  axis: ParallaxAxis;
}

/**
 * How far a layer moves: the distance from its centre to the viewport's
 * centre, in page coordinates, times `speed`.
 */
export function parallaxLayerOffset(
  rect: { top: number; height: number },
  scrollY: number,
  viewportHeight: number,
  speed: number,
): number {
  const centerY = rect.top + scrollY + rect.height / 2;
  const viewCenter = scrollY + viewportHeight / 2;
  return (viewCenter - centerY) * speed;
}

/** The transform that moves a layer by `offset` px along `axis`. */
export function parallaxLayerTransform(axis: ParallaxAxis, offset: number): string {
  if (axis === 'y') return `translate3d(0, ${offset}px, 0)`;
  if (axis === 'x') return `translate3d(${offset}px, 0, 0)`;
  return `translate3d(${offset}px, ${offset}px, 0)`;
}

/**
 * Moves `element` with the scroll: on every animation frame its transform
 * follows the page's scroll position. Returns the function that stops it;
 * the element keeps its last transform.
 */
export function followScroll(element: HTMLElement, { speed, axis }: ParallaxLayerOptions): () => void {
  let frame = 0;
  const update = () => {
    const offset = parallaxLayerOffset(element.getBoundingClientRect(), window.scrollY, window.innerHeight, speed);
    element.style.transform = parallaxLayerTransform(axis, offset);
    frame = requestAnimationFrame(update);
  };
  frame = requestAnimationFrame(update);
  return () => cancelAnimationFrame(frame);
}
