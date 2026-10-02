import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, inject, input, viewChild } from '@angular/core';
import { dropdownChevronClasses, type Tone } from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import type { PxlContent } from '../_internal/outlet';
import { PixelGlyph } from '../_internal/pixel-glyph';
import { PixelButton } from '../actions/pixel-button';
import { injectDropdownContext } from './dropdown-context';

/**
 * The button that opens and closes the menu of a dropdown: a `pxlButton`
 * that advertises the menu (`aria-haspopup`, `aria-expanded`,
 * `aria-controls`), names it, and ends with a chevron. Its content is the
 * label. ArrowDown opens the menu on its first item, ArrowUp on its last.
 *
 * The host is layout-neutral (`display: contents`); the `id` goes to the button.
 *
 * @example
 * <pxl-dropdown-trigger tone="cyan">Menu</pxl-dropdown-trigger>
 */
@Component({
  selector: 'pxl-dropdown-trigger',
  imports: [PixelButton, PixelGlyph],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.display]': '"contents"', '[attr.id]': 'null' },
  template: `
    <button
      #button
      pxlButton
      [attr.id]="context.triggerId()"
      [tone]="tone()"
      [surface]="context.surface()"
      [disabled]="disabled()"
      [iconRight]="icon() ?? chevron"
      aria-haspopup="menu"
      [attr.aria-expanded]="context.open()"
      [attr.aria-controls]="context.open() ? context.menuId : null"
      [attr.aria-label]="ariaLabel() ?? null"
      (click)="toggle()"
      (keydown)="context.onTriggerKeydown($event)"
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
  /** Id of the button, which names the menu; generated when left out. */
  readonly id = input<string>();

  /** @internal */
  protected readonly context = injectDropdownContext('PixelDropdownTrigger');
  /** @internal */
  protected readonly chevronClasses = computed(() => dropdownChevronClasses(this.context.open()));
  private readonly button = viewChild('button', { read: ElementRef<HTMLButtonElement> });

  constructor() {
    const unregister = this.context.registerTrigger({
      id: () => this.id(),
      element: () => this.button()?.nativeElement,
    });
    inject(DestroyRef).onDestroy(unregister);
  }

  // A disabled button gets no clicks in a browser; synthetic ones are ignored too.
  /** @internal */
  protected toggle(): void {
    if (!this.disabled()) this.context.setOpen(!this.context.open());
  }
}
