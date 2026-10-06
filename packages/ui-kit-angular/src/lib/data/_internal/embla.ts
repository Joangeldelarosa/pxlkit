import { DestroyRef, afterNextRender, effect, inject, signal, untracked, type Signal } from '@angular/core';
import EmblaCarousel, { type EmblaCarouselType, type EmblaOptionsType, type EmblaPluginType } from 'embla-carousel';
import { canRunCarousel, carouselOptionsEqual, carouselPluginsEqual } from '@pxlkit/ui-kit-core';

/**
 * Embla on `viewport()`, from the first render in the browser until the
 * calling component is destroyed, where the browser can run it (see
 * `canRunCarousel`) — the counterpart of `embla-carousel-react`'s hook.
 * Options and plugins re-initialise it only when their content changes, not
 * whenever a binding rebuilds them. Call in an injection context.
 */
export function injectEmblaCarousel(
  viewport: () => HTMLElement,
  options: () => EmblaOptionsType,
  plugins: () => EmblaPluginType[],
): Signal<EmblaCarouselType | undefined> {
  const api = signal<EmblaCarouselType | undefined>(undefined);
  let storedOptions: EmblaOptionsType | undefined;
  let storedPlugins: EmblaPluginType[] | undefined;

  afterNextRender(() => {
    storedOptions = untracked(options);
    storedPlugins = untracked(plugins);
    if (canRunCarousel()) api.set(EmblaCarousel(viewport(), storedOptions, storedPlugins));
  });
  effect(() => {
    const next = options();
    untracked(() => {
      if (!storedOptions || carouselOptionsEqual(storedOptions, next)) return;
      storedOptions = next;
      api()?.reInit(storedOptions, storedPlugins);
    });
  });
  effect(() => {
    const next = plugins();
    untracked(() => {
      if (!storedPlugins || carouselPluginsEqual(storedPlugins, next)) return;
      storedPlugins = next;
      api()?.reInit(storedOptions, storedPlugins);
    });
  });
  inject(DestroyRef).onDestroy(() => api()?.destroy());
  return api.asReadonly();
}
