import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostAttributeToken,
  computed,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import {
  dropdownItemClasses,
  dropdownItemIconClasses,
  dropdownItemLabelClasses,
  dropdownMark,
  dropdownMarkClasses,
  dropdownShortcutClasses,
  type Tone,
} from '@pxlkit/ui-kit-core';
import { booleanOr } from '../_internal/coercion';
import { injectId } from '../_internal/ids';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { injectDropdownContext, labelText } from './dropdown-context';

/**
 * An action of a dropdown menu (`role="menuitem"`) on a `<button>`: clicking
 * it, or Enter / Space while it is highlighted, emits `(selected)` and closes
 * the menu; the pointer highlights it. A disabled item is skipped by the
 * keyboard. As `pxlDropdownCheckboxItem` or `pxlDropdownRadioItem` it shows
 * a check mark or a dot while `checked` (display only — update it from
 * `(selected)`), in place of an icon.
 *
 * @example
 * <button pxlDropdownItem value="share" shortcut="Ctrl+E" (selected)="share()">Share</button>
 * <button pxlDropdownCheckboxItem [checked]="grid()" (selected)="grid.set(!grid())">Grid lines</button>
 */
@Component({
  selector: 'button[pxlDropdownItem], button[pxlDropdownCheckboxItem], button[pxlDropdownRadioItem]',
  imports: [PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    type: 'button',
    role: 'menuitem',
    tabindex: '-1',
    '[attr.aria-disabled]': 'disabled() || null',
    '[attr.data-highlighted]': 'highlighted() || null',
    '[attr.disabled]': 'disabled() ? "" : null',
    // `value` names the item; as a native button attribute it would submit.
    '[attr.value]': 'null',
    '[class]': 'classes()',
    '(mouseenter)': 'onMouseenter()',
    '(click)': 'onClick()',
  },
  template: `
    @if (mark() !== null) {
      <span [class]="iconClasses"><span aria-hidden="true" [class]="markClasses">{{ mark() }}</span></span>
    } @else if (icon()) {
      <span [class]="iconClasses"><ng-container *pxlOutlet="icon(); let text">{{ text }}</ng-container></span>
    }
    <span #label [class]="labelClasses"><ng-content /></span>
    @if (shortcut()) {
      <kbd data-testid="dropdown-shortcut" [class]="shortcutClasses()">{{ shortcut() }}</kbd>
    }
  `,
})
export class PixelDropdownItem {
  /** Identity of the item for highlight and typeahead (not a form value); generated when left out. */
  readonly value = input<string>();
  /** Skipped by the keyboard and ignores the pointer. */
  readonly disabled = input(false, { transform: booleanOr(false) });
  /** Red text, for a destructive action — same as `tone="red"`. */
  readonly destructive = input(false, { transform: booleanOr(false) });
  /** Text tone. */
  readonly tone = input<Tone>();
  /** Icon before the label (plain items). */
  readonly icon = input<PxlContent>();
  /** Keyboard hint shown at the end of the row (display only). */
  readonly shortcut = input<string>();
  /** Shows the mark of a checkbox or radio item. */
  readonly checked = input(false, { transform: booleanOr(false) });
  /** The item was chosen; the menu closes. */
  readonly selected = output<void>();

  private readonly context = injectDropdownContext('PixelDropdownItem');
  private readonly kind = inject(new HostAttributeToken('pxlDropdownCheckboxItem'), { optional: true }) !== null
    ? 'checkbox'
    : inject(new HostAttributeToken('pxlDropdownRadioItem'), { optional: true }) !== null
      ? 'radio'
      : null;
  private readonly generatedValue = injectId();
  private readonly label = viewChild.required<ElementRef<HTMLElement>>('label');
  private readonly itemValue = () => this.value() ?? this.generatedValue;

  /** @internal */
  protected readonly highlighted = computed(() => this.context.highlighted() === this.itemValue());
  /** @internal */
  protected readonly mark = computed(() => (this.kind ? dropdownMark(this.kind, this.checked()) : null));
  /** @internal */
  protected readonly classes = computed(() =>
    dropdownItemClasses(this.context.surface(), {
      highlighted: this.highlighted(),
      disabled: this.disabled(),
      tone: this.destructive() ? 'red' : this.tone(),
    }),
  );
  /** @internal */
  protected readonly shortcutClasses = computed(() => dropdownShortcutClasses(this.context.surface()));
  /** @internal */
  protected readonly iconClasses = dropdownItemIconClasses;
  /** @internal */
  protected readonly markClasses = dropdownMarkClasses;
  /** @internal */
  protected readonly labelClasses = dropdownItemLabelClasses;

  constructor() {
    const unregister = this.context.registerItem({
      value: this.itemValue,
      disabled: () => this.disabled(),
      label: () => labelText(this.label().nativeElement),
      select: () => this.select(),
    });
    inject(DestroyRef).onDestroy(unregister);
  }

  // A disabled button gets no pointer events in a browser; synthetic ones are ignored too.
  /** @internal */
  protected onMouseenter(): void {
    if (!this.disabled()) this.context.highlight(this.itemValue());
  }

  /** @internal */
  protected onClick(): void {
    if (this.disabled()) return;
    this.select();
    this.context.setOpen(false);
  }

  private select(): void {
    if (!this.disabled()) this.selected.emit();
  }
}
