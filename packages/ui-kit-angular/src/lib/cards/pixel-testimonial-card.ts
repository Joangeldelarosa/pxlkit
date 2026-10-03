import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import {
  TESTIMONIAL_VERIFIED_LABEL,
  TESTIMONIAL_VERIFIED_TEXT,
  testimonialAttribution,
  testimonialCardClasses,
  testimonialHasStars,
  testimonialInitials,
  type Surface,
  type TestimonialAvatar,
  type TestimonialQuoteSize,
  type TestimonialVariant,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { booleanOr, optionalNumber, withDefault } from '../_internal/coercion';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { PixelGlyph } from '../_internal/pixel-glyph';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { PixelStarRating } from './pixel-star-rating';

/**
 * Testimonial card: a star rating and a verified badge (an image named
 * "Verified"), the quote in a `<blockquote>`, actions (text or an
 * `<ng-template>`), and the attribution — name, role and company — beside a
 * photo or the initials. The quote keeps a minimum height, so cards in a row
 * line up. The host is the article.
 *
 * @example
 * <pxl-testimonial-card quote="Shipped in a week." name="Ana Pereira" role="PM" [stars]="5" verified [actions]="story" />
 * <ng-template #story><a pxlTextLink href="/stories/ana">Read the story</a></ng-template>
 */
@Component({
  selector: 'pxl-testimonial-card',
  imports: [PxlOutlet, PixelGlyph, PixelStarRating],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <article>: a block box. In the base layer, so
  // the grid of its classes still wins.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-testimonial-card { display: block; } }',
  host: {
    // `role` is the person's; the host is the article.
    '[attr.role]': '"article"',
    '[class]': 'classes().root',
  },
  template: `
    <div [class]="classes().header">
      <div [class]="classes().stars">
        @if (hasStars()) {
          <pxl-star-rating [value]="stars()" size="sm" tone="gold" [surface]="effectiveSurface()" />
        }
      </div>
      @if (verified()) {
        <span data-pxl-verified="true" role="img" [class]="classes().verified" [attr.aria-label]="verifiedLabel">
          <svg pxlGlyph="check" [class]="classes().verifiedIcon"></svg>
          <span>{{ verifiedText }}</span>
        </span>
      }
    </div>
    <div data-pxl-quote-slot="true" [class]="classes().quoteRow">
      <blockquote [class]="classes().quote">&ldquo;{{ quote() }}&rdquo;</blockquote>
    </div>
    <div [class]="classes().actionsRow">
      @if (actions()) {
        <div [class]="classes().actions"><ng-container *pxlOutlet="actions(); let text">{{ text }}</ng-container></div>
      }
    </div>
    <div [class]="classes().attribution">
      <span data-pxl-avatar="true" [class]="classes().avatar" [attr.aria-hidden]="avatar()?.src ? null : 'true'">
        @if (avatar(); as avatar) {
          @if (avatar.src) {
            <img [src]="avatar.src" [alt]="avatar.name" [class]="classes().avatarImage" />
          } @else {
            <span>{{ initials() }}</span>
          }
        } @else {
          <span>{{ initials() }}</span>
        }
      </span>
      <div [class]="classes().person">
        <span [class]="classes().name">{{ name() }}</span>
        @if (attribution(); as attribution) {
          <span [class]="classes().role">{{ attribution }}</span>
        }
      </div>
      <span [class]="classes().toneHint" aria-hidden="true"></span>
    </div>
  `,
})
export class PixelTestimonialCard {
  /** The quote, set between curly quotation marks. */
  readonly quote = input.required<string>();
  /** Who said it. */
  readonly name = input.required<string>();
  /** Their role, before the company. */
  readonly role = input<string>();
  /** Their company. */
  readonly company = input<string>();
  /** Photo, or the name and tone of the initials; the initials of `name` without one. */
  readonly avatar = input<TestimonialAvatar>();
  /** Star rating out of 5; none for 0 or unset. */
  readonly stars = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Shows the VERIFIED badge. */
  readonly verified = input(false, { transform: booleanOr(false) });
  /** Tone of the initials. */
  readonly tone = input<ToneKey, ToneKey | undefined>('neutral', { transform: withDefault<ToneKey>('neutral') });
  /** `card` draws the surface chrome; `quote` and `slider` leave it out. */
  readonly variant = input<TestimonialVariant, TestimonialVariant | undefined>('card', {
    transform: withDefault<TestimonialVariant>('card'),
  });
  /** Minimum height of the quote. */
  readonly quoteSize = input<TestimonialQuoteSize, TestimonialQuoteSize | undefined>('normal', {
    transform: withDefault<TestimonialQuoteSize>('normal'),
  });
  /** Actions under the quote (a link to the full story). */
  readonly actions = input<PxlContent>();
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  /** @internal */
  protected readonly verifiedLabel = TESTIMONIAL_VERIFIED_LABEL;
  /** @internal */
  protected readonly verifiedText = TESTIMONIAL_VERIFIED_TEXT;
  /** @internal */
  protected readonly hasStars = computed(() => testimonialHasStars(this.stars()));
  /** @internal */
  protected readonly initials = computed(() => testimonialInitials(this.avatar()?.name ?? this.name()));
  /** @internal */
  protected readonly attribution = computed(() => testimonialAttribution(this.role(), this.company()));
  /** @internal */
  protected readonly classes = computed(() =>
    testimonialCardClasses(this.effectiveSurface(), {
      variant: this.variant(),
      tone: this.tone(),
      avatarTone: this.avatar()?.tone,
      quoteSize: this.quoteSize(),
    }),
  );
}
