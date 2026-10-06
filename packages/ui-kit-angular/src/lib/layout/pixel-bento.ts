import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { BENTO_AUTO_ROWS, bentoClasses, type BentoColumns, type StackGapKey } from '@pxlkit/ui-kit-core';

/**
 * Responsive bento grid for `<pxl-bento-cell>`s: cells stack on phones and
 * the full column count applies from `lg`; rows are at least 160px tall.
 *
 * @example
 * <pxl-bento [columns]="4" [gap]="3">
 *   <pxl-bento-cell span="2x2" variant="feature">…</pxl-bento-cell>
 * </pxl-bento>
 */
@Component({
  selector: 'pxl-bento',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-bento { display: block; } }',
  host: {
    '[class]': 'classes()',
    '[attr.data-columns]': 'columns()',
    // A default the element's own style overrides, as in React.
    style: `grid-auto-rows: ${BENTO_AUTO_ROWS}`,
  },
  template: '<ng-content />',
})
export class PixelBento {
  /** Column count from `lg` up. */
  readonly columns = input<BentoColumns, BentoColumns | `${BentoColumns}` | undefined>(3, {
    transform: (value) => (value === undefined ? 3 : (Number(value) as BentoColumns)),
  });
  /** Gap token (`stackGap`). */
  readonly gap = input<StackGapKey, StackGapKey | `${StackGapKey}` | undefined>(4, {
    transform: (value) => (value === undefined ? 4 : (Number(value) as StackGapKey)),
  });

  /** @internal */
  protected readonly classes = computed(() => bentoClasses(this.columns(), this.gap()));
}
