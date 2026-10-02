import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import {
  PROGRESS_DEFAULT_LABEL,
  clampProgress,
  progressClasses,
  progressFillWidth,
  progressSegmentClasses,
  type Surface,
  type Tone,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Progress bar (`role="progressbar"`, 0–100): ten segmented HP-bar blocks on
 * the pixel surface, a smooth filled track on the linear one. The label names
 * the bar ("Progress" without one); while indeterminate the bar pulses,
 * drops `aria-valuenow` and sets `aria-busy`.
 *
 * @example
 * <pxl-progress [value]="60" label="HP" />
 */
@Component({
  selector: 'pxl-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-progress { display: block; } }',
  host: { '[class]': 'classes().root' },
  template: `
    @if (label() || showValue()) {
      <div [class]="classes().header">
        @if (label()) {
          <span>{{ label() }}</span>
        }
        @if (showValue() && !indeterminate()) {
          <span [class]="classes().value">{{ safe() }}%</span>
        }
      </div>
    }
    <div
      role="progressbar"
      [attr.aria-valuenow]="indeterminate() ? null : safe()"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-label]="label() ?? defaultLabel"
      [attr.aria-busy]="indeterminate() || null"
      [class]="classes().track"
    >
      @if (effectiveSurface() === 'pixel') {
        @for (segment of segments(); track $index) {
          <div [class]="segment"></div>
        }
      } @else {
        <div [class]="classes().fill" [style.width]="fillWidth()"></div>
      }
    </div>
  `,
})
export class PixelProgress {
  /** Current value 0–100 (clamped). */
  readonly value = input.required<number>();
  /** Tone of the fill. */
  readonly tone = input<Tone, Tone | undefined>('green', { transform: withDefault<Tone>('green') });
  /**
   * Label above the bar, also its accessible name; the name falls back to
   * "Progress" without one.
   */
  readonly label = input<string>();
  /** Show the percentage on the right. */
  readonly showValue = input(true, { transform: booleanOr(true) });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Unknown-duration work: the bar pulses and reports no value. */
  readonly indeterminate = input(false, { transform: booleanOr(false) });

  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  /** @internal */
  protected readonly defaultLabel = PROGRESS_DEFAULT_LABEL;
  /** @internal */
  protected readonly safe = computed(() => clampProgress(this.value()));
  /** @internal */
  protected readonly classes = computed(() =>
    progressClasses(this.effectiveSurface(), this.tone(), { indeterminate: this.indeterminate() }),
  );
  /** @internal */
  protected readonly segments = computed(() =>
    progressSegmentClasses(this.value(), this.tone(), { indeterminate: this.indeterminate() }),
  );
  /** @internal */
  protected readonly fillWidth = computed(() => progressFillWidth(this.value(), { indeterminate: this.indeterminate() }));
}
