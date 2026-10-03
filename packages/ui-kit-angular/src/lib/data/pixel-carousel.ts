import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
  type OnDestroy,
} from '@angular/core';
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
import { booleanOr, withDefault } from '../_internal/coercion';
import { injectId } from '../_internal/ids';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { injectReducedMotion } from '../utilities/media-query';
import { injectEmblaCarousel } from './_internal/embla';
import { PIXEL_CAROUSEL, type PixelCarouselContext } from './carousel-context';
import { PixelCarouselItem } from './pixel-carousel-item';

/** Embla options a carousel takes: all but the axis, which follows its orientation. */
export type PixelCarouselOptions = Omit<EmblaOptionsType, 'axis'>;
/** An Embla plugin (autoplay, auto scroll, …). */
export interface PixelCarouselPlugin extends EmblaPluginType {}

/**
 * Slides scrolled by Embla, with previous / next buttons, optional dots and
 * the arrow keys of its orientation (WAI-ARIA carousel pattern): a focusable
 * region (`aria-roledescription="carousel"`, name it with `aria-label`) that
 * announces the current slide politely. Each `<pxl-carousel-item>` is a
 * slide named "Slide N of M". Scrolls jump for a reader who prefers reduced
 * motion. The host is the region.
 *
 * @example
 * <pxl-carousel aria-label="Featured items" showDots (api)="carousel = $event">
 *   <pxl-carousel-item>…</pxl-carousel-item>
 *   <pxl-carousel-item>…</pxl-carousel-item>
 * </pxl-carousel>
 */
@Component({
  selector: 'pxl-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-carousel { display: block; } }',
  providers: [{ provide: PIXEL_CAROUSEL, useFactory: () => inject(PixelCarousel).context }],
  host: {
    role: 'region',
    'aria-roledescription': 'carousel',
    tabindex: '0',
    '[class]': 'classes().root',
    '(keydown)': 'onKeydown($event)',
  },
  template: `
    <span class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ status() }}</span>
    <div #viewport [class]="classes().viewport" [attr.id]="viewportId">
      <div [class]="classes().track"><ng-content /></div>
    </div>
    @if (showArrows()) {
      <button
        type="button"
        [attr.aria-label]="previousLabel"
        [attr.aria-controls]="viewportId"
        [disabled]="previousDisabled()"
        [class]="classes().previous"
        (click)="embla()?.scrollPrev()"
      ><span aria-hidden="true">&lt;</span></button>
      <button
        type="button"
        [attr.aria-label]="nextLabel"
        [attr.aria-controls]="viewportId"
        [disabled]="nextDisabled()"
        [class]="classes().next"
        (click)="embla()?.scrollNext()"
      ><span aria-hidden="true">&gt;</span></button>
    }
    @if (showDots() && dots().length > 0) {
      <div [class]="classes().dots" role="group" [attr.aria-label]="dotsLabel">
        @for (dot of dots(); track $index) {
          <button
            type="button"
            [attr.aria-label]="dot.label"
            [attr.aria-current]="dot.active ? 'true' : null"
            [attr.aria-controls]="viewportId"
            [class]="dot.classes"
            (click)="embla()?.scrollTo($index)"
          ></button>
        }
      </div>
    }
  `,
})
export class PixelCarousel implements OnDestroy {
  /**
   * Embla options (see the embla-carousel docs): `loop`, `align`,
   * `slidesToScroll`, `startIndex`, `dragFree`, `containScroll`, … The axis
   * follows `orientation`.
   */
  readonly opts = input<PixelCarouselOptions>();
  /** Embla plugins (autoplay, auto scroll, …). */
  readonly plugins = input<PixelCarouselPlugin[]>();
  /** Slides side by side, or stacked. */
  readonly orientation = input<CarouselOrientation, CarouselOrientation | undefined>('horizontal', {
    transform: withDefault<CarouselOrientation>('horizontal'),
  });
  /** Previous and next buttons. */
  readonly showArrows = input(true, { transform: booleanOr(true) });
  /** A dot per slide, to go to it. */
  readonly showDots = input(false, { transform: booleanOr(false) });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Embla's API once it runs, then `undefined` when the carousel is destroyed. */
  readonly api = output<EmblaCarouselType | undefined>();

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly reducedMotion = injectReducedMotion();
  private readonly items = contentChildren(PixelCarouselItem);
  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');
  /** @internal */
  protected readonly embla = injectEmblaCarousel(
    () => this.viewport().nativeElement,
    () => carouselOptions(this.opts(), { orientation: this.orientation(), reducedMotion: this.reducedMotion() }),
    () => this.plugins() ?? [],
  );
  private readonly selectedIndex = signal(0);
  private readonly scrollSnaps = signal<number[]>([]);
  private readonly canPrev = signal(false);
  private readonly canNext = signal(false);

  /** @internal Shared with the slides. */
  readonly context: PixelCarouselContext = { items: this.items };

  /** @internal */
  protected readonly viewportId = `${injectId()}-viewport`;
  /** @internal */
  protected readonly previousLabel = CAROUSEL_PREVIOUS_LABEL;
  /** @internal */
  protected readonly nextLabel = CAROUSEL_NEXT_LABEL;
  /** @internal */
  protected readonly dotsLabel = CAROUSEL_DOTS_LABEL;
  /** @internal */
  protected readonly classes = computed(() => carouselClasses(this.effectiveSurface(), this.orientation()));
  /** @internal The live region announces the slide index, not the slide's content (APG). */
  protected readonly status = computed(() => carouselStatus(this.selectedIndex(), this.items().length));
  /** @internal */
  protected readonly previousDisabled = computed(() => carouselArrowDisabled(this.canPrev(), this.opts()?.loop));
  /** @internal */
  protected readonly nextDisabled = computed(() => carouselArrowDisabled(this.canNext(), this.opts()?.loop));
  /** @internal */
  protected readonly dots = computed(() =>
    Array.from({ length: carouselDotCount(this.scrollSnaps().length, this.items().length) }, (_, index) => {
      const active = index === this.selectedIndex();
      return { label: carouselDotLabel(index), active, classes: carouselDotClasses(this.effectiveSurface(), active) };
    }),
  );

  constructor() {
    effect((onCleanup) => {
      const embla = this.embla();
      if (!embla) return;
      const onSelect = () => {
        this.selectedIndex.set(embla.selectedScrollSnap());
        this.canPrev.set(embla.canScrollPrev());
        this.canNext.set(embla.canScrollNext());
      };
      untracked(() => {
        this.scrollSnaps.set(embla.scrollSnapList());
        onSelect();
        this.api.emit(embla);
      });
      embla.on('select', onSelect);
      embla.on('reInit', onSelect);
      onCleanup(() => {
        embla.off('select', onSelect);
        embla.off('reInit', onSelect);
      });
    });
  }

  /** @internal */
  ngOnDestroy(): void {
    if (this.embla()) this.api.emit(undefined);
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    const step = carouselKeyStep(event.key, this.orientation());
    if (!step) return;
    event.preventDefault();
    if (step < 0) this.embla()?.scrollPrev();
    else this.embla()?.scrollNext();
  }
}
