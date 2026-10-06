import { Directive, computed, input } from '@angular/core';
import {
  clusterClasses,
  type StackAlign,
  type StackGapKey,
  type StackJustify,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { withDefault } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Wrapping row of items (tags, chips, actions) with a gap token and
 * alignment. Put it on whichever element you need (the counterpart of the
 * React kit's `as` prop).
 *
 * @example
 * <div pxlCluster [gap]="2">…</div>
 * <ul pxlCluster justify="between">…</ul>
 */
@Directive({
  selector: '[pxlCluster]',
  host: {
    '[class]': 'classes()',
    // `align` is a legacy presentational attribute: left on a block element
    // it would still align the content.
    '[attr.align]': 'null',
  },
})
export class PixelCluster {
  /** Gap token (`stackGap`). */
  readonly gap = input<StackGapKey, StackGapKey | `${StackGapKey}` | undefined>(4, {
    transform: (value) => (value === undefined ? 4 : (Number(value) as StackGapKey)),
  });
  /** Cross-axis alignment. */
  readonly align = input<StackAlign, StackAlign | undefined>('center', { transform: withDefault<StackAlign>('center') });
  /** Main-axis distribution. */
  readonly justify = input<StackJustify>();
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal */
  protected readonly classes = computed(() =>
    clusterClasses(this.effectiveSurface(), { gap: this.gap(), align: this.align(), justify: this.justify() }),
  );
}
