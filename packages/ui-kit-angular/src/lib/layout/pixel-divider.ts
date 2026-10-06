import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { dividerClasses, type DividerSpacing, type Surface, type Tone } from '@pxlkit/ui-kit-core';
import { withDefault } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Horizontal rule, or two rules around a label (`role="separator"` named by
 * the label). The pixel surface draws dotted rules and diamond ornaments.
 *
 * The host is layout-neutral (`display: contents`); the rule or the
 * separator is inside.
 *
 * @example
 * <pxl-divider />
 * <pxl-divider label="Settings" tone="cyan" spacing="md" />
 */
@Component({
  selector: 'pxl-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.display]': '"contents"' },
  template: `
    @if (label(); as label) {
      <div role="separator" aria-orientation="horizontal" [attr.aria-label]="label" [class]="classes().separator">
        <hr aria-hidden="true" [class]="classes().line" />
        <span [class]="classes().label">
          @if (pixel()) {
            <span aria-hidden="true" class="opacity-60">◆</span>
          }
          {{ label }}
          @if (pixel()) {
            <span aria-hidden="true" class="opacity-60">◆</span>
          }
        </span>
        <hr aria-hidden="true" [class]="classes().line" />
      </div>
    } @else {
      <hr [class]="classes().rule" />
    }
  `,
})
export class PixelDivider {
  /** Label centred between two rules; a plain `<hr>` without one. */
  readonly label = input<string>();
  /** Tone of the label text. */
  readonly tone = input<Tone, Tone | undefined>('neutral', { transform: withDefault<Tone>('neutral') });
  /** Symmetric vertical padding. */
  readonly spacing = input<DividerSpacing, DividerSpacing | undefined>('none', {
    transform: withDefault<DividerSpacing>('none'),
  });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());

  /** @internal */
  protected readonly pixel = computed(() => this.effectiveSurface() === 'pixel');
  /** @internal */
  protected readonly classes = computed(() => dividerClasses(this.effectiveSurface(), this.spacing(), this.tone()));
}
