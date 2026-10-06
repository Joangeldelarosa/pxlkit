import { Directive, computed, input } from '@angular/core';
import {
  cn,
  stackAlignClasses,
  stackDirectionClasses,
  stackGap,
  stackJustifyClasses,
  surfaceClasses,
  type StackAlign,
  type StackDirection,
  type StackGapKey,
  type StackJustify,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Flexbox stack: direction, gap token, alignment, distribution and wrapping.
 * Put it on whichever element you need (the counterpart of the React kit's
 * `as` prop).
 *
 * @example
 * <div pxlStack [gap]="4">…</div>
 * <ul pxlStack direction="row" align="center">…</ul>
 */
@Directive({
  selector: '[pxlStack]',
  host: {
    '[class]': 'classes()',
    // `align` is a legacy presentational attribute: left on a block element
    // it would still centre the content.
    '[attr.align]': 'null',
  },
})
export class PixelStack {
  /** Main axis. */
  readonly direction = input<StackDirection, StackDirection | undefined>('col', {
    transform: withDefault<StackDirection>('col'),
  });
  /** Gap token (`stackGap`). */
  readonly gap = input<StackGapKey, StackGapKey | `${StackGapKey}` | undefined>(4, {
    transform: (value) => (value === undefined ? 4 : (Number(value) as StackGapKey)),
  });
  /** Cross-axis alignment. */
  readonly align = input<StackAlign>();
  /** Main-axis distribution. */
  readonly justify = input<StackJustify>();
  /** Wrap onto multiple lines. */
  readonly wrap = input(false, { transform: booleanOr(false) });
  /** `inline-flex` instead of `flex`. */
  readonly inline = input(false, { transform: booleanOr(false) });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal */
  protected readonly classes = computed(() => {
    const align = this.align();
    const justify = this.justify();
    return cn(
      this.inline() ? 'inline-flex' : 'flex',
      stackDirectionClasses[this.direction()],
      stackGap[this.gap()],
      align && stackAlignClasses[align],
      justify && stackJustifyClasses[justify],
      this.wrap() && 'flex-wrap',
      surfaceClasses(this.effectiveSurface()).transition,
    );
  });
}
