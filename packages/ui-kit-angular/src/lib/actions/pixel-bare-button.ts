import { Directive, input } from '@angular/core';
import { withDefault } from '../_internal/coercion';

type BareButtonType = 'button' | 'submit' | 'reset';

/**
 * Unstyled `<button>` for composing your own: it adds no classes, and only
 * defaults the `type` to `"button"`, so it never submits a form by accident.
 *
 * @example
 * <button pxlBareButton class="rounded-md border px-3 py-1" (click)="go()">Go</button>
 * <button pxlBareButton type="submit">Send</button>
 */
@Directive({
  selector: 'button[pxlBareButton]',
  host: { '[attr.type]': 'type()' },
})
export class PixelBareButton {
  /** Native `type`; `button` unless set. */
  readonly type = input<BareButtonType, BareButtonType | undefined>('button', {
    transform: withDefault<BareButtonType>('button'),
  });
}
