import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { dropdownChevronClasses, type Tone } from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import type { PxlContent } from '../_internal/outlet';
import { PixelGlyph } from '../_internal/pixel-glyph';
import { PixelButton } from '../actions/pixel-button';
import { injectDropdownContext } from './dropdown-context';

/**
 * The button that opens and closes the menu of a dropdown: a `pxlButton`
 * that advertises the menu (`aria-haspopup`, `aria-expanded`,
 * `aria-controls`) and ends with a chevron. Its content is the label.
 *
 * The host is layout-neutral (`display: contents`).
 *
 * @example
 * <pxl-dropdown-trigger tone="cyan">Menu</pxl-dropdown-trigger>
 */
@Component({
  selector: 'pxl-dropdown-trigger',
  imports: [PixelButton, PixelGlyph],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.display]': '"contents"' },
  template: `
    <button
      pxlButton
      [tone]="tone()"
      [surface]="context.surface()"
      [disabled]="disabled()"
      [iconRight]="icon() ?? chevron"
      aria-haspopup="menu"
      [attr.aria-expanded]="context.open()"
      [attr.aria-controls]="context.open() ? context.menuId : null"
      [attr.aria-label]="ariaLabel() ?? null"
      (click)="toggle()"
    >
      <ng-content />
    </button>
    <ng-template #chevron><svg pxlGlyph="chevronDown" [class]="chevronClasses()"></svg></ng-template>
  `,
})
export class PixelDropdownTrigger {
  /** Button tone. */
  readonly tone = input<Tone, Tone | undefined>('neutral', { transform: withDefault<Tone>('neutral') });
  /** Icon at the end of the button, in place of the chevron. */
  readonly icon = input<PxlContent>();
  /** Disables the button. */
  readonly disabled = input(false, { transform: booleanOr(false) });
  /** Accessible label, for a label that is only decorative. */
  readonly ariaLabel = input<string>();

  /** @internal */
  protected readonly context = injectDropdownContext('PixelDropdownTrigger');
  /** @internal */
  protected readonly chevronClasses = computed(() => dropdownChevronClasses(this.context.open()));

  // A disabled button gets no clicks in a browser; synthetic ones are ignored too.
  /** @internal */
  protected toggle(): void {
    if (!this.disabled()) this.context.setOpen(!this.context.open());
  }
}
