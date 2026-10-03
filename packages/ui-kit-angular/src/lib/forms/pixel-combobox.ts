import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { ControlValueAccessor } from '@angular/forms';
import {
  clampHighlight,
  comboboxClasses,
  comboboxKeydown,
  comboboxListboxId,
  comboboxOptionClasses,
  comboboxOptionId,
  comboboxRows,
  fieldDescribedBy,
  fieldMessageId,
  filterComboboxOptions,
  type Size,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { PixelFieldShell } from '../_internal/field-shell';
import { injectId } from '../_internal/ids';
import { PixelGlyph } from '../_internal/pixel-glyph';
import { FormBridge, provideValueAccessor } from '../_internal/value-accessor';
import { PixelPopover } from '../overlay-foundation/pixel-popover';
import { PixelPopoverContent } from '../overlay-foundation/pixel-popover-content';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { PixelListboxTrigger } from './_internal/listbox-trigger';

/** One choice of a combobox. */
export interface PixelComboboxOption {
  value: string;
  label: string;
  /** Heading the option is listed under; the options of a group are listed together. */
  group?: string;
  /** The option shows but cannot be selected. */
  disabled?: boolean;
}

/**
 * Single-value combobox: a `role="combobox"` trigger over a listbox in a
 * popover, with a search field that filters it (`searchable`, on by default)
 * and options grouped under headings by their `group`. ArrowDown, ArrowUp
 * and Enter open it; the arrows move the highlight round the listed options,
 * Home / End to the ends, Enter selects, Escape and a press outside close.
 * Bind the value with `[(value)]`, use it as a form control (`ngModel`,
 * `formControlName`), or leave it uncontrolled with `defaultValue`; with a
 * `name` a hidden input submits it.
 *
 * The host is layout-neutral (`display: contents`).
 *
 * @example
 * <pxl-combobox label="Fruit" [options]="fruits" [(value)]="fruit" />
 */
@Component({
  selector: 'pxl-combobox',
  imports: [PixelFieldShell, PixelGlyph, PixelListboxTrigger, PixelPopover, PixelPopoverContent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideValueAccessor(() => PixelCombobox)],
  host: {
    '[style.display]': '"contents"',
    // These inputs describe the trigger and the hidden input; as attributes
    // on the host they would duplicate the id, describe the wrong element or
    // mislead form tooling.
    '[attr.id]': 'null',
    '[attr.name]': 'null',
    '[attr.disabled]': 'null',
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
      <div [class]="classes().container">
        @if (name()) {
          <input type="hidden" [attr.name]="name()" [value]="current()" readonly />
        }
        <pxl-popover
          [open]="open()"
          (openChange)="onOpenChange($event)"
          side="bottom"
          align="start"
          [sideOffset]="4"
          [surface]="effectiveSurface()"
          haspopup="listbox"
          role="none"
        >
          <button
            pxlListboxTrigger
            type="button"
            role="combobox"
            [id]="triggerId()"
            aria-haspopup="listbox"
            [attr.aria-controls]="listboxId"
            [attr.aria-activedescendant]="open() ? activeId() : null"
            [attr.aria-disabled]="isDisabled() || null"
            [attr.aria-invalid]="error() ? true : null"
            [attr.aria-describedby]="describedBy() ?? null"
            [disabled]="isDisabled()"
            [class]="classes().trigger"
            (keydown)="onKeydown($event)"
            (blur)="form.touched()"
          >
            <span [class]="classes().value">{{ selected()?.label ?? placeholder() }}</span>
            <svg pxlGlyph="chevronDown" [class]="classes().chevron"></svg>
          </button>
          <div *pxlPopoverContent [class]="classes().content" style="min-width: 12rem">
            @if (searchable()) {
              <div [class]="classes().search">
                <input
                  #search
                  type="text"
                  role="searchbox"
                  aria-label="Filter options"
                  aria-autocomplete="list"
                  [attr.aria-controls]="listboxId"
                  [attr.aria-activedescendant]="activeId()"
                  [value]="query()"
                  [class]="classes().input"
                  placeholder="Search…"
                  (input)="onSearch($event)"
                  (keydown)="onKeydown($event)"
                />
              </div>
            }
            @if (list().items.length === 0) {
              <div [class]="classes().empty">{{ emptyMessage() }}</div>
            } @else {
              <!-- Focusable only without a search field, which otherwise takes the keys. -->
              <ul
                [id]="listboxId"
                role="listbox"
                [class]="classes().listbox"
                [attr.tabindex]="searchable() ? null : 0"
                (keydown)="onKeydown($event)"
              >
                @for (row of list().rows; track row.key) {
                  @if (row.kind === 'heading') {
                    <li role="presentation" [class]="classes().heading">{{ row.heading }}</li>
                  } @else {
                    <!-- Options keep focus where it is: mousedown would move it before the click lands. -->
                    <li
                      [id]="optionId(row.option.value)"
                      role="option"
                      [attr.aria-selected]="row.option.value === current()"
                      [attr.aria-disabled]="row.option.disabled || null"
                      [class]="optionClasses(row.index, row.option)"
                      (mouseenter)="highlighted.set(row.index)"
                      (mousedown)="$event.preventDefault()"
                      (click)="commit(row.option)"
                    >
                      <span [class]="classes().label">{{ row.option.label }}</span>
                      @if (row.option.value === current()) {
                        <svg pxlGlyph="check" [class]="classes().check"></svg>
                      }
                    </li>
                  }
                }
              </ul>
            }
          </div>
        </pxl-popover>
      </div>
    </pxl-field-shell>
  `,
})
export class PixelCombobox implements ControlValueAccessor {
  /** Selected value (`[(value)]`); leave unset for an uncontrolled combobox. */
  readonly value = model<string | undefined>(undefined);
  /** Initial value while uncontrolled. */
  readonly defaultValue = input<string>();
  /** The options of the listbox. */
  readonly options = input.required<PixelComboboxOption[]>();
  /** Shows the search field that filters the options. */
  readonly searchable = input(true, { transform: booleanOr(true) });
  /** Text shown while nothing is selected. */
  readonly placeholder = input<string, string | undefined>('Select…', { transform: withDefault('Select…') });
  /** Shown in place of the listbox when nothing matches the search. */
  readonly emptyMessage = input<string, string | undefined>('No results.', { transform: withDefault('No results.') });
  /** Disables the combobox and greys out the trigger. */
  readonly disabled = input(false, { transform: booleanOr(false) });
  /** Trigger height. */
  readonly size = input<Size, Size | undefined>('md', { transform: withDefault<Size>('md') });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Label rendered above the trigger. */
  readonly label = input<string>();
  /** Helper text below the field; hidden while `error` is set. */
  readonly hint = input<string>();
  /** Error message below the field; marks the trigger invalid. */
  readonly error = input<string>();
  /** Form field name — a hidden input submits the value. */
  readonly name = input<string>();
  /** `id` of the trigger; generated when left out. */
  readonly id = input<string>();
  /** Ids of more elements that describe the trigger; its hint / error is added while one shows. */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /** @internal */
  protected readonly form = new FormBridge<string>();
  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly generatedId = injectId();
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
  protected readonly current = computed(() => this.value() ?? this.defaultValue() ?? '');
  /** @internal */
  protected readonly isDisabled = computed(() => this.disabled() || this.form.disabled());
  /** @internal */
  protected readonly triggerId = computed(() => this.id() ?? `${this.generatedId}-trigger`);
  /** @internal */
  protected readonly messageId = computed(() => fieldMessageId(this.triggerId()));
  /** @internal */
  protected readonly describedBy = computed(() =>
    fieldDescribedBy(this.triggerId(), { hint: this.hint(), error: this.error() }, this.ariaDescribedby()),
  );
  /** @internal */
  protected readonly list = computed(() => comboboxRows(filterComboboxOptions(this.options(), this.query())));
  /** @internal */
  protected readonly selected = computed(() => this.options().find((option) => option.value === this.current()));
  /** @internal */
  protected readonly activeId = computed(() => {
    const option = this.list().items[this.highlighted()];
    return option ? this.optionId(option.value) : null;
  });
  /** @internal */
  protected readonly classes = computed(() =>
    comboboxClasses(this.effectiveSurface(), {
      size: this.size(),
      invalid: !!this.error(),
      disabled: this.isDisabled(),
      open: this.open(),
      hasValue: !!this.selected(),
    }),
  );

  constructor() {
    // Every opening starts from an empty search, on the first option.
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
      const clamped = clampHighlight(highlighted, this.list().items.length);
      if (clamped !== highlighted) this.highlighted.set(clamped);
    });
    // The search field takes focus once the popover is on the page.
    const browser = isPlatformBrowser(inject(PLATFORM_ID));
    effect((onCleanup) => {
      if (!this.open() || !this.searchable() || !browser) return;
      const timer = setTimeout(() => this.search()?.nativeElement.focus(), 0);
      onCleanup(() => clearTimeout(timer));
    });
  }

  /** @internal */
  protected optionId(value: string): string {
    return comboboxOptionId(this.listboxId, value);
  }

  /** @internal */
  protected optionClasses(index: number, option: PixelComboboxOption): string {
    return comboboxOptionClasses(this.effectiveSurface(), {
      highlighted: index === this.highlighted(),
      disabled: !!option.disabled,
    });
  }

  /** @internal */
  protected onOpenChange(open: boolean): void {
    if (!this.isDisabled()) this.open.set(open);
  }

  /** @internal */
  protected commit(option: PixelComboboxOption): void {
    if (option.disabled) return;
    this.value.set(option.value);
    this.form.changed(option.value);
    this.open.set(false);
  }

  /** @internal Shared by the trigger, the search field and the listbox. */
  protected onKeydown(event: KeyboardEvent): void {
    const action = comboboxKeydown(event.key, {
      open: this.open(),
      highlighted: this.highlighted(),
      count: this.list().items.length,
    });
    if (!action) return;
    event.preventDefault();
    if (action.kind === 'open') this.onOpenChange(true);
    else if (action.kind === 'highlight') this.highlighted.set(action.index);
    else if (action.kind === 'select') this.commit(this.list().items[action.index]!);
  }

  /** @internal */
  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.highlighted.set(0);
  }

  /** @internal ControlValueAccessor */
  writeValue(value: unknown): void {
    this.value.set(value == null ? undefined : String(value));
  }

  /** @internal ControlValueAccessor */
  registerOnChange(fn: (value: string) => void): void {
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
