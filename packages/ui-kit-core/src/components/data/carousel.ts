/**
 * PixelCarousel — slides scrolled by Embla (`embla-carousel`), with
 * previous / next buttons, dots, arrow keys and a polite announcement of the
 * current slide (WAI-ARIA carousel pattern). The core knows Embla's options
 * only by shape, so it takes no dependency on it.
 */
import { cn, surfaceClasses, type Surface } from '../../common';

export type CarouselOrientation = 'horizontal' | 'vertical';

/** The Embla options PixelCarousel gives a default or derives; the others pass through. */
export interface CarouselBaseOptions {
  loop?: boolean;
  align?: 'start' | 'center' | 'end' | ((viewSize: number, snapSize: number, index: number) => number);
  slidesToScroll?: 'auto' | number;
  duration?: number;
}

export interface CarouselOptionsContext {
  orientation: CarouselOrientation;
  /** The reader prefers reduced motion: scrolls jump instead of gliding. */
  reducedMotion: boolean;
}

/**
 * The options handed to Embla: the consumer's on top of the kit's defaults
 * (no loop, slides aligned to the start, one slide per step), the axis from
 * the orientation, and no scroll animation for a reader who prefers reduced
 * motion.
 */
export function carouselOptions<O extends CarouselBaseOptions>(
  opts: O | undefined,
  { orientation, reducedMotion }: CarouselOptionsContext,
): O & { axis: 'x' | 'y'; duration: number } {
  return {
    loop: false,
    align: 'start',
    slidesToScroll: 1,
    // Spreading `undefined` adds nothing; the cast keeps the consumer's option types.
    ...(opts as O),
    axis: orientation === 'vertical' ? 'y' : 'x',
    duration: reducedMotion ? 0 : (opts?.duration ?? 25),
  };
}

/**
 * Whether Embla can run here: it needs `matchMedia`, `IntersectionObserver`
 * and `ResizeObserver`, and throws where one is missing (jsdom, old
 * WebViews). There the carousel stays on its first slide.
 */
export function canRunCarousel(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    typeof IntersectionObserver === 'function' &&
    typeof ResizeObserver === 'function'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> | unknown[] {
  return Object.prototype.toString.call(value) === '[object Object]' || Array.isArray(value);
}

/**
 * Whether two Embla option sets are the same: same keys and breakpoints,
 * equal values, records compared deeply and functions by their source — so
 * options rebuilt with the same content do not re-initialise the carousel.
 */
export function carouselOptionsEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  const breakpoints = (options: Record<string, unknown>) =>
    JSON.stringify(Object.keys((options.breakpoints as Record<string, unknown> | undefined) ?? {}));
  if (breakpoints(a) !== breakpoints(b)) return false;
  return keys.every((key) => {
    const valueA = a[key];
    const valueB = b[key];
    if (typeof valueA === 'function') return `${valueA}` === `${valueB}`;
    if (!isRecord(valueA) || !isRecord(valueB)) return valueA === valueB;
    return carouselOptionsEqual(valueA as Record<string, unknown>, valueB as Record<string, unknown>);
  });
}

/** An Embla plugin, as far as comparing plugin lists needs it. */
export interface CarouselPluginLike {
  name: string;
  options: object;
}

/** Whether two plugin lists hold the same plugins (in any order) with equal options. */
export function carouselPluginsEqual(a: readonly CarouselPluginLike[], b: readonly CarouselPluginLike[]): boolean {
  if (a.length !== b.length) return false;
  const optionsOf = (plugins: readonly CarouselPluginLike[]) =>
    [...plugins].sort((x, y) => (x.name > y.name ? 1 : -1)).map((plugin) => plugin.options as Record<string, unknown>);
  const optionsB = optionsOf(b);
  return optionsOf(a).every((options, index) => carouselOptionsEqual(options, optionsB[index]));
}

/**
 * The step an arrow key takes along the orientation: -1 to the previous
 * slide, 1 to the next, 0 for any other key.
 */
