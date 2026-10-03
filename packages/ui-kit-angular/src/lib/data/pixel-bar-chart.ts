import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  barChartClasses,
  barChartGeometry,
  chartShapeRendering,
  describeChart,
  type BarChartOrientation,
  type ChartSize,
  type PixelChartDataPoint,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * One bar per data point, vertical or horizontal, on a scale that includes
 * zero, with optional value labels, drawn into the `<svg>` it is placed on.
 * The `<svg>` is an image (`role="img"`) named by `aria-label`, or by a
 * summary of the series (kind, point count and range).
 *
 * @example
 * <svg pxlBarChart [data]="sales" orientation="horizontal" showValues></svg>
 */
@Component({
  selector: 'svg[pxlBarChart]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'img',
    '[attr.aria-label]': 'label()',
    '[attr.width]': 'geometry().width',
    '[attr.height]': 'geometry().height',
    '[attr.viewBox]': '"0 0 " + geometry().width + " " + geometry().height',
    '[attr.shape-rendering]': 'shapeRendering()',
    '[class]': 'classes().root',
  },
  template: `
    @for (bar of geometry().bars; track $index) {
      <svg:rect
        [attr.x]="bar.x"
        [attr.y]="bar.y"
        [attr.width]="bar.width"
        [attr.height]="bar.height"
        [attr.rx]="geometry().radius"
        [attr.ry]="geometry().radius"
        [class]="classes().bar"
      />
    }
    @if (showValues()) {
      @for (bar of geometry().bars; track $index) {
        <svg:text
          [attr.x]="bar.labelX"
          [attr.y]="bar.labelY"
          [attr.text-anchor]="geometry().labelAnchor"
          font-size="9"
          [class]="classes().value"
        >{{ bar.raw.y }}</svg:text>
      }
    }
  `,
})
export class PixelBarChart {
  /** The series, one bar per point; one whose `y` is not finite leaves its slot empty. */
  readonly data = input.required<PixelChartDataPoint[]>();
  /** Colour of the bars and their labels. */
  readonly tone = input<ToneKey, ToneKey | undefined>('cyan', { transform: withDefault<ToneKey>('cyan') });
  /** 160×64, 280×120 or 420×180 px. */
  readonly size = input<ChartSize, ChartSize | undefined>('md', { transform: withDefault<ChartSize>('md') });
  /** Bars growing up, or to the right. */
  readonly orientation = input<BarChartOrientation, BarChartOrientation | undefined>('vertical', {
    transform: withDefault<BarChartOrientation>('vertical'),
  });
  /** Labels each bar with its value. */
  readonly showValues = input(false, { transform: booleanOr(false) });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Surface border and radius around the chart. */
  readonly bordered = input(false, { transform: booleanOr(false) });
  /** Accessible name; a summary of the series when unset. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal */
  protected readonly geometry = computed(() =>
    barChartGeometry(this.data(), this.effectiveSurface(), {
      size: this.size(),
      orientation: this.orientation(),
      showValues: this.showValues(),
    }),
  );
  /** @internal */
  protected readonly shapeRendering = computed(() => chartShapeRendering(this.effectiveSurface()));
  /** @internal */
  protected readonly classes = computed(() =>
    barChartClasses(this.effectiveSurface(), { tone: this.tone(), bordered: this.bordered() }),
  );
  /** @internal */
  protected readonly label = computed(() => this.ariaLabel() ?? describeChart('bar chart', this.data()));
}
