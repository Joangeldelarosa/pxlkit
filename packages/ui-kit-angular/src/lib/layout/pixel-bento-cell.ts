import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  bentoCellClasses,
  type BentoKind,
  type BentoSpan,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * One cell of a `<pxl-bento>`: its span, inner layout and optional tone
 * chrome.
 *
 * @example
 * <pxl-bento-cell span="2x1" variant="stat" tone="cyan" bordered>…</pxl-bento-cell>
 */
@Component({
  selector: 'pxl-bento-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.data-kind]': 'resolvedKind()',
    '[attr.data-span]': 'span()',
  },
  template: '<ng-content />',
})
export class PixelBentoCell {
  /** Columns × rows the cell spans. */
  readonly span = input<BentoSpan, BentoSpan | undefined>('1x1', { transform: withDefault<BentoSpan>('1x1') });
  /** Inner layout of the cell. */
  readonly variant = input<BentoKind>();
  /** @deprecated Use `variant`. */
  readonly kind = input<BentoKind>();
  /** Tone of the chrome. */
  readonly tone = input<ToneKey, ToneKey | undefined>('neutral', { transform: withDefault<ToneKey>('neutral') });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Surface border, radius and tone tint. */
  readonly bordered = input(false, { transform: booleanOr(false) });

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal */
  protected readonly resolvedKind = computed<BentoKind>(() => this.variant() ?? this.kind() ?? 'feature');
  /** @internal */
  protected readonly classes = computed(() =>
    bentoCellClasses(this.effectiveSurface(), {
      span: this.span(),
      kind: this.resolvedKind(),
      tone: this.tone(),
      bordered: this.bordered(),
    }),
  );
}