export function carouselKeyStep(key: string, orientation: CarouselOrientation): -1 | 0 | 1 {
  const [previous, next] = orientation === 'vertical' ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight'];
  if (key === previous) return -1;
  if (key === next) return 1;
  return 0;
}

/** Accessible name of the slide at `index`, and the announcement when it is the current one. */
export function carouselSlideLabel(index: number, total: number): string {
  return `Slide ${index + 1} of ${total}`;
}

/** The live region's text: the current slide, or nothing without slides. */
export function carouselStatus(selected: number, total: number): string {
  return total > 0 ? carouselSlideLabel(selected, total) : '';
}

/** Accessible name of the dot that scrolls to the slide at `index`. */
export function carouselDotLabel(index: number): string {
  return `Go to slide ${index + 1}`;
}

export const CAROUSEL_PREVIOUS_LABEL = 'Previous slide';
export const CAROUSEL_NEXT_LABEL = 'Next slide';
export const CAROUSEL_DOTS_LABEL = 'Slide navigation';

/**
 * Whether an arrow button is disabled: when it cannot scroll, unless the
 * carousel loops (it then stays enabled before Embla reports).
 */
export function carouselArrowDisabled(canScroll: boolean, loop: boolean | undefined): boolean {
  return !canScroll && !loop;
}

/** Number of dots: one per scroll snap, or one per slide until Embla reports its snaps. */
export function carouselDotCount(snaps: number, slides: number): number {
  return snaps > 0 ? snaps : slides;
}

/** A slide: a full-width (or full-height) flex item. */
export const carouselItemClasses = 'min-w-0 shrink-0 grow-0 basis-full';

// The cyan keyboard focus ring of the region, the arrows and the dots.
const focusVisibleRing =
  'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg focus-visible:ring-retro-cyan/60';

export interface CarouselClasses {
  /** The focusable region. */
  root: string;
  /** Embla's viewport. */
  viewport: string;
  /** Embla's container: the strip of slides. */
  track: string;
  previous: string;
  next: string;
  /** The group of dots. */
  dots: string;
}

/** Classes of the region, the viewport and strip, the arrow buttons and the dots' group. */
export function carouselClasses(surface: Surface, orientation: CarouselOrientation): CarouselClasses {
  const s = surfaceClasses(surface);
  const vertical = orientation === 'vertical';
  const arrow = cn(
    'absolute z-10 inline-flex items-center justify-center w-9 h-9',
    s.border,
    s.radius,
    s.transition,
    s.press,
    'border-retro-border bg-retro-surface/80 text-retro-text',
    'hover:bg-retro-surface',
    `focus-visible:outline-hidden ${focusVisibleRing}`,
    'disabled:opacity-50 disabled:cursor-not-allowed',
  );
  return {
    root: cn(`relative focus-visible:outline-hidden ${focusVisibleRing}`, s.radiusLg),
    viewport: cn('overflow-hidden', s.radiusLg),
    track: cn('flex', vertical ? 'flex-col h-full' : 'flex-row'),
    // Centred by auto margins rather than a translate: the pixel press nudges
    // the arrow with `translate`, which would replace a centring one.
    previous: cn(arrow, vertical ? 'top-2 inset-x-0 mx-auto rotate-90' : 'left-2 inset-y-0 my-auto'),
    next: cn(arrow, vertical ? 'bottom-2 inset-x-0 mx-auto rotate-90' : 'right-2 inset-y-0 my-auto'),
    dots: cn(
      'flex justify-center gap-1.5',
      vertical ? 'flex-col items-center ml-3 absolute right-2 top-1/2 -translate-y-1/2' : 'mt-3',
    ),
  };
}

/** A dot: filled in cyan for the current slide. */
export function carouselDotClasses(surface: Surface, active: boolean): string {
  const s = surfaceClasses(surface);
  return cn(
    'h-2 w-2',
    s.border,
    surface === 'pixel' ? 'rounded-none' : 'rounded-full',
    s.transition,
    active ? 'bg-retro-cyan border-retro-cyan' : 'bg-retro-bg/40 border-retro-border hover:bg-retro-surface',
    `focus-visible:outline-hidden ${focusVisibleRing}`,
  );
}
