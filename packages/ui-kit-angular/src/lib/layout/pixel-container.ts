import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  containerClasses,
  resolveContainerPadding,
  type ContainerPadding,
  type ContainerWidth,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { withDefault } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { PixelCenter } from './pixel-center';

/**
 * Full-width page band: vertical rhythm around a centred, width-capped
 * column (a `pxlCenter`) that holds the content. Put it on the element you
 * need — the React kit renders a `<section>` unless told otherwise; a
 * landmark wants an `aria-label` or `aria-labelledby`.
 *
 * @example
 * <section pxlContainer maxWidth="md" padding="md">…</section>
 * <main pxlContainer aria-label="Page content" [padding]="{ x: 'lg', y: 'xl' }">…</main>
 */
@Component({
  selector: '[pxlContainer]',
  imports: [PixelCenter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
  template: `
    <div pxlCenter [maxWidth]="maxWidth()" [gutter]="resolvedPadding().x" [surface]="effectiveSurface()">
      <ng-content />
    </div>
  `,
})
export class PixelContainer {
  /** Width cap of the inner column (`containerWidth`). */
  readonly maxWidth = input<ContainerWidth, ContainerWidth | undefined>('xl', {
    transform: withDefault<ContainerWidth>('xl'),
  });
  /**
   * Vertical rhythm (`sectionRhythm`), or `{ x, y }`: the gutter of the inner
   * column (`pageGutter`) and the rhythm. Both default to `lg`.
   */
  readonly padding = input<ContainerPadding>();
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  /** @internal */
  protected readonly resolvedPadding = computed(() => resolveContainerPadding(this.padding()));

  /** @internal */
  protected readonly classes = computed(() => containerClasses(this.effectiveSurface(), this.resolvedPadding().y));
}
