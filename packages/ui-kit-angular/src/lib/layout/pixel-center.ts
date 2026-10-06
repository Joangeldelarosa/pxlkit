import { Directive, computed, input } from '@angular/core';
import {
  centerClasses,
  type CenterAlign,
  type ContainerWidth,
  type PageGutter,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Horizontally centred column: width cap, page gutter and text alignment.
 * Put it on whichever element you need (the counterpart of the React kit's
 * `as` prop).
 *
 * @example
 * <div pxlCenter maxWidth="3xl" align="center">…</div>
 * <section pxlCenter maxWidth="4xl" gutter="lg">…</section>
 */
@Directive({
  selector: '[pxlCenter]',
  host: {
    '[class]': 'classes()',
    // `align` is a legacy presentational attribute: left on a block element
    // it would still align the content.
    '[attr.align]': 'null',
  },
})
export class PixelCenter {
  /** Width cap (`containerWidth`). */
  readonly maxWidth = input<ContainerWidth, ContainerWidth | undefined>('5xl', {
    transform: withDefault<ContainerWidth>('5xl'),
  });
  /** Horizontal padding (`pageGutter`). */
  readonly gutter = input<PageGutter, PageGutter | undefined>('lg', { transform: withDefault<PageGutter>('lg') });
  /** Text alignment of the centred content. */
  readonly align = input<CenterAlign>();
  /** @deprecated Use `align`. */
  readonly text = input<CenterAlign>();
  /** `inline-block` instead of `block`. */
  readonly inline = input(false, { transform: booleanOr(false) });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Surface border and radius. */
  readonly bordered = input(false, { transform: booleanOr(false) });

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal */
  protected readonly classes = computed(() =>
    centerClasses(this.effectiveSurface(), {
      maxWidth: this.maxWidth(),
      gutter: this.gutter(),
      align: this.align() ?? this.text(),
      inline: this.inline(),
      bordered: this.bordered(),
    }),
  );
}
