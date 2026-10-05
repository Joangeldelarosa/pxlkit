import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  cn,
  cornerShadowClasses,
  focusRing,
  sizeClass,
  surfaceClasses,
  toneMap,
  type Size,
  type Surface,
  type Tone,
  type Variant,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Versatile button with tones, sizes, icon slots, loading state, variants
 * (`solid` | `soft` | `outline` | `ghost`) and surface aesthetic.
 *
 * Apply it to a `<button>`, or to an `<a>` (the counterpart of the React
 * kit's `asChild` link): an anchor gets the button classes and keeps its own
 * content as is.
 *
 * @example
 * <button pxlButton tone="cyan" [loading]="saving()" (click)="save()">Save</button>
 * <a pxlButton href="/docs">Docs</a>
 */
@Component({
  selector: 'button[pxlButton], a[pxlButton]',
  imports: [NgTemplateOutlet, PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[style.min-width.px]': 'minWidth()',
    '[attr.disabled]': 'isButton && (loading() || disabled()) ? "" : null',
  },
  template: `
    <ng-template #content><ng-content /></ng-template>
    @if (isButton) {
      @if (loading()) {
        <span
          data-testid="pxl-button-spinner"
          aria-hidden="true"
          class="inline-block h-3.5 w-3.5 motion-safe:animate-spin rounded-full border-2 border-current border-r-transparent"
        ></span>
      } @else {
        <ng-container *pxlOutlet="iconLeft(); let text">{{ text }}</ng-container>
      }
      <span><ng-container [ngTemplateOutlet]="content" /></span>
      <ng-container *pxlOutlet="iconRight(); let text">{{ text }}</ng-container>
    } @else {
      <ng-container [ngTemplateOutlet]="content" />
    }
  `,
})
export class PixelButton {
  /** Color tone (maps to `toneMap`). */
  readonly tone = input<Tone, Tone | undefined>('green', { transform: withDefault<Tone>('green') });
  /** Visual size. */
  readonly size = input<Size, Size | undefined>('md', { transform: withDefault<Size>('md') });
  /** `solid` | `soft` | `outline` | `ghost`. */
  readonly variant = input<Variant, Variant | undefined>('solid', { transform: withDefault<Variant>('solid') });
  /** Surface aesthetic override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Leading icon; replaced by a spinner while `loading`. */
  readonly iconLeft = input<PxlContent>();
  /** Trailing icon. */
  readonly iconRight = input<PxlContent>();
  /** Swaps the left icon for a spinner and disables the button. */
  readonly loading = input(false, { transform: booleanOr(false) });
  /** Stretch to fill the parent's inline axis (`w-full`). */
  readonly fullWidth = input(false, { transform: booleanOr(false) });
  /** Native `disabled` (buttons only). */
  readonly disabled = input(false, { transform: booleanOr(false) });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  /** @internal */
  protected readonly isButton = this.host.nativeElement.tagName.toLowerCase() === 'button';
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal Pinned while loading, so the spinner never collapses the button. */
  protected readonly minWidth = signal<number | null>(null);

  /** @internal */
  protected readonly classes = computed(() => {
    const s = surfaceClasses(this.effectiveSurface());
    // No drop shadow on pixel, whose cut corners clip it: the nudge and press alone.
    const c = cornerShadowClasses(this.effectiveSurface());
    const t = toneMap[this.tone()];
    const variant = this.variant();
    const isGhost = variant === 'ghost';
    const isOutline = variant === 'outline';
    const isSoft = variant === 'soft';
    // Hover and press feedback only while the button can be pressed: a disabled
    // or loading one holds still, and a disabled one drops its shadow too.
    const enabled = !this.disabled();
    const moves = enabled && !this.loading();

    const variantClasses = isGhost
      ? cn('border border-transparent bg-transparent', t.hover)
      : isOutline
        ? cn(s.border, t.border, 'bg-transparent', t.hover, enabled && c.shadow, moves && c.shadowHover)
        : isSoft
          ? cn(s.border, t.border, t.soft, t.hover, enabled && c.shadow, moves && c.shadowHover)
          : cn(s.border, t.border, t.bg, t.hover, enabled && c.shadow, moves && c.shadowHover);

    return cn(
      'inline-flex items-center justify-center font-medium focus-visible:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed',
      s.font,
      s.radius,
      s.transition,
      sizeClass[this.size()],
      focusRing,
      t.ring,
      t.text,
      this.fullWidth() && 'w-full',
      variantClasses,
      moves && (isGhost || isOutline ? 'active:scale-[0.97]' : c.shadowActive),
    );
  });

  constructor() {
    // Measure the width as loading starts, after that render.
    let wasLoading: boolean | undefined;
    afterRenderEffect(() => {
      const loading = this.loading();
      if (this.isButton && wasLoading === false && loading) {
        this.minWidth.set(this.host.nativeElement.getBoundingClientRect().width);
      }
      if (!loading) this.minWidth.set(null);
      wasLoading = loading;
    });
  }
}
