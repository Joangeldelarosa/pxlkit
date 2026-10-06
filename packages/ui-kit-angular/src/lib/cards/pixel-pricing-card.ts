import {
  ChangeDetectionStrategy,
  Component,
  HostAttributeToken,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from '@angular/core';
import {
  PRICING_PREVIOUS_PRICE_LABEL,
  pricingCardClasses,
  pricingFeature,
  pricingPopularLabel,
  type PricingCardDescriptionLines,
  type PricingCardFeature,
  type PricingCardPopular,
  type PricingCardPrice,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { PixelGlyph } from '../_internal/pixel-glyph';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Pricing tier card: an optional popular ribbon over the top edge, the plan
 * name and description, the price with an optional old price struck through
 * and a badge beside it, the feature list — included features checked,
 * excluded ones crossed out, both announced as such — and a call to action
 * and footer (text or an `<ng-template>`). The ribbon row and the description
 * keep their height when empty, so tiers side by side line up. The host is
 * the article.
 *
 * @example
 * <pxl-pricing-card name="Pro" tone="gold" highlight [price]="{ amount: '$49', period: '/mo' }" [popular]="{}" [cta]="upgrade" />
 * <ng-template #upgrade><button pxlButton tone="gold" fullWidth>Upgrade</button></ng-template>
 */
@Component({
  selector: 'pxl-pricing-card',
  imports: [PxlOutlet, PixelGlyph],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <article>: a block box. In the base layer, so
  // the flex column of its classes still wins.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-pricing-card { display: block; } }',
  host: {
    '[attr.role]': 'role',
    '[class]': 'classes().root',
  },
  template: `
    <div data-pxl-ribbon-slot="true" [class]="classes().ribbonRow">
      @if (popular(); as popular) {
        <span [class]="classes().popular">{{ popularLabel(popular) }}</span>
      }
    </div>
    <div [class]="classes().head">
      @if (icon()) {
        <span [class]="classes().icon" aria-hidden="true"><ng-container *pxlOutlet="icon(); let text">{{ text }}</ng-container></span>
      }
      <h3 [class]="classes().name">{{ name() }}</h3>
      <p data-pxl-description-slot="true" [class]="classes().description">{{ description() ?? '' }}</p>
    </div>
    <div [class]="classes().priceRow">
      @if (price().strikethrough !== undefined) {
        <s [class]="classes().previousPrice"><span class="sr-only">{{ previousPriceLabel }}</span>{{ price().strikethrough }}</s>
      }
      <span [class]="classes().amount">{{ price().amount }}</span>
      @if (price().period; as period) {
        <span [class]="classes().period">{{ period }}</span>
      }
      @if (priceBadge()) {
        <span data-pxl-price-badge-slot="true" [class]="classes().priceBadge">
          <ng-container *pxlOutlet="priceBadge(); let text">{{ text }}</ng-container>
        </span>
      }
    </div>
    @if (featureRows().length > 0) {
      <ul [class]="classes().features">
        @for (row of featureRows(); track $index) {
          <li [class]="classes().feature">
            <span [class]="row.view.markClasses" aria-hidden="true"><svg [pxlGlyph]="row.view.glyph"></svg></span>
            <span [attr.title]="row.feature.tooltip ?? null" [class]="row.view.labelClasses"><span class="sr-only">{{ row.view.srLabel }}</span>{{ row.feature.label }}</span>
          </li>
        }
      </ul>
    }
    <div [class]="classes().spacer" aria-hidden="true"></div>
    @if (cta()) {
      <div [class]="classes().cta"><ng-container *pxlOutlet="cta(); let text">{{ text }}</ng-container></div>
    }
    @if (footer()) {
      <div [class]="classes().footer"><ng-container *pxlOutlet="footer(); let text">{{ text }}</ng-container></div>
    }
  `,
})
export class PixelPricingCard {
  /** Plan name. */
  readonly name = input.required<string>();
  /** Price, billing period and old price. */
  readonly price = input.required<PricingCardPrice>();
  /** Muted line under the name. */
  readonly description = input<string>();
  /** Lines the description is clamped to, or `none` to let it flow. */
  readonly descriptionLines = input<PricingCardDescriptionLines, PricingCardDescriptionLines | '2' | '3' | undefined>(2, {
    transform: (value) => (value === undefined ? 2 : value === 'none' ? value : (Number(value) as 2 | 3)),
  });
  /** Ribbon over the top edge: its label (`POPULAR`) and tone (gold). */
  readonly popular = input<PricingCardPopular>();
  /** The feature list. */
  readonly features = input<PricingCardFeature[]>();
  /** Icon above the name, in the tone. */
  readonly icon = input<PxlContent>();
  /** Badge beside the price (a discount). */
  readonly priceBadge = input<PxlContent>();
  /** Call to action under the features. */
  readonly cta = input<PxlContent>();
  /** Fine print under the call to action. */
  readonly footer = input<PxlContent>();
  /** Tone of the price, the feature marks and, highlighted, the chrome. */
  readonly tone = input<ToneKey, ToneKey | undefined>('neutral', { transform: withDefault<ToneKey>('neutral') });
  /** Tints the border and background and adds a glow. */
  readonly highlight = input(false, { transform: booleanOr(false) });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Surface border, radius and background. */
  readonly bordered = input(true, { transform: booleanOr(true) });

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal An own `role` wins. */
  protected readonly role = inject(new HostAttributeToken('role'), { optional: true }) ?? 'article';
  /** @internal */
  protected readonly previousPriceLabel = PRICING_PREVIOUS_PRICE_LABEL;
  /** @internal */
  protected readonly popularLabel = pricingPopularLabel;
  /** @internal */
  protected readonly classes = computed(() =>
    pricingCardClasses(this.effectiveSurface(), {
      tone: this.tone(),
      highlight: this.highlight(),
      bordered: this.bordered(),
      descriptionLines: this.descriptionLines(),
      popularTone: this.popular()?.tone,
    }),
  );
  /** @internal */
  protected readonly featureRows = computed(() =>
    (this.features() ?? []).map((feature) => ({ feature, view: pricingFeature(feature, this.tone()) })),
  );
}
