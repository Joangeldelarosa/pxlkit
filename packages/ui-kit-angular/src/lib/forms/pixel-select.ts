import { ChangeDetectionStrategy, Component, ElementRef, computed, input, model, signal, viewChild } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import {
  fieldDescribedBy,
  fieldMessageId,
  selectClasses,
  selectKeydown,
  selectListboxId,
  selectOptionClasses,
  selectOptionId,
  type Size,
  type Surface,
  type Tone,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { PixelFieldShell } from '../_internal/field-shell';
import { injectId } from '../_internal/ids';
import { PxlOutlet } from '../_internal/outlet';
import { PixelGlyph } from '../_internal/pixel-glyph';
import { FormBridge, provideValueAccessor } from '../_internal/value-accessor';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { injectClickOutside } from '../utilities/dom';
import type { Option } from './option';

/**
 * Custom single-value dropdown: a `role="combobox"` trigger over a listbox,
 * with ArrowUp / ArrowDown, Home / End, Enter / Space, Escape and Tab, and a
 * press outside to close. Bind the value with `[(value)]`, use it as a form
 * control (`ngModel`, `formControlName`), or leave it uncontrolled with
 * `defaultValue`. With a `name` a hidden input submits the value in native
 * forms. An option's `icon` (text or an `<ng-template>`) shows before its
 * label.
 *
 * The host is layout-neutral (`display: contents`).
 *
 * @example
 * <pxl-select label="Fruit" [options]="fruits" placeholder="Pick a fruit" [(value)]="fruit" />
 */
@Component({
  selector: 'pxl-select',
  imports: [PixelFieldShell, PixelGlyph, PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideValueAccessor(() => PixelSelect)],
  host: {
    '[style.display]': '"contents"',
    // These inputs describe the trigger and the hidden input; as attributes
    // on the host they would duplicate the id, describe the wrong element or
    // mislead form tooling.
    '[attr.id]': 'null',
    '[attr.name]': 'null',
    '[attr.value]': 'null',
    '[attr.disabled]': 'null',
    '[attr.required]': 'null',
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
      <div #container [class]="classes().container">
        @if (name()) {
          <input type="hidden" [attr.name]="name()" [value]="current()" [required]="required()" />
        }
        <button
          [id]="triggerId()"
          type="button"
          role="combobox"
          [attr.aria-expanded]="open()"
          aria-haspopup="listbox"
          [attr.aria-controls]="open() ? listboxId() : null"
          [attr.aria-activedescendant]="activeOptionId() ?? null"
          [attr.aria-disabled]="isDisabled()"
          [attr.aria-required]="required() || null"
          [attr.aria-invalid]="error() ? true : null"
          [attr.aria-describedby]="describedBy() ?? null"
          [disabled]="isDisabled()"
          [class]="classes().trigger"
          (click)="toggle()"
          (keydown)="onKeydown($event)"
          (blur)="form.touched()"
        >
          <span [class]="classes().triggerContent">
            @if (selected()?.icon; as icon) {
              <span [class]="classes().icon"><ng-container *pxlOutlet="icon; let text">{{ text }}</ng-container></span>
            }
            <span [class]="classes().value">{{ selected()?.label ?? placeholder() }}</span>
          </span>
          <svg pxlGlyph="chevronDown" [class]="classes().chevron"></svg>
        </button>
        @if (open()) {
          <div [id]="listboxId()" role="listbox" [class]="classes().listbox">
            @for (item of items(); track item.option.value; let index = $index) {
              <button
                [id]="item.id"
                type="button"
                role="option"
                [attr.aria-selected]="item.selected"
                [class]="item.class"
                (mouseenter)="highlighted.set(index)"
                (click)="choose(item.option.value)"
              >
                <span [class]="classes().optionContent">
                  @if (item.option.icon; as icon) {
                    <span [class]="classes().icon"><ng-container *pxlOutlet="icon; let text">{{ text }}</ng-container></span>
                  }
                  <span [class]="classes().optionLabel">{{ item.option.label }}</span>
                </span>
                @if (item.selected) {
                  <svg pxlGlyph="check" [class]="classes().check"></svg>
                }
              </button>
            }
          </div>
        }
      </div>
    </pxl-field-shell>
  `,
})
export class PixelSelect implements ControlValueAccessor {
  /** Label rendered above the trigger. */
  readonly label = input<string>();
  /** The options of the listbox. */
  readonly options = input.required<Option[]>();
  /** Selected value (`[(value)]`); leave unset for an uncontrolled select. */
  readonly value = model<string | undefined>(undefined);
  /** Initial value while uncontrolled. */
  readonly defaultValue = input<string>();
  /** Text shown while nothing is selected. */
  readonly placeholder = input<string, string | undefined>('Select...', { transform: withDefault('Select...') });
  /** Helper text below the field; hidden while `error` is set. */
  readonly hint = input<string>();
  /** Error message below the field; marks the trigger invalid. */
  readonly error = input<string>();
  /** Disables the select and greys out the trigger. */
  readonly disabled = input(false, { transform: booleanOr(false) });
  /** Tone of the focus ring and the selected option. */
  readonly tone = input<Tone, Tone | undefined>('neutral', { transform: withDefault<Tone>('neutral') });
  /** Trigger height. */
  readonly size = input<Size, Size | undefined>('md', { transform: withDefault<Size>('md') });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Form field name — a hidden input submits the value. */
  readonly name = input<string>();
  /** Marks the field as required for native form validation. */
  readonly required = input(false, { transform: booleanOr(false) });
  /** `id` of the trigger; generated when left out. */
  readonly id = input<string>();
  /** Ids of more elements that describe the trigger; its hint / error is added while one shows. */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /** @internal */
  protected readonly form = new FormBridge<string>();
  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly generatedId = injectId();
  private readonly container = viewChild<ElementRef<HTMLElement>>('container');
  /** @internal */
  protected readonly open = signal(false);
  /** @internal */
  protected readonly highlighted = signal(-1);

  /** @internal */
  protected readonly triggerId = computed(() => this.id() ?? this.generatedId);
  /** @internal */
  protected readonly messageId = computed(() => fieldMessageId(this.triggerId()));
  /** @internal */
  protected readonly describedBy = computed(() =>
    fieldDescribedBy(this.triggerId(), { hint: this.hint(), error: this.error() }, this.ariaDescribedby()),
  );
  /** @internal */
  protected readonly current = computed(() => this.value() ?? this.defaultValue() ?? '');
  /** @internal */
  protected readonly isDisabled = computed(() => this.disabled() || this.form.disabled());
  /** @internal */
  protected readonly selected = computed(() => this.options().find((option) => option.value === this.current()));
  /** @internal */
  protected readonly classes = computed(() =>
    selectClasses(this.effectiveSurface(), {
      tone: this.tone(),
      size: this.size(),
      invalid: !!this.error(),
      disabled: this.isDisabled(),
      open: this.open(),
      hasValue: !!this.selected(),
    }),
  );
  // Focus stays on the trigger: it points at the open listbox and at the
  // highlighted option, so screen readers follow the arrow keys.
  /** @internal */
  protected readonly listboxId = computed(() => selectListboxId(this.triggerId()));
  /** @internal */
  protected readonly activeOptionId = computed(() =>
    this.open() && this.options()[this.highlighted()] ? selectOptionId(this.triggerId(), this.highlighted()) : undefined,
  );
  /** @internal */
  protected readonly items = computed(() =>
    this.options().map((option, index) => {
      const selected = option.value === this.current();
      return {
        option,
        id: selectOptionId(this.triggerId(), index),
        selected,
        class: selectOptionClasses(this.effectiveSurface(), {
          tone: this.tone(),
          selected,
          highlighted: index === this.highlighted(),
        }),
      };
    }),
  );

  constructor() {
    injectClickOutside(
      () => this.container()?.nativeElement,
      () => this.open.set(false),
    );
  }

  /** @internal */
  protected toggle(): void {
    if (!this.isDisabled()) this.open.set(!this.open());
  }

  /** @internal */
  protected choose(value: string): void {
    this.value.set(value);
    this.form.changed(value);
    this.open.set(false);
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) return;
    const options = this.options();
    const next = selectKeydown(event.key, { open: this.open(), highlighted: this.highlighted() }, options.length);
    if (!next) return;
    // Tab keeps its default, so focus moves on as the listbox closes.
    if (next.preventDefault) event.preventDefault();
    if (next.select !== undefined) {
      this.choose(options[next.select]!.value);
      return;
    }
    this.open.set(next.open);
    this.highlighted.set(next.highlighted);
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
