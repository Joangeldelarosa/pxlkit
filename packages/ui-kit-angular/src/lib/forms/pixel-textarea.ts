import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  input,
  model,
  viewChild,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import {
  autosizeTextarea,
  characterCountClasses,
  characterCountText,
  fieldDescribedBy,
  fieldMessageId,
  getStringLength,
  showCountMax,
  textareaClasses,
  type ShowCount,
  type Surface,
  type Tone,
} from '@pxlkit/ui-kit-core';
import { booleanOr, numberOr, optionalNumber, withDefault } from '../_internal/coercion';
import { PixelFieldShell } from '../_internal/field-shell';
import { injectId } from '../_internal/ids';
import { FormBridge, provideValueAccessor } from '../_internal/value-accessor';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { showCountAttribute } from './_internal/show-count';

/**
 * Multi-line text field with label, hint and error, tones and surfaces, an
 * optional auto-grow between `minRows` and `maxRows`, and a character
 * counter. Bind its value with `[(value)]`, use it as a form control
 * (`ngModel`, `formControlName`), or leave it uncontrolled with
 * `defaultValue`.
 *
 * The host is layout-neutral (`display: contents`); the native attributes it
 * takes as inputs (`name`, `placeholder`, `rows`, …) go to the inner
 * `<textarea>`, whose events bubble through the host.
 *
 * @example
 * <pxl-textarea label="Bio" autosize [minRows]="2" [maxRows]="8" [(value)]="bio" />
 */
@Component({
  selector: 'pxl-textarea',
  imports: [PixelFieldShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideValueAccessor(() => PixelTextarea)],
  host: {
    '[style.display]': '"contents"',
    // These inputs describe the inner textarea; as attributes on the host
    // they would duplicate the id, name the wrong element or mislead form
    // tooling.
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
      [htmlFor]="textareaId()"
      [messageId]="messageId()"
    >
      <textarea
        #textarea
        [id]="textareaId()"
        [attr.name]="name() ?? null"
        [attr.placeholder]="placeholder() ?? null"
        [attr.rows]="rows() ?? (autosize() ? minRows() : null)"
        [attr.minlength]="minlength() ?? null"
        [attr.maxlength]="maxlength() ?? max() ?? null"
        [attr.aria-label]="ariaLabel() ?? null"
        [attr.aria-invalid]="error() ? true : null"
        [attr.aria-describedby]="describedBy() ?? null"
        [required]="required()"
        [readOnly]="readonly()"
        [disabled]="isDisabled()"
        [value]="current()"
        [class]="classes()"
        (input)="onInput($event)"
        (blur)="form.touched()"
      ></textarea>
      @if (showCount()) {
        <span aria-live="polite" [class]="countClasses()">{{ countText() }}</span>
      }
    </pxl-field-shell>
  `,
})
export class PixelTextarea implements ControlValueAccessor {
  /** Value (`[(value)]`); leave unset for an uncontrolled textarea. */
  readonly value = model<string | undefined>(undefined);
  /** Initial value while uncontrolled. */
  readonly defaultValue = input<string>();
  /** Label rendered above the textarea. */
  readonly label = input<string>();
  /** Helper text below the field; hidden while `error` is set. */
  readonly hint = input<string>();
  /** Error message below the field; marks the textarea invalid. */
  readonly error = input<string>();
  /** Tone of the focus ring. */
  readonly tone = input<Tone, Tone | undefined>('neutral', { transform: withDefault<Tone>('neutral') });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Grows with the content, between `minRows` and `maxRows` lines. */
  readonly autosize = input(false, { transform: booleanOr(false) });
  /** Lines shown at least while `autosize` is on. */
  readonly minRows = input(3, { transform: numberOr(3) });
  /** Lines shown at most while `autosize` is on; it scrolls past them. */
  readonly maxRows = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Character counter under the textarea: `true` shows `N`, `{ max }` shows `N/max` and caps the length. */
  readonly showCount = input<ShowCount, ShowCount | '' | undefined>(false, { transform: showCountAttribute });
  /** Disables the textarea. */
  readonly disabled = input(false, { transform: booleanOr(false) });
  /** `id` of the textarea; generated when left out. */
  readonly id = input<string>();
  /** Native `name` of the textarea. */
  readonly name = input<string>();
  /** Native `placeholder`. */
  readonly placeholder = input<string>();
  /** Native `rows`; `minRows` while `autosize` is on and this is left out. */
  readonly rows = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Native `minlength`. */
  readonly minlength = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Native `maxlength`; defaults to the `showCount` limit. */
  readonly maxlength = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Marks the textarea required. */
  readonly required = input(false, { transform: booleanOr(false) });
  /** Makes the textarea read-only. */
  readonly readonly = input(false, { transform: booleanOr(false) });
  /** Accessible name of the textarea when no `label` is shown. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  /** Ids of more elements that describe the textarea; its hint / error is added while one shows. */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /** @internal */
  protected readonly form = new FormBridge<string>();
  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly generatedId = injectId();
  private readonly textarea = viewChild.required<ElementRef<HTMLTextAreaElement>>('textarea');

  /** @internal */
  protected readonly textareaId = computed(() => this.id() ?? this.generatedId);
  /** @internal */
  protected readonly messageId = computed(() => fieldMessageId(this.textareaId()));
  /** @internal */
  protected readonly describedBy = computed(() =>
    fieldDescribedBy(this.textareaId(), { hint: this.hint(), error: this.error() }, this.ariaDescribedby()),
  );
  /** @internal */
  protected readonly current = computed(() => this.value() ?? this.defaultValue() ?? '');
  /** @internal */
  protected readonly isDisabled = computed(() => this.disabled() || this.form.disabled());
  private readonly length = computed(() => getStringLength(this.current()));
  /** @internal */
  protected readonly max = computed(() => showCountMax(this.showCount()));
  /** @internal */
  protected readonly classes = computed(() =>
    textareaClasses(this.effectiveSurface(), { tone: this.tone(), invalid: !!this.error(), autosize: this.autosize() }),
  );
  /** @internal */
  protected readonly countClasses = computed(() =>
    characterCountClasses(this.effectiveSurface(), this.length(), this.max()),
  );
  /** @internal */
  protected readonly countText = computed(() => characterCountText(this.length(), this.max()));

  constructor() {
    // Fit the height once rendered, and again whenever the value or the row
    // limits change.
    afterRenderEffect(() => {
      this.current();
      if (this.autosize()) autosizeTextarea(this.textarea().nativeElement, this.minRows(), this.maxRows());
    });
  }

  /** @internal */
  protected onInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.value.set(value);
    this.form.changed(value);
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
