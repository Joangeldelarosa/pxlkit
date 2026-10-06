import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  cn,
  heroMediaBodyClasses,
  heroMediaCaptionClasses,
  heroMediaClasses,
  heroMediaRatios,
  type HeroMediaAnchor,
  type HeroMediaRatio,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * A `<figure>` that holds hero media at a fixed aspect ratio, reserving its
 * box before the media loads, with an optional tone frame and a
 * `<figcaption>`. Its content is the media; a `[style.aspect-ratio]`
 * binding of your own wins over `ratio`.
 *
 * @example
 * <figure pxlHeroMedia ratio="16/9" framed tone="cyan" caption="Dashboard">
 *   <img src="/shot.png" alt="The dashboard" class="h-full w-full object-cover" />
 * </figure>
 */
@Component({
  selector: 'figure[pxlHeroMedia]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[style.aspect-ratio]': 'aspectRatio()',
  },
  template: `
    <div [class]="bodyClasses"><ng-content /></div>
    @if (caption()) {
      <figcaption [class]="captionClasses()">{{ caption() }}</figcaption>
    }
  `,
})
export class PixelHeroMedia {
  /** Aspect ratio of the figure. */
  readonly ratio = input<HeroMediaRatio, HeroMediaRatio | undefined>('16/10', {
    transform: withDefault<HeroMediaRatio>('16/10'),
  });
  /** Centred across its row, or on the row's end beside a headline. */
  readonly anchor = input<HeroMediaAnchor, HeroMediaAnchor | undefined>('center', {
    transform: withDefault<HeroMediaAnchor>('center'),
  });
  /** Draw the surface border and radius in the tone's border colour. */
  readonly framed = input(false, { transform: booleanOr(false) });
  /** Tone of the frame. */
  readonly tone = input<ToneKey, ToneKey | undefined>('neutral', { transform: withDefault<ToneKey>('neutral') });
  /** Caption under the media, in a `<figcaption>`. */
  readonly caption = input<string>();
  /** Extra classes for the caption (the React kit's `captionClassName`). */
  readonly captionClass = input<string>();
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal */
  protected readonly bodyClasses = heroMediaBodyClasses;
  /** @internal */
  protected readonly aspectRatio = computed(() => heroMediaRatios[this.ratio()]);
  /** @internal */
  protected readonly classes = computed(() =>
    heroMediaClasses(this.effectiveSurface(), { anchor: this.anchor(), framed: this.framed(), tone: this.tone() }),
  );
  /** @internal */
  protected readonly captionClasses = computed(() =>
    cn(heroMediaCaptionClasses(this.effectiveSurface()), this.captionClass()),
  );
}
