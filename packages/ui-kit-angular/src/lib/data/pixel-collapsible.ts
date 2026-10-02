import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { collapsibleClasses, collapsibleIds, type Surface, type Tone } from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { injectId } from '../_internal/ids';
import { PixelGlyph } from '../_internal/pixel-glyph';
import { PixelButton } from '../actions/pixel-button';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Disclosure: a compact ghost button with a chevron that shows and hides the
 * projected content. The button reports `aria-expanded` and controls the
 * body (`aria-controls`), which it labels; the body is on the page only
 * while open (its content is created with the collapsible, as projected
 * content always is).
 *
 * @example
 * <pxl-collapsible label="Show details" tone="cyan">
 *   <p>Revealed when the header is toggled.</p>
 * </pxl-collapsible>
 */
@Component({
  selector: 'pxl-collapsible',
  imports: [PixelButton, PixelGlyph],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes().root' },
  template: `
    <button
      pxlButton
      [id]="ids.trigger"
      type="button"
      size="sm"
      [tone]="tone()"
      [surface]="effectiveSurface()"
      variant="ghost"
      [attr.aria-expanded]="isOpen()"
      [attr.aria-controls]="ids.content"
      [class]="classes().trigger"
      [iconRight]="chevron"
      (click)="toggle()"
    >{{ label() }}</button>
    <ng-template #chevron><svg pxlGlyph="chevronDown" [class]="classes().chevron"></svg></ng-template>
    @if (isOpen()) {
      <div [id]="ids.content" [attr.aria-labelledby]="ids.trigger" [class]="classes().content"><ng-content /></div>
    }
  `,
})
export class PixelCollapsible {
  /** Label of the header button. */
  readonly label = input.required<string>();
  /** Open on first render. */
  readonly defaultOpen = input(false, { transform: booleanOr(false) });
  /** Tone of the header button. */
  readonly tone = input<Tone, Tone | undefined>('neutral', { transform: withDefault<Tone>('neutral') });
  /** Visual surface override. */
  readonly surface = input<Surface>();
  /** Surface-aware border and radius around the collapsible. */
  readonly bordered = input(false, { transform: booleanOr(false) });

  /** @internal */
  protected readonly ids = collapsibleIds(injectId());
  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  // Unset until the first toggle: `defaultOpen` decides until then.
  private readonly open = signal<boolean | undefined>(undefined);
  /** @internal */
  protected readonly isOpen = computed(() => this.open() ?? this.defaultOpen());
  /** @internal */
  protected readonly classes = computed(() =>
    collapsibleClasses(this.effectiveSurface(), { bordered: this.bordered(), open: this.isOpen() }),
  );

  /** @internal */
  protected toggle(): void {
    this.open.set(!this.isOpen());
  }
}
