import { Directive, computed, input } from '@angular/core';
import { codeInlineClasses, type Surface, type Tone } from '@pxlkit/ui-kit-core';
import { withDefault } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Inline code tinted in a tone and framed per surface, for commands,
 * identifiers and short snippets in prose. Put it on a `<code>` element.
 *
 * @example
 * Run <code pxlCodeInline>pnpm dev</code> to start the server.
 */
@Directive({
  selector: 'code[pxlCodeInline]',
  host: { '[class]': 'classes()' },
})
export class PixelCodeInline {
  /** Tone tint. */
  readonly tone = input<Tone, Tone | undefined>('cyan', { transform: withDefault<Tone>('cyan') });
  /** Visual surface override. */
  readonly surface = input<Surface>();

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal */
  protected readonly classes = computed(() => codeInlineClasses(this.effectiveSurface(), this.tone()));
}
