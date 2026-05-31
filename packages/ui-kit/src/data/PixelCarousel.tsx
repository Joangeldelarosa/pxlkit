'use client';

import React, { forwardRef, useCallback, useEffect, useId, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaCarouselType, EmblaOptionsType, EmblaPluginType } from 'embla-carousel';
import { Surface, cn, surfaceClasses, useEffectiveSurface } from '../common';
import { useReducedMotion } from '../hooks/useReducedMotion';

type Orientation = 'horizontal' | 'vertical';

export interface PixelCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Full embla options surface (see embla-carousel docs). Common subset:
   * `loop`, `align`, `slidesToScroll`, `startIndex`, `dragFree`,
   * `containScroll`, `inViewThreshold`. `axis` is set internally from
   * `orientation`.
   */
  opts?: Omit<EmblaOptionsType, 'axis'>;
  /** Optional embla plugins (autoplay, autoScroll, etc.). */
  plugins?: EmblaPluginType[];
  /** Receives the embla API once ready; called again with `undefined` on unmount. */
  setApi?: (api: EmblaCarouselType | undefined) => void;
  orientation?: Orientation;
  showArrows?: boolean;
  showDots?: boolean;
  surface?: Surface;
  /** Accessible name for the carousel region (required for landmark navigation). */
  'aria-label'?: string;
  children: React.ReactNode;
}

interface PixelCarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CarouselItemCtx {
  index: number;
  total: number;
}

const CarouselItemContext = React.createContext<CarouselItemCtx | null>(null);

const PixelCarouselItem = forwardRef<HTMLDivElement, PixelCarouselItemProps>(
  function PixelCarouselItem({ children, className, ...rest }, ref) {
    const ctx = React.useContext(CarouselItemContext);
    const ariaLabel = ctx ? `Slide ${ctx.index + 1} of ${ctx.total}` : undefined;
    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"
        aria-label={ariaLabel}
        className={cn('min-w-0 shrink-0 grow-0 basis-full', className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
PixelCarouselItem.displayName = 'PixelCarousel.Item';

const PixelCarouselRoot = forwardRef<HTMLDivElement, PixelCarouselProps>(function PixelCarousel(
  {
    opts,
    plugins,
    setApi,
    orientation = 'horizontal',
    showArrows = true,
    showDots = false,
    surface: surfaceProp,
    children,
    className,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const isVertical = orientation === 'vertical';
  const carouselId = useId();
  const reducedMotion = useReducedMotion();

  const emblaOptions = useMemo<EmblaOptionsType>(
    () => ({
      loop: opts?.loop ?? false,
      align: opts?.align ?? 'start',
      slidesToScroll: opts?.slidesToScroll ?? 1,
      ...opts,
      axis: isVertical ? 'y' : 'x',
      // Respect prefers-reduced-motion by zeroing out embla's drag/scroll dur.
      duration: reducedMotion ? 0 : (opts as { duration?: number } | undefined)?.duration ?? 25,
    }),
    [opts, isVertical, reducedMotion],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, plugins);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Expose embla API to the parent (shadcn-style escape hatch).
  useEffect(() => {
    if (!setApi) return;
    setApi(emblaApi ?? undefined);
    return () => setApi(undefined);
  }, [emblaApi, setApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (isVertical) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollPrev();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollNext();
      }
    } else {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollNext();
      }
    }
  };

  // Derive slide count from children for dots fallback when api hasn't reported yet.
  const childArray = React.Children.toArray(children).filter(React.isValidElement);
  const dotCount = scrollSnaps.length > 0 ? scrollSnaps.length : childArray.length;
  const total = childArray.length;

  // Wrap each Item child in an index/total context so its aria-label can read
  // "Slide N of M". Done via a Provider per child rather than cloneElement to
  // support user-defined wrapper components around Items.
  const wrappedChildren = childArray.map((child, i) => (
    <CarouselItemContext.Provider key={(child as React.ReactElement).key ?? i} value={{ index: i, total }}>
      {child}
    </CarouselItemContext.Provider>
  ));

  return (
    <div
      ref={ref}
      role="region"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        'relative outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg focus-visible:ring-retro-cyan/60',
        s.radiusLg,
        className,
      )}
      {...rest}
    >
      {/* Dedicated live region: announces only the slide index, not the slide
          content itself (APG recommendation). */}
      <span
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {total > 0 ? `Slide ${selectedIndex + 1} of ${total}` : ''}
      </span>
      <div
        ref={emblaRef}
        className={cn('overflow-hidden', s.radiusLg)}
        id={`${carouselId}-viewport`}
      >
        <div
          className={cn(
            'flex',
            isVertical ? 'flex-col h-full' : 'flex-row',
          )}
        >
          {wrappedChildren}
        </div>
      </div>

      {showArrows && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            aria-controls={`${carouselId}-viewport`}
            disabled={!canPrev && !(opts?.loop)}
            onClick={scrollPrev}
            className={cn(
              'absolute z-10 inline-flex items-center justify-center w-9 h-9',
              s.border,
              s.radius,
              s.transition,
              s.press,
              'border-retro-border bg-retro-surface/80 text-retro-text',
              'hover:bg-retro-surface',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg focus-visible:ring-retro-cyan/60',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isVertical
                ? 'top-2 left-1/2 -translate-x-1/2 rotate-90'
                : 'left-2 top-1/2 -translate-y-1/2',
            )}
          >
            <span aria-hidden="true">{'<'}</span>
          </button>
          <button
            type="button"
            aria-label="Next slide"
            aria-controls={`${carouselId}-viewport`}
            disabled={!canNext && !(opts?.loop)}
            onClick={scrollNext}
            className={cn(
              'absolute z-10 inline-flex items-center justify-center w-9 h-9',
              s.border,
              s.radius,
              s.transition,
              s.press,
              'border-retro-border bg-retro-surface/80 text-retro-text',
              'hover:bg-retro-surface',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg focus-visible:ring-retro-cyan/60',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isVertical
                ? 'bottom-2 left-1/2 -translate-x-1/2 rotate-90'
                : 'right-2 top-1/2 -translate-y-1/2',
            )}
          >
            <span aria-hidden="true">{'>'}</span>
          </button>
        </>
      )}

      {showDots && dotCount > 0 && (
        <div
          className={cn(
            'flex justify-center gap-1.5 mt-3',
            isVertical && 'flex-col items-center mt-0 ml-3 absolute right-2 top-1/2 -translate-y-1/2',
          )}
          role="group"
          aria-label="Slide navigation"
        >
          {Array.from({ length: dotCount }).map((_, i) => {
            const active = i === selectedIndex;
            return (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={active ? 'true' : undefined}
                aria-controls={`${carouselId}-viewport`}
                onClick={() => scrollTo(i)}
                className={cn(
                  'h-2 w-2',
                  s.border,
                  surface === 'pixel' ? 'rounded-none' : 'rounded-full',
                  s.transition,
                  active
                    ? 'bg-retro-cyan border-retro-cyan'
                    : 'bg-retro-bg/40 border-retro-border hover:bg-retro-surface',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg focus-visible:ring-retro-cyan/60',
                )}
              />
            );
          })}
        </div>
      )}
    </div>
  );
});

PixelCarouselRoot.displayName = 'PixelCarousel';

type PixelCarouselNamespace = typeof PixelCarouselRoot & {
  Item: typeof PixelCarouselItem;
};

const PixelCarouselBase = PixelCarouselRoot as PixelCarouselNamespace;
PixelCarouselBase.Item = PixelCarouselItem;

export const PixelCarousel = PixelCarouselBase;
export { PixelCarouselItem };
