/**
 * PixelMouseParallax — a layer that follows the mouse, or flees it, easing
 * towards its target on every animation frame.
 */

/** The layer moves on every frame: it is composited on its own. */
export const mouseParallaxClasses = 'will-change-transform';

/** Share of the remaining distance to its target the layer covers on each frame. */
export const MOUSE_PARALLAX_EASING = 0.08;

export interface MouseParallaxOptions {
  /** Farthest the layer travels from its place on each axis, in px. */
  strength: number;
  /** Move away from the cursor instead of towards it. */
  invert: boolean;
}

/** An offset from the layer's place, in px. */
export interface MouseParallaxPoint {
  x: number;
  y: number;
}

/**
 * Where the cursor pulls the layer: the cursor's position across `rect` (the
 * box it is measured in), from -1 to 1 on each axis, times `strength` — the
 * other way when inverted.
 */
export function mouseParallaxTarget(
  pointer: { clientX: number; clientY: number },
  rect: { left: number; top: number; width: number; height: number },
  { strength, invert }: MouseParallaxOptions,
): MouseParallaxPoint {
  const nx = ((pointer.clientX - rect.left) / rect.width) * 2 - 1;
  const ny = ((pointer.clientY - rect.top) / rect.height) * 2 - 1;
  const sign = invert ? -1 : 1;
  return { x: nx * strength * sign, y: ny * strength * sign };
}

/** The transform of a layer at `point` from its place. */
export function mouseParallaxTransform({ x, y }: MouseParallaxPoint): string {
  return `translate3d(${x}px, ${y}px, 0)`;
}

export interface MouseParallaxMotion {
  /**
   * Follows the mouse across the page until the returned function is called:
   * each mouse move sets a target, measured in the box of the nearest
   * element with a `relative` class (the layer itself included) or of the
   * page, and each animation frame eases the layer towards it. Where the
   * layer is and where it heads carry over from one call to the next.
   */
  follow(options: MouseParallaxOptions): () => void;
}

/** The motion of a mouse parallax layer, still until it follows the mouse. */
export function createMouseParallaxMotion(element: HTMLElement): MouseParallaxMotion {
  const position: MouseParallaxPoint = { x: 0, y: 0 };
  let target: MouseParallaxPoint = { x: 0, y: 0 };
  return {
    follow(options) {
      let frame = 0;
      const onMouseMove = (event: MouseEvent) => {
        const box = element.closest('[class*="relative"]') || document.body;
        target = mouseParallaxTarget(event, box.getBoundingClientRect(), options);
      };
      const animate = () => {
        position.x += (target.x - position.x) * MOUSE_PARALLAX_EASING;
        position.y += (target.y - position.y) * MOUSE_PARALLAX_EASING;
        element.style.transform = mouseParallaxTransform(position);
        frame = requestAnimationFrame(animate);
      };
      window.addEventListener('mousemove', onMouseMove);
      frame = requestAnimationFrame(animate);
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        cancelAnimationFrame(frame);
      };
    },
  };
}
