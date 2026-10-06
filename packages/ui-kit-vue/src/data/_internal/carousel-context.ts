import { defineComponent, inject, provide, type InjectionKey } from 'vue';

/** Where a slide sits in its carousel. */
export interface CarouselPosition {
  index: number;
  total: number;
}

const CAROUSEL_POSITION: InjectionKey<Readonly<CarouselPosition>> = Symbol('pixel-carousel-position');

/** The position the carousel gave the calling slide (reactive), or `null` outside a carousel. */
export function useCarouselPosition(): Readonly<CarouselPosition> | null {
  return inject(CAROUSEL_POSITION, null);
}

/**
 * Wraps each child of a carousel (rendering nothing of its own) to give it
 * its position, so a slide still finds it when the consumer wraps
 * `PixelCarouselItem` in a component of their own.
 */
export const CarouselSlidePosition = /* @__PURE__ */ defineComponent({
  name: 'PxlCarouselSlidePosition',
  props: {
    index: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  setup(props, { slots }) {
    provide(CAROUSEL_POSITION, props);
    return () => slots.default?.();
  },
});
