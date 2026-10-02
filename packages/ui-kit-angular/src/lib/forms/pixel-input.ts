import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import {
  characterCountClasses,
  characterCountText,
  fieldDescribedBy,
  fieldMessageId,
  getStringLength,
  inputClasses,
  inputControlClasses,
  showCountMax,
  type ShowCount,
  type Size,
  type Surface,
  type Tone,
} from '@pxlkit/ui-kit-core';
import { booleanOr, optionalNumber, withDefault } from '../_internal/coercion';
import { PixelFieldShell } from '../_internal/field-shell';
import { injectId } from '../_internal/ids';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { PixelGlyph } from '../_internal/pixel-glyph';
import { FormBridge, provideValueAccessor } from '../_internal/value-accessor';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { showCountAttribute } from './_internal/show-count';

/**
 * Single-line text field with label, hint and error, tones, sizes and
 * surfaces, content inside its shell (`prefix` / `suffix`), addons joined to
 * its edges, a clear button, a character counter and a loading state. Bind
 * its value with `[(value)]` — clearing updates it too — use it as a form
 * control (`ngModel`, `formControlName`), or leave it uncontrolled with
 * `defaultValue`.
 *
 * The host is layout-neutral (`display: contents`); the native attributes it
 * takes as inputs (`type`, `name`, `placeholder`, …) go to the inner
 * `<input>`, whose events bubble through the host.
 *
 * @example
 * <pxl-input label="Email" type="email" [(value)]="email" clearable />
 * <pxl-input label="Amount" [prefix]="dollar" formControlName="amount" />
 * <ng-template #dollar><span class="text-xs">$</span></ng-template>
 */
