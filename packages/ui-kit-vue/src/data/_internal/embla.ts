import EmblaCarousel, { type EmblaCarouselType, type EmblaOptionsType, type EmblaPluginType } from 'embla-carousel';
import { canRunCarousel, carouselOptionsEqual, carouselPluginsEqual } from '@pxlkit/ui-kit-core';
import { onBeforeUnmount, onMounted, shallowRef, watch, type Ref, type ShallowRef } from 'vue';

/**
 * Embla on `viewport`, from mount to unmount, where the browser can run it
 * (see `canRunCarousel`) — the counterpart of `embla-carousel-react`'s hook.
 * Options and plugins re-initialise it only when their content changes, not
 * whenever a parent rebuilds them.
 */
export function useEmblaCarousel(
  viewport: Readonly<Ref<HTMLElement | null>>,
  options: () => EmblaOptionsType,
  plugins: () => EmblaPluginType[],
): Readonly<ShallowRef<EmblaCarouselType | undefined>> {
  const api = shallowRef<EmblaCarouselType>();
  let storedOptions = options();
  let storedPlugins = plugins();

  onMounted(() => {
    if (viewport.value && canRunCarousel()) api.value = EmblaCarousel(viewport.value, storedOptions, storedPlugins);
  });
  watch(options, (next) => {
    if (carouselOptionsEqual(storedOptions, next)) return;
    storedOptions = next;
    api.value?.reInit(storedOptions, storedPlugins);
  });
  watch(plugins, (next) => {
    if (carouselPluginsEqual(storedPlugins, next)) return;
    storedPlugins = next;
    api.value?.reInit(storedOptions, storedPlugins);
  });
  onBeforeUnmount(() => api.value?.destroy());
  return api;
}
