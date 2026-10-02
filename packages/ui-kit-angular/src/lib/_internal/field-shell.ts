import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { fieldShellClasses, fieldShellTextClasses, type Surface } from '@pxlkit/ui-kit-core';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Label, control and hint / error stacked the way every form field of the kit
 * lays them out; the control is the projected content. The host is the stack
 * (the `<div>` the React kit renders).
 */
@Component({
  selector: 'pxl-field-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'rootClasses',
  },
  template: `
    @if (label()) {
      <!-- NOT a wrapping label: native label activation would forward clicks to
           the control and double-fire fields that also trigger it themselves. -->
      @if (htmlFor()) {
        <label [attr.for]="htmlFor()" [class]="text().label">{{ label() }}</label>
      } @else {
        <span [class]="text().label">{{ label() }}</span>
      }
    }
    <ng-content />
    @if (error()) {
      <span [attr.id]="messageId() ?? null" [class]="text().error">{{ error() }}</span>
    } @else if (hint()) {
      <span [attr.id]="messageId() ?? null" [class]="text().hint">{{ hint() }}</span>
    }
  `,
})
export class PixelFieldShell {
  readonly label = input<string>();
  readonly hint = input<string>();
  readonly error = input<string>();
  readonly surface = input<Surface>();
  /**
   * Id of the field's primary control. When provided, the label text is a
   * real `<label for>`; without it the text renders as a plain span.
   */
  readonly htmlFor = input<string>();
  /**
   * Id of the hint / error text, for the control's `aria-describedby`
   * (`fieldMessageId` / `fieldDescribedBy` from the core).
   */
  readonly messageId = input<string>();

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  /** @internal */
  protected readonly rootClasses = fieldShellClasses;
  /** @internal */
  protected readonly text = computed(() => fieldShellTextClasses(this.effectiveSurface()));
}