@Component({
  selector: 'pxl-input',
  imports: [NgTemplateOutlet, PixelFieldShell, PixelGlyph, PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideValueAccessor(() => PixelInput)],
  host: {
    '[style.display]': '"contents"',
    // These inputs describe the inner input; as attributes on the host they
    // would duplicate the id, name the wrong element or mislead form tooling.
    '[attr.id]': 'null',
    '[attr.name]': 'null',
    '[attr.value]': 'null',
    '[attr.disabled]': 'null',
    '[attr.required]': 'null',
    '[attr.readonly]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.aria-describedby]': 'null',
  },
  template: `
    <pxl-field-shell
      [label]="label()"
      [hint]="hint()"
      [error]="error()"
      [surface]="effectiveSurface()"
      [htmlFor]="inputId()"
      [messageId]="messageId()"
    >
      @if (addonLeft() || addonRight()) {
        <span [class]="parts().addons">
          @if (addonLeft()) {
            <span [class]="parts().addonLeft"><ng-container *pxlOutlet="addonLeft(); let text">{{ text }}</ng-container></span>
          }
          <ng-container [ngTemplateOutlet]="shell" />
          @if (addonRight()) {
            <span [class]="parts().addonRight"><ng-container *pxlOutlet="addonRight(); let text">{{ text }}</ng-container></span>
          }
        </span>
      } @else {
        <ng-container [ngTemplateOutlet]="shell" />
      }
      @if (showCount()) {
        <span aria-live="polite" [class]="countClasses()">{{ countText() }}</span>
      }
    </pxl-field-shell>

    <ng-template #shell>
      <span [class]="parts().shell">
        @if (leading()) {
          <span [class]="parts().leading"><ng-container *pxlOutlet="leading(); let text">{{ text }}</ng-container></span>
        }
        <input
          [id]="inputId()"
          [attr.type]="type() ?? null"
          [attr.name]="name() ?? null"
          [attr.placeholder]="placeholder() ?? null"
          [attr.autocomplete]="autocomplete() ?? null"
          [attr.pattern]="pattern() ?? null"
          [attr.minlength]="minlength() ?? null"
          [attr.maxlength]="maxlength() ?? max() ?? null"
          [attr.aria-label]="ariaLabel() ?? null"
          [attr.aria-invalid]="error() ? true : null"
          [attr.aria-describedby]="describedBy() ?? null"
          [required]="required()"
          [readOnly]="readonly()"
          [disabled]="isDisabled() || loading()"
          [value]="current()"
          [class]="controlClasses()"
          (input)="onInput($event)"
          (blur)="form.touched()"
        />
        @if (showClear() || trailing()) {
          <span [class]="parts().trailing">
            @if (showClear()) {
              <button
                type="button"
                tabindex="-1"
                aria-label="Clear input"
                [class]="parts().clearButton"
                (click)="onClear()"
              >
                <svg pxlGlyph="close" [class]="parts().clearIcon"></svg>
              </button>
            }
            @if (trailing()) {
              <span [class]="parts().suffix">
                @if (loading()) {
                  <span aria-hidden="true" [class]="parts().spinner"></span>
                } @else {
                  <ng-container *pxlOutlet="suffix(); let text">{{ text }}</ng-container>
                }
              </span>
            }
          </span>
        }
      </span>
    </ng-template>
  `,
})
export class PixelInput implements ControlValueAccessor {
  /** Value (`[(value)]`); leave unset for an uncontrolled input. */
  readonly value = model<string | number | undefined>(undefined);
  /** Initial value while uncontrolled. */
  readonly defaultValue = input<string | number>();
  /** Label rendered above the input shell. */
  readonly label = input<string>();
  /** Helper text below the field; hidden while `error` is set. */
  readonly hint = input<string>();
  /** Error message below the field; marks the input invalid. */
  readonly error = input<string>();
  /** Tone of the focus ring. */
  readonly tone = input<Tone, Tone | undefined>('neutral', { transform: withDefault<Tone>('neutral') });
  /** Field height. */
  readonly size = input<Size, Size | undefined>('md', { transform: withDefault<Size>('md') });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Content inside the shell on the left (icon or short text). */
  readonly prefix = input<PxlContent>();
  /** Legacy alias of `prefix`. */
  readonly icon = input<PxlContent>();
  /** Content inside the shell on the right; replaced by a spinner while `loading`. */
  readonly suffix = input<PxlContent>();
  /** Element outside the shell, joined to its left edge. */
  readonly addonLeft = input<PxlContent>();
  /** Element outside the shell, joined to its right edge. */
  readonly addonRight = input<PxlContent>();
  /** Shows a clear (×) button while the value is not empty. */
  readonly clearable = input(false, { transform: booleanOr(false) });
  /** Character counter under the input: `true` shows `N`, `{ max }` shows `N/max` and caps the length. */
  readonly showCount = input<ShowCount, ShowCount | '' | undefined>(false, { transform: showCountAttribute });
  /** Replaces the suffix with a spinner and disables the input. */
  readonly loading = input(false, { transform: booleanOr(false) });
  /** Disables the input. */
  readonly disabled = input(false, { transform: booleanOr(false) });
  /** `id` of the input; generated when left out. */
  readonly id = input<string>();
  /** Native `name` of the input. */
  readonly name = input<string>();
  /** Native `type` of the input (`text` when left out). */
  readonly type = input<string>();
  /** Native `placeholder`. */
  readonly placeholder = input<string>();
  /** Native `autocomplete` hint. */
  readonly autocomplete = input<string>();
  /** Native `pattern` for validation. */
  readonly pattern = input<string>();
  /** Native `minlength`. */
  readonly minlength = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Native `maxlength`; defaults to the `showCount` limit. */
  readonly maxlength = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Marks the input required. */
  readonly required = input(false, { transform: booleanOr(false) });
  /** Makes the input read-only. */
  readonly readonly = input(false, { transform: booleanOr(false) });
  /** Accessible name of the input when no `label` is shown. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  /** Ids of more elements that describe the input; its hint / error is added while one shows. */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });
  /** The clear button was pressed. */
  readonly clear = output<void>();

  /** @internal */
  protected readonly form = new FormBridge<string>();
  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly generatedId = injectId();

  /** @internal */
  protected readonly inputId = computed(() => this.id() ?? this.generatedId);
  /** @internal */
  protected readonly messageId = computed(() => fieldMessageId(this.inputId()));
  /** @internal */
  protected readonly describedBy = computed(() =>
    fieldDescribedBy(this.inputId(), { hint: this.hint(), error: this.error() }, this.ariaDescribedby()),
  );
  /** @internal */
  protected readonly current = computed(() => String(this.value() ?? this.defaultValue() ?? ''));
  /** @internal */
  protected readonly isDisabled = computed(() => this.disabled() || this.form.disabled());
  private readonly length = computed(() => getStringLength(this.current()));
  /** @internal */
  protected readonly max = computed(() => showCountMax(this.showCount()));
  /** @internal */
  protected readonly showClear = computed(
    () => this.clearable() && this.length() > 0 && !this.isDisabled() && !this.loading(),
  );
  /** @internal */
  protected readonly leading = computed(() => this.prefix() ?? this.icon());
  /** @internal */
  protected readonly trailing = computed(() => this.loading() || !!this.suffix());
  /** @internal */
  protected readonly parts = computed(() => inputClasses(this.effectiveSurface(), this.size()));
  /** @internal */
  protected readonly controlClasses = computed(() =>
    inputControlClasses(this.effectiveSurface(), {
      tone: this.tone(),
      size: this.size(),
      invalid: !!this.error(),
      leading: !!this.leading(),
      trailing: this.trailing(),
      clearButton: this.showClear(),
      addonLeft: !!this.addonLeft(),
      addonRight: !!this.addonRight(),
    }),
  );
  /** @internal */
  protected readonly countClasses = computed(() =>
    characterCountClasses(this.effectiveSurface(), this.length(), this.max()),
  );
  /** @internal */
  protected readonly countText = computed(() => characterCountText(this.length(), this.max()));

  /** @internal */
  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.form.changed(value);
  }

  /** @internal */
  protected onClear(): void {
    this.value.set('');
    this.form.changed('');
    this.clear.emit();
  }

  /** @internal ControlValueAccessor */
  writeValue(value: unknown): void {
    this.value.set(value == null ? '' : String(value));
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
