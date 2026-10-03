import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CAROUSEL_DOTS_LABEL,
  CAROUSEL_NEXT_LABEL,
  CAROUSEL_PREVIOUS_LABEL,
  canRunCarousel,
  carouselArrowDisabled,
  carouselClasses,
  carouselDotClasses,
  carouselDotCount,
  carouselDotLabel,
  carouselItemClasses,
  carouselKeyStep,
  carouselOptions,
  carouselOptionsEqual,
  carouselPluginsEqual,
  carouselSlideLabel,
  carouselStatus,
  surfaceClasses,
} from '../../../index';

describe('carousel options', () => {
  it('defaults to no loop, start alignment and one slide per step, on the orientation axis', () => {
    expect(carouselOptions(undefined, { orientation: 'horizontal', reducedMotion: false })).toEqual({
      loop: false,
      align: 'start',
      slidesToScroll: 1,
      axis: 'x',
      duration: 25,
    });
    expect(carouselOptions({}, { orientation: 'vertical', reducedMotion: false })).toMatchObject({ axis: 'y' });
  });

  it("keeps the consumer's options, the ones it passes as undefined too", () => {
    expect(
      carouselOptions(
        { loop: true, align: 'center', slidesToScroll: 2, dragFree: true, duration: 40 },
        { orientation: 'horizontal', reducedMotion: false },
      ),
    ).toEqual({ loop: true, align: 'center', slidesToScroll: 2, dragFree: true, axis: 'x', duration: 40 });
    expect(carouselOptions({ loop: undefined }, { orientation: 'horizontal', reducedMotion: false }).loop).toBeUndefined();
  });

  it('owns the axis, and jumps instead of scrolling for a reader who prefers reduced motion', () => {
    const opts = { axis: 'y', duration: 40 } as { duration: number };
    expect(carouselOptions(opts, { orientation: 'horizontal', reducedMotion: true })).toMatchObject({ axis: 'x', duration: 0 });
  });
});

describe('carousel engine support', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('runs Embla only with matchMedia, IntersectionObserver and ResizeObserver', () => {
    // jsdom has none of them.
    expect(canRunCarousel()).toBe(false);
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    vi.stubGlobal('IntersectionObserver', class {});
    expect(canRunCarousel()).toBe(false);
    vi.stubGlobal('ResizeObserver', class {});
    expect(canRunCarousel()).toBe(true);
    vi.stubGlobal('matchMedia', undefined);
    expect(canRunCarousel()).toBe(false);
  });

  it('never runs it on the server', () => {
    vi.stubGlobal('window', undefined);
    expect(canRunCarousel()).toBe(false);
  });
});

describe('carousel option equality', () => {
  it('compares values, nested records deeply and functions by source', () => {
    const watch = () => true;
    expect(carouselOptionsEqual({ loop: true, align: 'start' }, { align: 'start', loop: true })).toBe(true);
    expect(carouselOptionsEqual({ loop: true }, { loop: false })).toBe(false);
    expect(carouselOptionsEqual({ loop: true }, { loop: true, align: 'start' })).toBe(false);
    expect(carouselOptionsEqual({ watchDrag: watch }, { watchDrag: () => true })).toBe(true);
    expect(carouselOptionsEqual({ watchDrag: watch }, { watchDrag: () => false })).toBe(false);
    expect(carouselOptionsEqual({ snaps: [1, 2] }, { snaps: [1, 2] })).toBe(true);
    expect(carouselOptionsEqual({ snaps: [1, 2] }, { snaps: [1, 3] })).toBe(false);
    expect(carouselOptionsEqual({ snaps: [1] }, { snaps: 1 })).toBe(false);
  });

  it('tells breakpoint sets apart by their queries', () => {
    expect(
      carouselOptionsEqual(
        { breakpoints: { '(min-width: 768px)': { loop: true } } },
        { breakpoints: { '(min-width: 768px)': { loop: true } } },
      ),
    ).toBe(true);
    expect(
      carouselOptionsEqual(
        { breakpoints: { '(min-width: 768px)': { loop: true } } },
        { breakpoints: { '(min-width: 1024px)': { loop: true } } },
      ),
    ).toBe(false);
  });

  it('compares plugin lists by name and options, in any order', () => {
    const autoplay = (delay: number) => ({ name: 'autoplay', options: { delay } });
    const fade = { name: 'fade', options: {} };
    expect(carouselPluginsEqual([autoplay(4000), fade], [fade, autoplay(4000)])).toBe(true);
    expect(carouselPluginsEqual([autoplay(4000)], [autoplay(2000)])).toBe(false);
    expect(carouselPluginsEqual([autoplay(4000)], [autoplay(4000), fade])).toBe(false);
    expect(carouselPluginsEqual([], [])).toBe(true);
  });
});

