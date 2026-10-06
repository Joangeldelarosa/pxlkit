import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  effect,
  input,
  model,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import {
  chipDeleteLabel,
  clampHighlight,
  comboboxListboxId,
  comboboxOptionId,
  fieldDescribedBy,
  fieldMessageId,
  filterComboboxOptions,
  isMultiSelectFull,
  multiSelectCheckClasses,
  multiSelectClasses,
  multiSelectKeydown,
  multiSelectOptionClasses,
  passMultiSelectFocus,
  toggleMultiSelectValue,
  type Size,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { booleanOr, optionalNumber, withDefault } from '../_internal/coercion';
import { PixelFieldShell } from '../_internal/field-shell';
import { injectId } from '../_internal/ids';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { PixelGlyph } from '../_internal/pixel-glyph';
import { FormBridge, provideValueAccessor } from '../_internal/value-accessor';
import { PixelPopover } from '../overlay-foundation/pixel-popover';
import { PixelPopoverContent } from '../overlay-foundation/pixel-popover-content';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { PixelListboxField } from './_internal/listbox-field';

/** One choice of a multi-select. */
export interface PixelMultiSelectOption {
  value: string;
  label: string;
  /** Shown before the label, on the option and on its chip: text or an `<ng-template>`. */
  icon?: PxlContent;
  /** The option shows but cannot be picked. */
  disabled?: boolean;
}

/**
 * Multi-value combobox: the picked options show as chips before the combobox
 * in its field, each with a remove button, and the listbox
 * (`aria-multiselectable`) in a popover toggles them, up to an optional `max`
 * with a count under the list. A press on the field, the arrows, Enter and
 * Space open it; the arrows move the highlight round the options, Home / End
 * to the ends, Enter or Space toggles the highlighted option (Space only from
 * the combobox: it types in the search field) and Backspace removes the last
 * chip while the search is empty. `searchable` adds a search field that takes
 * focus; `clearable` a clear button. Bind the values with `[(value)]`, use it
 * as a form control (`ngModel`, `formControlName`; a disabled form control
 * disables the whole field), or leave it uncontrolled with `defaultValue`;
 * with a `name`, one hidden input per value submits them.
 *
 * The host is layout-neutral (`display: contents`).
 *
 * @example
 * <pxl-multi-select label="Frameworks" [options]="frameworks" [max]="3" [(value)]="stack" />
 */
@Component({
  selector: 'pxl-multi-select',
  imports: [PixelFieldShell, PixelGlyph, PixelListboxField, PixelPopover, PixelPopoverContent, PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideValueAccessor(() => PixelMultiSelect)],
  host: {
    '[style.display]': '"contents"',
    // These inputs describe the trigger and the hidden inputs; as attributes
    // on the host they would duplicate the id, describe the wrong element or
    // mislead form tooling.
    '[attr.id]': 'null',
    '[attr.name]': 'null',
    '[attr.aria-describedby]': 'null',
  },
  template: `
    <pxl-field-shell
      [label]="label()"
      [hint]="hint()"
      [error]="error()"
      [surface]="effectiveSurface()"
      [htmlFor]="triggerId()"
      [messageId]="messageId()"
    >
      @if (name(); as name) {
        @for (selected of current(); track selected) {
          <input type="hidden" [attr.name]="name" [value]="selected" />
        }
      }
      <pxl-popover
        [(open)]="open"
        side="bottom"
        align="start"
        [sideOffset]="6"
        [surface]="effectiveSurface()"
        haspopup="listbox"
        role="none"
      >
        <!-- The chips, the combobox and the clear button sit side by side in the
             field, as a button cannot hold another. -->
        <div pxlListboxField [class]="classes().field" (click)="onFieldClick($event)">
          <span #values [class]="classes().values">
            @for (option of selectedOptions(); track option.value) {
              <span [class]="classes().chip">
                @if (option.icon; as icon) {
                  <span [class]="classes().icon"><ng-container *pxlOutlet="icon; let text">{{ text }}</ng-container></span>
                }
                <span [class]="classes().chipLabel">{{ option.label }}</span>
                <button
                  type="button"
                  [attr.aria-label]="removeLabel(option.label)"
                  [attr.data-pxl-chip-remove]="option.value"
                  [disabled]="form.disabled()"
                  [class]="classes().chipRemove"
                  (mousedown)="$event.preventDefault()"
                  (click)="removeChip($event, option.value)"
                >
                  <svg pxlGlyph="close" [class]="classes().chipRemoveGlyph"></svg>
                </button>
              </span>
            }
            <button
              #trigger
              type="button"
              role="combobox"
              [id]="triggerId()"
              [attr.aria-controls]="listboxId"
              aria-haspopup="listbox"
              [attr.aria-expanded]="open()"
              [attr.aria-activedescendant]="open() ? activeId() : null"
              [attr.aria-invalid]="error() ? true : null"
              [attr.aria-describedby]="describedBy() ?? null"
              [disabled]="form.disabled()"
              [class]="classes().trigger"
              (keydown)="onKeydown($event)"
              (blur)="form.touched()"
            >
              <!-- The placeholder, or the value the chips before it show. -->
              @if (selectedOptions().length === 0) {
                <span [class]="classes().placeholder">{{ placeholder() }}</span>
              } @else {
                <span class="sr-only">{{ selectedLabels() }}</span>
              }
            </button>
          </span>
          <span [class]="classes().actions">
            @if (showClear()) {
              <button
                type="button"
                aria-label="Clear selection"
                [disabled]="form.disabled()"
                [class]="classes().clear"
                (mousedown)="$event.preventDefault()"
                (click)="clearSelection($event)"
              >
                <svg pxlGlyph="close" [class]="classes().clearGlyph"></svg>
              </button>
            }
            <svg pxlGlyph="chevronDown" [class]="classes().chevron"></svg>
          </span>
        </div>
        <div *pxlPopoverContent [class]="classes().content" style="min-width: 220px">
          @if (searchable()) {
            <div [class]="classes().search">
              <!-- Focus sits here while open: it carries the active option, as the combobox does. -->
              <input
                #search
                type="text"
                role="searchbox"
                aria-label="Filter options"
                aria-autocomplete="list"
                [attr.aria-controls]="listboxId"
                [attr.aria-activedescendant]="activeId()"
                placeholder="Search…"
                [value]="query()"
                [class]="classes().input"
                (input)="onSearch($event)"
                (keydown)="onKeydown($event, true)"
              />
            </div>
          }
          <ul [id]="listboxId" role="listbox" aria-multiselectable="true" [class]="classes().listbox">
            @if (filtered().length === 0) {
              <li [class]="classes().empty">No results.</li>
            } @else {
              @for (option of filtered(); track option.value; let index = $index) {
                <!-- Options keep focus where it is: mousedown would move it before the click lands. -->
                <li
                  [id]="optionId(option.value)"
                  role="option"
                  [attr.aria-selected]="isSelected(option)"
                  [attr.aria-disabled]="isOptionDisabled(option) || null"
                  [class]="optionClasses(index, option)"
                  (mouseenter)="highlighted.set(index)"
                  (mousedown)="$event.preventDefault()"
                  (click)="onOptionClick(option)"
                >
                  <span [class]="checkClasses(option)">
                    @if (isSelected(option)) {
                      <svg pxlGlyph="check" [class]="classes().checkGlyph"></svg>
                    }
                  </span>
                  @if (option.icon; as icon) {
                    <span [class]="classes().icon"><ng-container *pxlOutlet="icon; let text">{{ text }}</ng-container></span>
                  }
                  <span [class]="classes().label">{{ option.label }}</span>
                </li>
              }
            }
          </ul>
          @if (max() !== undefined) {
            <div [class]="classes().footer">{{ current().length }}/{{ max() }} selected</div>
          }
        </div>
      </pxl-popover>
    </pxl-field-shell>
  `,
})
export class PixelMultiSelect implements ControlValueAccessor {
  /** The selected values, in the order picked (`[(value)]`); leave unset for an uncontrolled multi-select. */
  readonly value = model<string[] | undefined>(undefined);
  /** Initial values while uncontrolled. */
  readonly defaultValue = input<string[]>();
  /** The options of the listbox. */
  readonly options = input.required<PixelMultiSelectOption[]>();
  /** Shows a search field that filters the options. */
  readonly searchable = input(false, { transform: booleanOr(false) });
  /** Most values that can be selected. */
  readonly max = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Text shown while nothing is selected. */
  readonly placeholder = input<string, string | undefined>('Select…', { transform: withDefault('Select…') });
  /** Shows a button that clears the selection while there is one. */
  readonly clearable = input(false, { transform: booleanOr(false) });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Trigger height. */
  readonly size = input<Size, Size | undefined>('md', { transform: withDefault<Size>('md') });
  /** Label rendered above the trigger. */
  readonly label = input<string>();
  /** Helper text below the field; hidden while `error` is set. */
  readonly hint = input<string>();
  /** Error message below the field; marks the trigger invalid. */
  readonly error = input<string>();
  /** Form field name — one hidden input per value submits the selection. */
  readonly name = input<string>();
  /** `id` of the trigger; generated when left out. */
  readonly id = input<string>();
  /** Ids of more elements that describe the trigger; its hint / error is added while one shows. */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /** @internal */
  protected readonly form = new FormBridge<string[]>();
  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly generatedId = injectId();
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly valuesElement = viewChild.required<ElementRef<HTMLElement>>('values');
  private readonly search = viewChild<ElementRef<HTMLInputElement>>('search');

  /** @internal */
  protected readonly listboxId = comboboxListboxId(this.generatedId);
  /** @internal */
  protected readonly open = signal(false);
  /** @internal */
  protected readonly query = signal('');
  /** @internal */
  protected readonly highlighted = signal(0);

  /** @internal */
  protected readonly current = computed(() => this.value() ?? this.defaultValue() ?? []);
  /** @internal */
  protected readonly triggerId = computed(() => this.id() ?? `${this.generatedId}-trigger`);
  /** @internal */
  protected readonly messageId = computed(() => fieldMessageId(this.triggerId()));
  /** @internal */
  protected readonly describedBy = computed(() =>
    fieldDescribedBy(this.triggerId(), { hint: this.hint(), error: this.error() }, this.ariaDescribedby()),
  );
  /** @internal */
  protected readonly selectedOptions = computed(() =>
    this.current()
      .map((selected) => this.options().find((option) => option.value === selected))
      .filter((option): option is PixelMultiSelectOption => !!option),
  );
  /** @internal */
  protected readonly filtered = computed(() =>
    this.searchable() && this.query() ? filterComboboxOptions(this.options(), this.query()) : this.options(),
  );
  /** @internal */
  protected readonly activeId = computed(() => {
    const option = this.filtered()[this.highlighted()];
    return option ? this.optionId(option.value) : null;
  });
  /** @internal The combobox's value, which the chips before it show. */
  protected readonly selectedLabels = computed(() => this.selectedOptions().map((option) => option.label).join(', '));
  /** @internal */
  protected readonly showClear = computed(() => this.clearable() && this.current().length > 0);
  /** @internal */
  protected readonly removeLabel = chipDeleteLabel;
  /** @internal */
  protected readonly classes = computed(() =>
    multiSelectClasses(this.effectiveSurface(), { size: this.size(), invalid: !!this.error(), open: this.open() }),
  );

  constructor() {
    // Closing resets the search and the highlight.
    effect(() => {
      if (this.open()) return;
      untracked(() => {
        this.query.set('');
        this.highlighted.set(0);
      });
    });
    // Keep the highlight on a listed option as the search narrows the list.
    effect(() => {
      const highlighted = this.highlighted();
      const clamped = clampHighlight(highlighted, this.filtered().length);
      if (clamped !== highlighted) this.highlighted.set(clamped);
    });
    // The search field takes focus as the popover opens.
    afterRenderEffect(() => this.search()?.nativeElement.focus());
  }

  /** @internal */
  protected isSelected(option: PixelMultiSelectOption): boolean {
    return this.current().includes(option.value);
  }

  /** @internal Unselected options cannot be picked once the selection is full. */
  protected isOptionDisabled(option: PixelMultiSelectOption): boolean {
    return !!option.disabled || (!this.isSelected(option) && isMultiSelectFull(this.current(), this.max()));
  }

  /** @internal */
  protected optionId(value: string): string {
    return comboboxOptionId(this.listboxId, value);
  }

  /** @internal */
  protected optionClasses(index: number, option: PixelMultiSelectOption): string {
    return multiSelectOptionClasses(this.effectiveSurface(), {
      selected: this.isSelected(option),
      highlighted: index === this.highlighted(),
      disabled: this.isOptionDisabled(option),
    });
  }

  /** @internal */
  protected checkClasses(option: PixelMultiSelectOption): string {
    return multiSelectCheckClasses(this.effectiveSurface(), this.isSelected(option));
  }

  /** @internal */
  protected setValue(values: string[]): void {
    this.value.set(values);
    this.form.changed(values);
  }

  /** @internal */
  protected toggle(value: string): void {
    const next = toggleMultiSelectValue(this.current(), value, this.max());
    if (next) this.setValue(next);
  }

  /** @internal */
  protected onOptionClick(option: PixelMultiSelectOption): void {
    if (!this.isOptionDisabled(option)) this.toggle(option.value);
  }

  /** @internal The combobox and the search field share the keys; Space types in the field. */
  protected onKeydown(event: KeyboardEvent, inSearch = false): void {
    // Escape closes the popover, which hands focus back to the field: it
    // cannot take it, so focus leaves the search field for the combobox.
    if (event.key === 'Escape' && inSearch) {
      this.trigger().nativeElement.focus();
      return;
    }
    const filtered = this.filtered();
    const current = this.current();
    const action = multiSelectKeydown(event.key, {
      open: this.open(),
      highlighted: this.highlighted(),
      count: filtered.length,
      canToggle: (index) => !this.isOptionDisabled(filtered[index]!),
      query: this.query(),
      selected: current.length,
      inSearch,
    });
    if (!action) return;
    event.preventDefault();
    if (action.kind === 'open') this.open.set(true);
    else if (action.kind === 'highlight') this.highlighted.set(action.index);
    else if (action.kind === 'toggle') this.toggle(filtered[action.index]!.value);
    else if (action.kind === 'removeLast') this.toggle(current[current.length - 1]!);
  }

  /** @internal A press on the field focuses the combobox, which takes the keys. */
  protected onFieldClick(event: MouseEvent): void {
    if (this.form.disabled()) event.preventDefault();
    else if (!event.defaultPrevented) this.trigger().nativeElement.focus();
  }

  /**
   * @internal The remove and clear buttons leave focus where it is under the
   * pointer, as the options do, and keep the field from toggling the
   * listbox; one that holds focus hands it on as it goes.
   */
  protected removeChip(event: MouseEvent, value: string): void {
    event.preventDefault();
    this.passFocus(event);
    this.toggle(value);
  }

  /** @internal */
  protected clearSelection(event: MouseEvent): void {
    event.preventDefault();
    this.passFocus(event);
    this.setValue([]);
  }

  private passFocus(event: MouseEvent): void {
    passMultiSelectFocus(event.currentTarget as HTMLElement, this.valuesElement().nativeElement, this.trigger().nativeElement);
  }

  /** @internal */
  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.highlighted.set(0);
  }

  /** @internal ControlValueAccessor */
  writeValue(value: unknown): void {
    this.value.set(Array.isArray(value) ? value.map(String) : undefined);
  }

  /** @internal ControlValueAccessor */
  registerOnChange(fn: (value: string[]) => void): void {
    this.form.registerOnChange(fn);
  }

  /** @internal ControlValueAccessor */
  registerOnTouched(fn: () => void): void {
    this.form.registerOnTouched(fn);
  }

  /** @internal ControlValueAccessor: the field is disabled with the form control. */
  setDisabledState(disabled: boolean): void {
    this.form.disabled.set(disabled);
  }
}
