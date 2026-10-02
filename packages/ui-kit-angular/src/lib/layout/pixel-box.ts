import { Directive, ElementRef, afterNextRender, computed, inject, input, isDevMode } from '@angular/core';
import {
  boxClasses,
  boxLandmarkWarning,
  type BoxPadding,
  type BoxRadius,
  type Surface,
  type Tone,
  type Variant,
} from '@pxlkit/ui-kit-core';
import { booleanOr, optionalBoolean, withDefault } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Surface-aware container: padding, radius, a tone fill (`solid`, `soft`),
 * an optional border and shadow. Put it on whichever element you need (the
 * counterpart of the React kit's `as` prop); on a landmark (`section`,
 * `nav`, `aside`, `main`) give it an `aria-label`, `aria-labelledby` or
 * `title` — without one it warns in development.
 *
 * @example
 * <div pxlBox tone="cyan" variant="outline">…</div>
 * <section pxlBox aria-label="Stats" variant="soft" shadow>…</section>
 */
@Directive({
  selector: '[pxlBox]',
  host: { '[class]': 'classes()' },
})
export class PixelBox {
  /** Tone of the fill and border. */
  readonly tone = input<Tone, Tone | undefined>('neutral', { transform: withDefault<Tone>('neutral') });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** `solid` and `soft` fill; `outline` and `ghost` stay transparent. */
  readonly variant = input<Variant, Variant | undefined>('solid', { transform: withDefault<Variant>('solid') });
  /** Padding scale. */
  readonly padding = input<BoxPadding, BoxPadding | undefined>('md', { transform: withDefault<BoxPadding>('md') });
  /** Fixed radius; the surface's large radius when unset. */
  readonly radius = input<BoxRadius>();
  /** Draw the tone border; on for `outline`, off otherwise, when unset. */
  readonly border = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  /** Surface drop shadow. */
  readonly shadow = input(false, { transform: booleanOr(false) });

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal */
  protected readonly classes = computed(() =>
    boxClasses(this.effectiveSurface(), {
      tone: this.tone(),
      variant: this.variant(),
      padding: this.padding(),
      radius: this.radius(),
      border: this.border(),
      shadow: this.shadow(),
    }),
  );

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterNextRender(() => {
      if (!isDevMode()) return;
      const warning = boxLandmarkWarning(host.tagName.toLowerCase(), {
        label: host.getAttribute('aria-label'),
        labelledBy: host.getAttribute('aria-labelledby'),
        title: host.getAttribute('title'),
      });
      if (warning) console.warn(warning);
    });
  }
}