describe('carousel keyboard and labels', () => {
  it('steps with the arrow keys of its orientation only', () => {
    expect(carouselKeyStep('ArrowLeft', 'horizontal')).toBe(-1);
    expect(carouselKeyStep('ArrowRight', 'horizontal')).toBe(1);
    expect(carouselKeyStep('ArrowUp', 'horizontal')).toBe(0);
    expect(carouselKeyStep('ArrowUp', 'vertical')).toBe(-1);
    expect(carouselKeyStep('ArrowDown', 'vertical')).toBe(1);
    expect(carouselKeyStep('ArrowRight', 'vertical')).toBe(0);
    expect(carouselKeyStep('Home', 'horizontal')).toBe(0);
  });

  it('names slides and dots by position, and announces the current slide', () => {
    expect(carouselSlideLabel(0, 3)).toBe('Slide 1 of 3');
    expect(carouselStatus(2, 3)).toBe('Slide 3 of 3');
    expect(carouselStatus(0, 0)).toBe('');
    expect(carouselDotLabel(1)).toBe('Go to slide 2');
    expect([CAROUSEL_PREVIOUS_LABEL, CAROUSEL_NEXT_LABEL, CAROUSEL_DOTS_LABEL]).toEqual([
      'Previous slide',
      'Next slide',
      'Slide navigation',
    ]);
  });

  it('disables an arrow that cannot scroll unless the carousel loops', () => {
    expect(carouselArrowDisabled(false, false)).toBe(true);
    expect(carouselArrowDisabled(false, undefined)).toBe(true);
    expect(carouselArrowDisabled(false, true)).toBe(false);
    expect(carouselArrowDisabled(true, false)).toBe(false);
  });

  it('shows a dot per scroll snap, or per slide until Embla reports', () => {
    expect(carouselDotCount(2, 5)).toBe(2);
    expect(carouselDotCount(0, 5)).toBe(5);
  });
});

describe('carousel recipes', () => {
  const ring =
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg focus-visible:ring-retro-cyan/60';

  it('lays the strip out along the orientation, with arrows on its ends', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      const arrow = `absolute z-10 inline-flex items-center justify-center w-9 h-9 ${s.border} ${s.radius} ${s.transition} ${s.press} border-retro-border bg-retro-surface/80 text-retro-text hover:bg-retro-surface focus-visible:outline-hidden ${ring} disabled:opacity-50 disabled:cursor-not-allowed`;
      expect(carouselClasses(surface, 'horizontal')).toEqual({
        root: `relative focus-visible:outline-hidden ${ring} ${s.radiusLg}`,
        viewport: `overflow-hidden ${s.radiusLg}`,
        track: 'flex flex-row',
        previous: `${arrow} left-2 inset-y-0 my-auto`,
        next: `${arrow} right-2 inset-y-0 my-auto`,
        dots: 'flex justify-center gap-1.5 mt-3',
      });
      expect(carouselClasses(surface, 'vertical')).toMatchObject({
        track: 'flex flex-col h-full',
        previous: `${arrow} top-2 inset-x-0 mx-auto rotate-90`,
        next: `${arrow} bottom-2 inset-x-0 mx-auto rotate-90`,
        dots: 'flex justify-center gap-1.5 flex-col items-center ml-3 absolute right-2 top-1/2 -translate-y-1/2',
      });
    }
  });

  // Regression: the arrows were centred by `-translate-y-1/2` (in a vertical
  // carousel `-translate-x-1/2`), and the pixel press sets `translate` too, so
  // a pressed arrow jumped by half its size instead of nudging 2px.
  it('centres the arrows without a translate, leaving it to the pixel press', () => {
    for (const orientation of ['horizontal', 'vertical'] as const) {
      const { previous, next } = carouselClasses('pixel', orientation);
      for (const arrow of [previous, next].map((classes) => classes.split(' '))) {
        expect(arrow.filter((name) => /^-?translate-/.test(name))).toEqual([]);
        expect(arrow).toEqual(expect.arrayContaining(['active:translate-x-[2px]', 'active:translate-y-[2px]']));
      }
    }
  });

  // Regression: vertical dots also took the horizontal `mt-3`, which Tailwind
  // emits after their `mt-0`, so they sat 12px below the middle.
  it('centres vertical dots on the right edge, with no top margin', () => {
    expect(carouselClasses('pixel', 'vertical').dots.split(' ')).not.toContain('mt-3');
  });

  it('fills the current dot in cyan, square on the pixel surface and round on the linear one', () => {
    const pixel = surfaceClasses('pixel');
    expect(carouselDotClasses('pixel', true)).toBe(
      `h-2 w-2 ${pixel.border} rounded-none ${pixel.transition} bg-retro-cyan border-retro-cyan focus-visible:outline-hidden ${ring}`,
    );
    const linear = surfaceClasses('linear');
    expect(carouselDotClasses('linear', false)).toBe(
      `h-2 w-2 ${linear.border} rounded-full ${linear.transition} bg-retro-bg/40 border-retro-border hover:bg-retro-surface focus-visible:outline-hidden ${ring}`,
    );
    expect(carouselItemClasses).toBe('min-w-0 shrink-0 grow-0 basis-full');
  });
});
