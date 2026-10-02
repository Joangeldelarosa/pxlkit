import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { colorSwatchClasses, colorSwatchFill, type Surface } from '@pxlkit/ui-kit-core';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Design-token preview: a square filled from a CSS custom property — so it
 * follows the active theme — beside the token name and the variable.
 *
 * @example
 * <pxl-color-swatch name="Cyan" cssVar="--color-retro-cyan" />
 */
@Component({
  selector: 'pxl-color-swatch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-color-swatch { display: block; } }',
  host: { '[class]': 'classes().root' },
  template: `
    <div [class]="classes().sample" [style.background-color]="fill()"></div>
    <div>
      <p [class]="classes().name">{{ name() }}</p>
      <p [class]="classes().variable">{{ cssVar() }}</p>
    </div>
  `,
})
export class PixelColorSwatch {
  /** Display name of the token (e.g. "Cyan 500"). */
  readonly name = input.required<string>();
  /** CSS variable to preview (e.g. "--color-retro-cyan"). */
  readonly cssVar = input.required<string>();
  /** Visual surface override. */
  readonly surface = input<Surface>();

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal */
  protected readonly classes = computed(() => colorSwatchClasses(this.effectiveSurface()));
  /** @internal */
  protected readonly fill = computed(() => colorSwatchFill(this.cssVar()));
}
