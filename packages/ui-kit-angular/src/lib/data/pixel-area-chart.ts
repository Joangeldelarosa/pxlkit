import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  areaChartClasses,
  areaChartGeometry,
  areaChartGlow,
  areaChartStroke,
  chartShapeRendering,
  describeChart,
  type ChartSize,
  type PixelChartDataPoint,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * A series drawn as a filled polygon closed down to the baseline, into the
 * `<svg>` it is placed on. The polygon stays polygonal, so the pixel surface
 * keeps crisp edges; `smooth` rounds its joins on the linear surface. The
 * `<svg>` is an image (`role="img"`) named by `aria-label`, or by a summary
 * of the series (kind, point count and range).
 *
 * @example
 * <svg pxlAreaChart [data]="sales" smooth tone="green"></svg>
 */
@Component({
  selector: 'svg[pxlAreaChart]',
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
    '[attr.data-tone-glow]': 'glow()',
    '[attr.data-smooth]': 'smooth() || null',
  },
  template: `
    @if (geometry().polygon) {
      <svg:polygon
        [attr.points]="geometry().polygon"
        [attr.stroke-width]="stroke().width"
        [attr.stroke-linejoin]="stroke().linejoin"
        [class]="classes().polygon"
        fill-opacity="0.25"
      />
    }
  `,
})
export class PixelAreaChart {
  /** The series. Points are spread evenly; `x` only labels them. */
  readonly data = input.required<PixelChartDataPoint[]>();
  /** Colour of the outline and the fill. */
  readonly tone = input<ToneKey, ToneKey | undefined>('cyan', { transform: withDefault<ToneKey>('cyan') });
  /** 120×32, 240×60 or 360×96 px. */
  readonly size = input<ChartSize, ChartSize | undefined>('md', { transform: withDefault<ChartSize>('md') });
  /** Rounds the outline's joins (linear surface only). */
  readonly smooth = input(false, { transform: booleanOr(false) });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Surface border and radius around the chart. */
  readonly bordered = input(false, { transform: booleanOr(false) });
  /** Accessible name; a summary of the series when unset. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal */
  protected readonly geometry = computed(() => areaChartGeometry(this.data(), this.size()));
  /** @internal */
  protected readonly stroke = computed(() => areaChartStroke(this.effectiveSurface(), this.smooth()));
  /** @internal */
  protected readonly shapeRendering = computed(() => chartShapeRendering(this.effectiveSurface()));
  /** @internal */
  protected readonly classes = computed(() =>
    areaChartClasses(this.effectiveSurface(), { tone: this.tone(), bordered: this.bordered() }),
  );
  /** @internal */
  protected readonly glow = computed(() => areaChartGlow(this.tone()));
  /** @internal */
  protected readonly label = computed(() => this.ariaLabel() ?? describeChart('area chart', this.data()));
}
