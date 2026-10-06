'use client';

import React, { forwardRef, useCallback, useEffect, useId, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaCarouselType, EmblaOptionsType, EmblaPluginType } from 'embla-carousel';
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
  carouselSlideLabel,
  carouselStatus,
  type CarouselOrientation,
} from '@pxlkit/ui-kit-core';
import { Surface, cn, useEffectiveSurface } from '../common';
import { useReducedMotion } from '../hooks/useReducedMotion';

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
  /** Slides side by side, or stacked. */
  orientation?: CarouselOrientation;
  /** Previous and next buttons. */
  showArrows?: boolean;
  /** A dot per slide, to go to it. */
  showDots?: boolean;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Accessible name for the carousel region (required for landmark navigation). */
  'aria-label'?: string;
  /** The slides (`PixelCarousel.Item`). */
  children: React.ReactNode;
}

interface PixelCarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The slide's content. */
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
    const ariaLabel = ctx ? carouselSlideLabel(ctx.index, ctx.total) : undefined;
    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"
        aria-label={ariaLabel}
        className={cn(carouselItemClasses, className)}
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
  const classes = carouselClasses(surface, orientation);
  const carouselId = useId();
  const reducedMotion = useReducedMotion();

  // Respects prefers-reduced-motion by zeroing out embla's scroll duration.
  const emblaOptions = useMemo<EmblaOptionsType>(
    () => carouselOptions(opts, { orientation, reducedMotion }),
    [opts, orientation, reducedMotion],
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
    const step = carouselKeyStep(e.key, orientation);
    if (!step) return;
    e.preventDefault();
    if (step < 0) scrollPrev();
    else scrollNext();
  };

  // Derive slide count from children for dots fallback when api hasn't reported yet.
  const childArray = React.Children.toArray(children).filter(React.isValidElement);
  const dotCount = carouselDotCount(scrollSnaps.length, childArray.length);
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
      className={cn(classes.root, className)}
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
        {carouselStatus(selectedIndex, total)}
      </span>
      {/* Embla throws where the browser lacks what it needs (jsdom, old
          WebViews), unmounting the page: there the strip stays put. */}
      <div
        ref={canRunCarousel() ? emblaRef : undefined}
        className={classes.viewport}
        id={`${carouselId}-viewport`}
      >
        <div className={classes.track}>
          {wrappedChildren}
        </div>
      </div>

      {showArrows && (
        <>
          <button
            type="button"
            aria-label={CAROUSEL_PREVIOUS_LABEL}
            aria-controls={`${carouselId}-viewport`}
            disabled={carouselArrowDisabled(canPrev, opts?.loop)}
            onClick={scrollPrev}
            className={classes.previous}
          >
            <span aria-hidden="true">{'<'}</span>
          </button>
          <button
            type="button"
            aria-label={CAROUSEL_NEXT_LABEL}
            aria-controls={`${carouselId}-viewport`}
            disabled={carouselArrowDisabled(canNext, opts?.loop)}
            onClick={scrollNext}
            className={classes.next}
          >
            <span aria-hidden="true">{'>'}</span>
          </button>
        </>
      )}

      {showDots && dotCount > 0 && (
        <div
          className={classes.dots}
          role="group"
          aria-label={CAROUSEL_DOTS_LABEL}
        >
          {Array.from({ length: dotCount }).map((_, i) => {
            const active = i === selectedIndex;
            return (
              <button
                key={i}
                type="button"
                aria-label={carouselDotLabel(i)}
                aria-current={active ? 'true' : undefined}
                aria-controls={`${carouselId}-viewport`}
                onClick={() => scrollTo(i)}
                className={carouselDotClasses(surface, active)}
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
