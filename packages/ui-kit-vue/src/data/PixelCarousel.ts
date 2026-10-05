import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  ref,
  useId,
  watch,
  type ExtractPublicPropTypes,
  type PropType,
  type SlotsType,
  type VNode,
} from 'vue';
import type { EmblaCarouselType, EmblaOptionsType, EmblaPluginType } from 'embla-carousel';
import {
  CAROUSEL_DOTS_LABEL,
  CAROUSEL_NEXT_LABEL,
  CAROUSEL_PREVIOUS_LABEL,
  carouselArrowDisabled,
  carouselClasses,
  carouselDotClasses,
  carouselDotCount,
  carouselDotLabel,
  carouselKeyStep,
  carouselOptions,
  carouselStatus,
  type CarouselOrientation,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { useReducedMotion } from '../composables/media-query.js';
import { useEffectiveSurface } from '../composables/surface.js';
import { CarouselSlidePosition } from './_internal/carousel-context.js';
import { elementNodes } from './_internal/children.js';
import { useEmblaCarousel } from './_internal/embla.js';

/** Embla options a carousel takes: all but the axis, which follows its orientation. */
export type PixelCarouselOptions = Omit<EmblaOptionsType, 'axis'>;
/** An Embla plugin (autoplay, auto scroll, …). */
export interface PixelCarouselPlugin extends EmblaPluginType {}

const carouselProps = {
  /**
   * Embla options (see the embla-carousel docs): `loop`, `align`,
   * `slidesToScroll`, `startIndex`, `dragFree`, `containScroll`, … The axis
   * follows `orientation`.
   */
  opts: { type: Object as PropType<PixelCarouselOptions>, default: undefined },
  /** Embla plugins (autoplay, auto scroll, …). */
  plugins: { type: Array as PropType<PixelCarouselPlugin[]>, default: undefined },
  /** Slides side by side, or stacked. */
  orientation: { type: String as PropType<CarouselOrientation>, default: 'horizontal' },
  /** Previous and next buttons. */
  showArrows: { type: Boolean, default: true },
  /** A dot per slide, to go to it. */
  showDots: { type: Boolean, default: false },
  /** Surface override; defaults to the nearest provider. */
  surface: { type: String as PropType<Surface>, default: undefined },
} as const;

export type PixelCarouselProps = ExtractPublicPropTypes<typeof carouselProps>;

/**
 * Slides scrolled by Embla, with previous / next buttons, optional dots and
 * the arrow keys of its orientation (WAI-ARIA carousel pattern): a focusable
 * region (`aria-roledescription="carousel"`, name it with `aria-label`) that
 * announces the current slide politely. Each `PixelCarouselItem` of the
 * default slot is a slide named "Slide N of M". Scrolls jump for a reader
 * who prefers reduced motion. Attributes go to the region.
 *
 * @example
 * <PixelCarousel aria-label="Featured items" show-dots @api="carousel = $event">
 *   <PixelCarouselItem>…</PixelCarouselItem>
 *   <PixelCarouselItem>…</PixelCarouselItem>
 * </PixelCarousel>
 */
export default /* @__PURE__ */ defineComponent({
  name: 'PixelCarousel',
  props: carouselProps,
  emits: {
    /** Embla's API once it runs, then `undefined` when the carousel unmounts. */
    api: (api: EmblaCarouselType | undefined) => api === undefined || typeof api.scrollTo === 'function',
  },
  slots: Object as SlotsType<{
    /** The slides (`PixelCarouselItem`). */
    default?: () => VNode[];
  }>,
  setup(props, { emit, slots }) {
    const surface = useEffectiveSurface(() => props.surface);
    const reducedMotion = useReducedMotion();
    const viewportId = `${useId()}-viewport`;
    const viewport = ref<HTMLElement | null>(null);
    const options = computed<EmblaOptionsType>(() =>
      carouselOptions(props.opts, { orientation: props.orientation, reducedMotion: reducedMotion.value }),
    );
    const api = useEmblaCarousel(viewport, () => options.value, () => props.plugins ?? []);

    const selectedIndex = ref(0);
    const scrollSnaps = ref<number[]>([]);
    const canPrev = ref(false);
    const canNext = ref(false);

    watch(api, (embla, _previous, onCleanup) => {
      if (!embla) return;
      const onSelect = () => {
        selectedIndex.value = embla.selectedScrollSnap();
        canPrev.value = embla.canScrollPrev();
        canNext.value = embla.canScrollNext();
      };
      scrollSnaps.value = embla.scrollSnapList();
      onSelect();
      embla.on('select', onSelect);
      embla.on('reInit', onSelect);
      onCleanup(() => {
        embla.off('select', onSelect);
        embla.off('reInit', onSelect);
      });
      emit('api', embla);
    });
    onBeforeUnmount(() => {
      if (api.value) emit('api', undefined);
    });

    const onKeydown = (event: KeyboardEvent) => {
      const step = carouselKeyStep(event.key, props.orientation);
      if (!step) return;
      event.preventDefault();
      if (step < 0) api.value?.scrollPrev();
      else api.value?.scrollNext();
    };

    return () => {
      const classes = carouselClasses(surface.value, props.orientation);
      // Every element of the slot is a slide, as React counts its children.
      const slides = elementNodes(slots.default?.());
      const total = slides.length;
      const dotCount = carouselDotCount(scrollSnaps.value.length, total);
      const loop = props.opts?.loop;
      return h(
        'div',
        { role: 'region', 'aria-roledescription': 'carousel', tabindex: 0, class: classes.root, onKeydown },
        [
          // Dedicated live region: announces the slide index, not the slide's content (APG).
          h(
            'span',
            { class: 'sr-only', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' },
            carouselStatus(selectedIndex.value, total),
          ),
          h('div', { ref: viewport, class: classes.viewport, id: viewportId }, [
            h(
              'div',
              { class: classes.track },
              slides.map((slide, index) => h(CarouselSlidePosition, { key: slide.key ?? index, index, total }, () => slide)),
            ),
          ]),
          props.showArrows && [
            h(
              'button',
              {
                type: 'button',
                'aria-label': CAROUSEL_PREVIOUS_LABEL,
                'aria-controls': viewportId,
                disabled: carouselArrowDisabled(canPrev.value, loop),
                class: classes.previous,
                onClick: () => api.value?.scrollPrev(),
              },
              [h('span', { 'aria-hidden': 'true' }, '<')],
            ),
            h(
              'button',
              {
                type: 'button',
                'aria-label': CAROUSEL_NEXT_LABEL,
                'aria-controls': viewportId,
                disabled: carouselArrowDisabled(canNext.value, loop),
                class: classes.next,
                onClick: () => api.value?.scrollNext(),
              },
              [h('span', { 'aria-hidden': 'true' }, '>')],
            ),
          ],
          props.showDots &&
            dotCount > 0 &&
            h(
              'div',
              { class: classes.dots, role: 'group', 'aria-label': CAROUSEL_DOTS_LABEL },
              Array.from({ length: dotCount }, (_, index) => {
                const active = index === selectedIndex.value;
                return h('button', {
                  key: index,
                  type: 'button',
                  'aria-label': carouselDotLabel(index),
                  'aria-current': active ? 'true' : undefined,
                  'aria-controls': viewportId,
                  class: carouselDotClasses(surface.value, active),
                  onClick: () => api.value?.scrollTo(index),
                });
              }),
            ),
        ],
      );
    };
  },
});
