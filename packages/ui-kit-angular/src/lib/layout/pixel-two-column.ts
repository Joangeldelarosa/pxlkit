import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  twoColumnClasses,
  twoColumnSideClasses,
  type GridAlign,
  type StackGapKey,
  type Surface,
  type TwoColumnBreakpoint,
  type TwoColumnRatio,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Two columns side by side at a fixed ratio, stacked below a breakpoint.
 * `left` and `right` take text or an `<ng-template>`; `reverse` swaps them
 * on screen while keeping the reading order. Put it on whichever element
 * you need (the counterpart of the React kit's `as` prop).
 *
 * @example
 * <div pxlTwoColumn ratio="60/40" [left]="main" [right]="aside"></div>
 * <ng-template #main>…</ng-template>
 * <ng-template #aside>…</ng-template>
 */
@Component({
  selector: '[pxlTwoColumn]',
  imports: [PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    // `align` is a legacy presentational attribute: left on a block element
    // it would still align the content.
    '[attr.align]': 'null',
  },
  template: `
    <div [class]="sides().left"><ng-container *pxlOutlet="left(); let text">{{ text }}</ng-container></div>
    <div [class]="sides().right"><ng-container *pxlOutlet="right(); let text">{{ text }}</ng-container></div>
  `,
})
export class PixelTwoColumn {
  /** Content of the left column. */
  readonly left = input.required<PxlContent>();
  /** Content of the right column. */
  readonly right = input.required<PxlContent>();
  /** Width of the left column against the right one. */
  readonly ratio = input<TwoColumnRatio, TwoColumnRatio | undefined>('50/50', {
    transform: withDefault<TwoColumnRatio>('50/50'),
  });
  /** Gap token (`stackGap`). */
  readonly gap = input<StackGapKey, StackGapKey | `${StackGapKey}` | undefined>(6, {
    transform: (value) => (value === undefined ? 6 : (Number(value) as StackGapKey)),
  });
  /** Show the right column first (CSS `order`; the DOM order stays). */
  readonly reverse = input(false, { transform: booleanOr(false) });
  /** Breakpoint below which the columns stack. */
  readonly stackBelow = input<TwoColumnBreakpoint, TwoColumnBreakpoint | undefined>('md', {
    transform: withDefault<TwoColumnBreakpoint>('md'),
  });
  /** Block-axis alignment of the columns. */
  readonly align = input<GridAlign>();
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Surface border and radius. */
  readonly bordered = input(false, { transform: booleanOr(false) });

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal */
  protected readonly classes = computed(() =>
    twoColumnClasses(this.effectiveSurface(), {
      ratio: this.ratio(),
      gap: this.gap(),
      stackBelow: this.stackBelow(),
      align: this.align(),
      bordered: this.bordered(),
    }),
  );
  /** @internal */
  protected readonly sides = computed(() => twoColumnSideClasses(this.reverse()));
}
