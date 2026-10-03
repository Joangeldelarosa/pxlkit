import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostAttributeToken,
  ViewEncapsulation,
  computed,
  inject,
  input,
  model,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { PxlKitIcon } from '@pxlkit/angular';
import { Star } from '@pxlkit/gamification';
import {
  STAR_RATING_ICON_LABEL,
  STAR_RATING_MUTED_COLOR,
  starRatingButtonLabel,
  starRatingClasses,
  starRatingLabel,
  starRatingSizes,
  starRatingStarClasses,
  starRatingStars,
  starRatingToneColors,
  starRatingValue,
  type StarRatingSize,
  type StarRatingTone,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { booleanOr, numberOr, withDefault } from '../_internal/coercion';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { FormBridge, provideValueAccessor } from '../_internal/value-accessor';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/** What a custom star glyph (`starIcon`, `emptyStarIcon`) is drawn with. */
export interface PixelStarIconContext {
  filled: boolean;
  /** Width and height, in px. */
  size: number;
  tone: StarRatingTone;
}

/**
 * Star rating: `max` stars, the rating's filled in the tone — the
 * gamification Star icon (`<pxl-icon>`), at 16, 20 or 24 px. Read-only it is
 * one image (`role="img"`) named "N out of M"; `interactive` makes each star
 * a button (`aria-pressed` while filled) in a named group, and clicking one
 * rates. Bind the rating with `[(value)]`, use it as a form control
 * (`ngModel`, `formControlName`; a disabled control disables the star
 * buttons), or leave it uncontrolled from `defaultValue`. `starIcon` and
 * `emptyStarIcon` draw other glyphs (text, or an `<ng-template>` given a
 * `PixelStarIconContext`) for the filled and the empty stars. The host is the
 * rating.
 *
 * @example
 * <pxl-star-rating [(value)]="rating" interactive showCount />
 * <pxl-star-rating [value]="4" [starIcon]="heart" />
 * <ng-template #heart let-size="size"><pxl-icon [icon]="heartIcon" [size]="size" appearance="solid" color="#EF4444" /></ng-template>
 */
@Component({
  selector: 'pxl-star-rating',
  imports: [NgTemplateOutlet, PxlKitIcon, PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideValueAccessor(() => PixelStarRating)],
  // The host stands for React's <div>: a block box. In the base layer, so the
  // inline-flex of its classes still wins.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-star-rating { display: block; } }',
  host: {
    '[attr.role]': 'ownRole ?? (interactive() ? "group" : "img")',
    '[attr.aria-label]': 'ownLabel ?? label()',
    '[class]': 'classes().root',
  },
  template: `
    <span [class]="classes().stars">
      @for (star of stars(); track star.value) {
        @if (interactive()) {
          <button
            type="button"
            [attr.data-pxl-star]="star.filled ? 'filled' : 'outlined'"
            [attr.aria-label]="buttonLabel(star.value)"
            [attr.aria-pressed]="star.filled"
            [class]="star.classes"
            [disabled]="form.disabled()"
            (click)="rate(star.value)"
            (blur)="form.touched()"
          >
            <ng-container [ngTemplateOutlet]="glyph" [ngTemplateOutletContext]="{ $implicit: star.filled }" />
          </button>
        } @else {
          <span [attr.data-pxl-star]="star.filled ? 'filled' : 'outlined'" [class]="star.classes">
            <ng-container [ngTemplateOutlet]="glyph" [ngTemplateOutletContext]="{ $implicit: star.filled }" />
          </span>
        }
      }
    </span>
    @if (showCount()) {
      <span [class]="classes().count">{{ rating() }}/{{ max() }}</span>
    }
    <ng-template #glyph let-filled>
      @if (filled ? starIcon() : emptyStarIcon(); as custom) {
        <ng-container *pxlOutlet="custom; context: filled ? filledContext() : emptyContext(); let text">{{ text }}</ng-container>
      } @else if (filled) {
        <pxl-icon [icon]="icon" [size]="px()" appearance="solid" [color]="toneColor()" [ariaLabel]="iconLabel" />
      } @else {
        <span [class]="classes().muted">
          <pxl-icon [icon]="icon" [size]="px()" appearance="solid" [color]="mutedColor" [ariaLabel]="iconLabel" />
        </span>
      }
    </ng-template>
  `,
})
export class PixelStarRating implements ControlValueAccessor {
  /** The rating (`[(value)]`), from 0 to `max`; leave unset for an uncontrolled rating. */
  readonly value = model<number | undefined>(undefined);
  /** Initial rating while uncontrolled. */
  readonly defaultValue = input(0, { transform: numberOr(0) });
  /** Number of stars. */
  readonly max = input(5, { transform: numberOr(5) });
  /** Star size: 16, 20 or 24 px. */
  readonly size = input<StarRatingSize, StarRatingSize | undefined>('md', { transform: withDefault<StarRatingSize>('md') });
  /** Colour of the filled stars. */
  readonly tone = input<StarRatingTone, StarRatingTone | undefined>('gold', { transform: withDefault<StarRatingTone>('gold') });
  /** Shows "N/M" beside the stars. */
  readonly showCount = input(false, { transform: booleanOr(false) });
  /** Makes each star a button that rates. */
  readonly interactive = input(false, { transform: booleanOr(false) });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Glyph of the filled stars, in place of the Star icon. */
  readonly starIcon = input<PxlContent<PixelStarIconContext>>();
  /** Glyph of the empty stars, in place of the dimmed Star icon. */
  readonly emptyStarIcon = input<PxlContent<PixelStarIconContext>>();

  /** @internal */
  protected readonly form = new FormBridge<number>();
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal An own `role` wins. */
  protected readonly ownRole = inject(new HostAttributeToken('role'), { optional: true });
  /** @internal An own `aria-label` wins. */
  protected readonly ownLabel = inject(new HostAttributeToken('aria-label'), { optional: true });
  /** @internal */
  protected readonly icon = Star;
  /** @internal */
  protected readonly iconLabel = STAR_RATING_ICON_LABEL;
  /** @internal */
  protected readonly mutedColor = STAR_RATING_MUTED_COLOR;
  /** @internal */
  protected readonly rating = computed(() => starRatingValue(this.value() ?? this.defaultValue(), this.max()));
  /** @internal */
  protected readonly px = computed(() => starRatingSizes[this.size()]);
  /** @internal */
  protected readonly toneColor = computed(() => starRatingToneColors[this.tone()]);
  /** @internal */
  protected readonly filledContext = computed<PixelStarIconContext>(() => ({ filled: true, size: this.px(), tone: this.tone() }));
  /** @internal */
  protected readonly emptyContext = computed<PixelStarIconContext>(() => ({ filled: false, size: this.px(), tone: this.tone() }));
  /** @internal */
  protected readonly label = computed(() => starRatingLabel(this.rating(), this.max(), this.interactive()));
  /** @internal */
  protected readonly classes = computed(() => starRatingClasses(this.effectiveSurface()));
  /** @internal */
  protected readonly stars = computed(() =>
    starRatingStars(this.rating(), this.max()).map((star) => ({
      ...star,
      classes: starRatingStarClasses(this.effectiveSurface(), {
        interactive: this.interactive(),
        filled: star.filled,
        tone: this.tone(),
      }),
    })),
  );

  /** @internal */
  protected buttonLabel(value: number): string {
    return starRatingButtonLabel(value, this.max());
  }

  /** @internal */
  protected rate(value: number): void {
    if (this.form.disabled()) return;
    this.value.set(value);
    this.form.changed(value);
  }

  /** @internal ControlValueAccessor */
  writeValue(value: unknown): void {
    this.value.set(value == null ? undefined : Number(value));
  }

  /** @internal ControlValueAccessor */
  registerOnChange(fn: (value: number) => void): void {
    this.form.registerOnChange(fn);
  }

  /** @internal ControlValueAccessor */
  registerOnTouched(fn: () => void): void {
    this.form.registerOnTouched(fn);
  }

  /** @internal ControlValueAccessor */
  setDisabledState(disabled: boolean): void {
    this.form.disabled.set(disabled);
  }
}
