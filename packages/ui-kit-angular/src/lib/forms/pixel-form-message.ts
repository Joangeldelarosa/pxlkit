import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { formMessageClasses, type Surface } from '@pxlkit/ui-kit-core';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { PIXEL_FORM_FIELD, injectFormItem } from './form-context';

/**
 * The message of a `<pxl-form-item>`: the field's error, as an alert, while
 * it shows one — the text its `[pxlFormField]` has in `messages` for the
 * error. Otherwise it renders nothing. The host is layout-neutral
 * (`display: contents`).
 *
 * @example
 * <pxl-form-message />
 */
@Component({
  selector: 'pxl-form-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.display]': '"contents"' },
  template: `
    @if (message(); as message) {
      <p [attr.id]="item.messageId" role="alert" [class]="classes()">{{ message }}</p>
    }
  `,
})
export class PixelFormMessage {
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  /** @internal */
  protected readonly item = injectFormItem('PixelFormMessage');
  private readonly field = inject(PIXEL_FORM_FIELD, { optional: true });
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  /** @internal */
  protected readonly message = computed(() => this.field?.message());
  /** @internal */
  protected readonly classes = computed(() => formMessageClasses(this.effectiveSurface(), true));
}
