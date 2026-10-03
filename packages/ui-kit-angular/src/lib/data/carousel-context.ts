import { InjectionToken, type Signal } from '@angular/core';

/** What a `<pxl-carousel>` shares with its slides. */
export interface PixelCarouselContext {
  /** The slides, in order. */
  readonly items: Signal<readonly unknown[]>;
}

export const PIXEL_CAROUSEL = new InjectionToken<PixelCarouselContext>('PIXEL_CAROUSEL');
