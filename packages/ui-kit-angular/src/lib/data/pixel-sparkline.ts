import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  chartShapeRendering,
  describeChart,
  sparklineClasses,
  sparklineGeometry,
  sparklineStroke,
  type ChartSize,
  type PixelChartDataPoint,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * A series drawn as one polyline, with an optional area filled underneath,
 * into the `<svg>` it is placed on. The `<svg>` is an image (`role="img"`)
 * named by `aria-label`, or by a summary of the series (kind, point count
 * and range).
 *
 * @example
 * <svg pxlSparkline [data]="sales" tone="green" showArea></svg>
 */
@Component({
  selector: 'svg[pxlSparkline]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'img',
    '[attr.aria-label]': 'label()',
    '[attr.width]': 'geometry().width',
    '[attr.height]': 'geometry().height',
    '[attr.viewBox]': '"0 0 " + geometry().width + " " + geometry().height',
    preserveAspectRatio: 'none',
    '[attr.shape-rendering]': 'shapeRendering()',
    '[class]': 'classes().root',
  },
  template: `
    @if (showArea() && geometry().area) {
      <svg:polygon [attr.points]="geometry().area" [class]="classes().area" stroke="none" />
    }
    <svg:polyline
      [attr.points]="geometry().line"
      fill="none"
      [attr.stroke-width]="stroke().width"
      [attr.stroke-linejoin]="stroke().linejoin"
      [attr.stroke-linecap]="stroke().linecap"
      [class]="classes().line"
    />
  `,
})
export class PixelSparkline {
  /** The series. Points are spread evenly; `x` only labels them, and one whose `y` is not finite is left out. */
  readonly data = input.required<PixelChartDataPoint[]>();
  /** Colour of the line and the area. */
  readonly tone = input<ToneKey, ToneKey | undefined>('cyan', { transform: withDefault<ToneKey>('cyan') });
  /** 120×32, 240×60 or 360×96 px. */
  readonly size = input<ChartSize, ChartSize | undefined>('md', { transform: withDefault<ChartSize>('md') });
  /** Fills the area under the line, faintly. */
  readonly showArea = input(false, { transform: booleanOr(false) });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Surface border and radius around the chart. */
  readonly bordered = input(false, { transform: booleanOr(false) });
  /** Accessible name; a summary of the series when unset. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal */
  protected readonly geometry = computed(() => sparklineGeometry(this.data(), this.size()));
  /** @internal */
  protected readonly stroke = computed(() => sparklineStroke(this.effectiveSurface()));
  /** @internal */
  protected readonly shapeRendering = computed(() => chartShapeRendering(this.effectiveSurface()));
  /** @internal */
  protected readonly classes = computed(() =>
    sparklineClasses(this.effectiveSurface(), { tone: this.tone(), bordered: this.bordered() }),
  );
  /** @internal */
  protected readonly label = computed(() => this.ariaLabel() ?? describeChart('sparkline', this.data()));
}
