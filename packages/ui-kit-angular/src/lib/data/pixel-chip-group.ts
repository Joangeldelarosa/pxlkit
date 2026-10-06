import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  HostAttributeToken,
  TemplateRef,
  computed,
  contentChildren,
  inject,
  input,
  model,
  viewChildren,
  ViewEncapsulation,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import {
  chipGroupClasses,
  chipGroupItemClasses,
  chipGroupKeyAction,
  chipGroupMove,
  chipGroupRole,
  chipGroupTabStop,
  toggleChipSelection,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { booleanOr } from '../_internal/coercion';
import { FormBridge, provideValueAccessor } from '../_internal/value-accessor';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Marks one chip of a `<pxl-chip-group>` with the value it stands for in the
 * selection. The group renders it inside its toggle button.
 *
 * @example
 * <pxl-chip *pxlChipGroupItem="'react'" label="React" />
 */
@Directive({ selector: '[pxlChipGroupItem]' })
export class PixelChipGroupItem {
  /** Value of the chip in the group's selection. */
  readonly pxlChipGroupItem = input.required<string>();
  /** @internal */
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/**
 * Row of selectable chips, each marked with `*pxlChipGroupItem` and rendered
 * in a toggle button: a radio group for single selection (roving tabindex;
 * arrow keys, Home and End move and select), or checkboxes with `multiple`.
 * Enter and Space toggle a chip. Bind the selection with `[(value)]`, use the
 * group as a form control (`ngModel`, `formControlName`), or leave it
 * uncontrolled with `defaultValue`. A static `aria-label` or
 * `aria-labelledby` names the row — required for single selection; with
 * `multiple` it makes the row a `role="group"`.
 *
 * @example
 * <pxl-chip-group [(value)]="frameworks" multiple aria-label="Frameworks">
 *   <pxl-chip *pxlChipGroupItem="'react'" label="React" />
 *   <pxl-chip *pxlChipGroupItem="'vue'" label="Vue" />
 * </pxl-chip-group>
 */
@Component({
  selector: 'pxl-chip-group',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-chip-group { display: block; } }',
  providers: [provideValueAccessor(() => PixelChipGroup)],
  host: {
    '[attr.role]': 'role()',
    '[class]': 'classes',
  },
  template: `
    @for (item of items(); track item) {
      @let value = item.pxlChipGroupItem();
      @let selected = selection().includes(value);
      <button
        #chip
        type="button"
        [attr.role]="multiple() ? 'checkbox' : 'radio'"
        [attr.aria-checked]="selected"
        [attr.tabindex]="multiple() ? null : value === tabStop() ? 0 : -1"
        [attr.data-value]="value"
        [attr.data-selected]="selected ? 'true' : 'false'"
        [disabled]="form.disabled()"
        [class]="itemClasses(selected)"
        (click)="toggle(value)"
        (keydown)="onKeydown($event, value)"
        (blur)="form.touched()"
      >
        <ng-container [ngTemplateOutlet]="item.template" />
      </button>
    }
  `,
})
export class PixelChipGroup implements ControlValueAccessor {
  /** Selected chip values (`[(value)]`); leave unset for an uncontrolled group. */
  readonly value = model<string[] | undefined>(undefined);
  /** Initial selection while uncontrolled. */
  readonly defaultValue = input<string[]>();
  /** Any number of chips can be selected (checkboxes) instead of one (radios). */
  readonly multiple = input(false, { transform: booleanOr(false) });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  /** @internal */
  protected readonly form = new FormBridge<string[]>();
  /** @internal */
  protected readonly items = contentChildren(PixelChipGroupItem);
  private readonly chips = viewChildren<ElementRef<HTMLButtonElement>>('chip');
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly ownRole = inject(new HostAttributeToken('role'), { optional: true });
  private readonly named = Boolean(
    inject(new HostAttributeToken('aria-label'), { optional: true }) ||
      inject(new HostAttributeToken('aria-labelledby'), { optional: true }),
  );

  /** @internal An own `role` wins. */
  protected readonly role = computed(() => this.ownRole ?? chipGroupRole(this.multiple(), this.named) ?? null);
  /** @internal */
  protected readonly classes = chipGroupClasses;
  /** @internal */
  protected readonly selection = computed(() => this.value() ?? this.defaultValue() ?? []);
  private readonly values = computed(() => this.items().map((item) => item.pxlChipGroupItem()));
  /** @internal The chip Tab reaches in single selection. */
  protected readonly tabStop = computed(() => chipGroupTabStop(this.values(), this.selection()));

  /** @internal */
  protected itemClasses(selected: boolean): string {
    return chipGroupItemClasses(this.effectiveSurface(), selected);
  }

  /** @internal */
  protected toggle(value: string): void {
    this.select(toggleChipSelection(this.selection(), value, this.multiple()));
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent, value: string): void {
    const action = chipGroupKeyAction(event.key, this.multiple());
    if (action === undefined) return;
    event.preventDefault();
    if (action === 'toggle') {
      this.toggle(value);
      return;
    }
    // In the radio group pattern, a move focuses and selects.
    const values = this.values();
    const move = chipGroupMove(values, this.selection(), value, action);
    if (!move) return;
    this.chips()[values.indexOf(move.focus)]?.nativeElement.focus();
    if (move.selection) this.select(move.selection);
  }

  private select(selection: string[]): void {
    this.value.set(selection);
    this.form.changed(selection);
  }

  /** @internal ControlValueAccessor */
  writeValue(value: unknown): void {
    this.value.set(Array.isArray(value) ? value : undefined);
  }

  /** @internal ControlValueAccessor */
  registerOnChange(fn: (value: string[]) => void): void {
    this.form.registerOnChange(fn);
  }

  /** @internal ControlValueAccessor */
  registerOnTouched(fn: () => void): void {
    this.form.registerOnTouched(fn);
  }

  /** @internal ControlValueAccessor */
  setDisabledState(disabled: boolean): void {
    this.form.disabled.set(disabled);
  }
}
