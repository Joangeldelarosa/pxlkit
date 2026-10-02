import { Directive, ElementRef, HostAttributeToken, computed, inject, input } from '@angular/core';
import { textLinkClasses, type Surface, type Tone } from '@pxlkit/ui-kit-core';
import { withDefault } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Tone-coloured underlined link for prose, callouts and CTAs. Put it on an
 * `<a>` to navigate, or on a `<button>` (the counterpart of the React kit's
 * link without `href`) for an action; a button defaults its `type` to
 * `"button"`.
 *
 * @example
 * <a pxlTextLink href="/docs">Read the docs</a>
 * <button pxlTextLink tone="gold" (click)="undo()">Undo</button>
 */
@Directive({
  selector: 'a[pxlTextLink], button[pxlTextLink]',
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'type',
  },
})
export class PixelTextLink {
  /** Tone tint. */
  readonly tone = input<Tone, Tone | undefined>('cyan', { transform: withDefault<Tone>('cyan') });
  /** Visual surface override. */
  readonly surface = input<Surface>();

  private readonly isButton = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName.toLowerCase() === 'button';
  /** @internal An own `type` wins; a button is a plain button otherwise. */
  protected readonly type =
    inject(new HostAttributeToken('type'), { optional: true }) ?? (this.isButton ? 'button' : null);
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal */
  protected readonly classes = computed(() => textLinkClasses(this.effectiveSurface(), this.tone()));
}
