import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  input,
  linkedSignal,
  model,
  signal,
  viewChild,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import {
  DEFAULT_COLOR_PRESETS,
  colorInputClasses,
  colorInputValue,
  colorPresetClasses,
  colorPresetKeydown,
  colorSwatchHex,
  fieldDescribedBy,
  fieldMessageId,
  isColorPresetSelected,
  normalizeHex,
  type ColorFormat,
  type Size,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { withDefault } from '../_internal/coercion';
import { PixelFieldShell } from '../_internal/field-shell';
import { injectId } from '../_internal/ids';
import { FormBridge, provideValueAccessor } from '../_internal/value-accessor';
import { PixelPopover } from '../overlay-foundation/pixel-popover';
import { PixelPopoverContent } from '../overlay-foundation/pixel-popover-content';
import { PixelPopoverTrigger } from '../overlay-foundation/pixel-popover-trigger';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Colour field: a trigger that shows the colour and opens a popover dialog
 * with the browser's colour picker, a hex field and a grid of presets (eight
 * to a row, the arrows, Home / End and Enter / Space move through and pick
 * them). Focus moves into the dialog as it opens. A colour picked or typed in
 * full is written in `format`; a partial hex stays in the field until it is
 * complete. Bind the value with `[(value)]`, use it as a form control
 * (`ngModel`, `formControlName`), or leave it uncontrolled with
 * `defaultValue`; with a `name` a hidden input submits it.
 *
 * The host is layout-neutral (`display: contents`).
 *
 * @example
 * <pxl-color-input label="Brand color" format="rgb" [(value)]="brand" />
 */
@Component({
  selector: 'pxl-color-input',
  imports: [PixelFieldShell, PixelPopover, PixelPopoverTrigger, PixelPopoverContent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideValueAccessor(() => PixelColorInput)],
  host: {
    '[style.display]': '"contents"',
    // These inputs describe the trigger and the hidden input; as attributes
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
      [htmlFor]="inputId()"
      [messageId]="messageId()"
    >
      <span [class]="classes().anchor">
        <pxl-popover
          [(open)]="open"
          side="bottom"
          align="start"
          [sideOffset]="4"
          [surface]="effectiveSurface()"
          haspopup="dialog"
          role="dialog"
        >
          <button
            pxlPopoverTrigger
            type="button"
            [id]="inputId()"
            [attr.aria-label]="label() ?? 'Color'"
            [attr.aria-invalid]="error() ? true : null"
            [attr.aria-describedby]="describedBy() ?? null"
            [disabled]="form.disabled()"
            [class]="classes().trigger"
            (blur)="form.touched()"
          >
            <span aria-hidden="true" [class]="classes().sample" [style.background-color]="swatchHex()"></span>
            <span [class]="classes().value">{{ current() || 'Pick a color' }}</span>
          </button>
          <div *pxlPopoverContent aria-label="Color picker" [class]="classes().content">
            <div [class]="classes().pickers">
              <input
                #native
                type="color"
                aria-label="Native color picker"
                [value]="swatchHex()"
                [class]="classes().native"
                (input)="onNativeInput($event)"
              />
              <label [attr.for]="hexInputId" [class]="classes().hexLabel">Hex</label>
              <input
                [id]="hexInputId"
                type="text"
                aria-label="Hex value"
                placeholder="#000000"
                [value]="draftHex()"
                [class]="classes().hex"
                (input)="onHexInput($event)"
                (blur)="draftHex.set(current())"
              />
            </div>
            <div #swatches role="group" aria-label="Color presets" [class]="classes().presets">
              @for (hex of palette(); track hex; let index = $index) {
                <button
                  type="button"
                  [attr.aria-pressed]="isSelected(hex)"
                  [attr.aria-label]="hex"
                  [attr.tabindex]="focusedSwatch() === index ? 0 : -1"
                  [class]="presetClasses(hex)"
                  [style.background-color]="hex"
                  (click)="onSwatchClick(index)"
                  (focus)="focusedSwatch.set(index)"
                  (keydown)="onSwatchKeydown($event, index)"
                ></button>
              }
            </div>
          </div>
        </pxl-popover>
        @if (name()) {
          <input type="hidden" [attr.name]="name()" [value]="current()" readonly />
        }
      </span>
    </pxl-field-shell>
  `,
})
export class PixelColorInput implements ControlValueAccessor {
  /** The colour (`[(value)]`); leave unset for an uncontrolled input. */
  readonly value = model<string | undefined>(undefined);
  /** Initial colour while uncontrolled. */
  readonly defaultValue = input<string>();
  /** How a picked colour is written: `#rrggbb`, `rgb(r, g, b)` or `hsl(h, s%, l%)`. */
  readonly format = input<ColorFormat, ColorFormat | undefined>('hex', { transform: withDefault<ColorFormat>('hex') });
  /** The preset colours; sixteen greys and hues by default. */
  readonly presets = input<string[]>();
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Trigger height. */
  readonly size = input<Size, Size | undefined>('md', { transform: withDefault<Size>('md') });
  /** Label rendered above the trigger, which it also names. */
  readonly label = input<string>();
  /** Helper text below the field; hidden while `error` is set. */
  readonly hint = input<string>();
  /** Error message below the field; marks the trigger invalid. */
  readonly error = input<string>();
  /** Form field name — a hidden input submits the colour. */
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
  private readonly native = viewChild<ElementRef<HTMLInputElement>>('native');
  private readonly swatches = viewChild<ElementRef<HTMLElement>>('swatches');

  /** @internal */
  protected readonly hexInputId = `${this.generatedId}-hex`;
  /** @internal */
  protected readonly open = signal(false);
  /** @internal Roving tabindex over the presets. */
  protected readonly focusedSwatch = signal(0);

  /** @internal */
  protected readonly current = computed(() => this.value() ?? this.defaultValue() ?? '');
  /**
   * @internal A draft for the hex field, so partial keystrokes do not leak
   * out as values; it follows the value whenever that changes.
   */
  protected readonly draftHex = linkedSignal(() => this.current());
  /** @internal */
  protected readonly inputId = computed(() => this.id() ?? `pxl-color-${this.generatedId}`);
  /** @internal */
  protected readonly messageId = computed(() => fieldMessageId(this.inputId()));
  /** @internal */
  protected readonly describedBy = computed(() =>
    fieldDescribedBy(this.inputId(), { hint: this.hint(), error: this.error() }, this.ariaDescribedby()),
  );
  /** @internal */
  protected readonly palette = computed(() => this.presets() ?? DEFAULT_COLOR_PRESETS);
  /** @internal */
  protected readonly swatchHex = computed(() => colorSwatchHex(this.current()));
  /** @internal */
  protected readonly classes = computed(() =>
    colorInputClasses(this.effectiveSurface(), { size: this.size(), invalid: !!this.error(), hasValue: !!this.current() }),
  );

  constructor() {
    // Focus moves into the dialog as it opens, to its first field.
    afterRenderEffect(() => this.native()?.nativeElement.focus());
  }

  /** @internal */
  protected isSelected(hex: string): boolean {
    return isColorPresetSelected(hex, this.swatchHex());
  }

  /** @internal */
  protected presetClasses(hex: string): string {
    return colorPresetClasses(this.effectiveSurface(), this.isSelected(hex));
  }

  /** @internal */
  protected onNativeInput(event: Event): void {
    this.commit((event.target as HTMLInputElement).value);
  }

  /** @internal Only a complete colour is committed; a partial one stays in the field. */
  protected onHexInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.draftHex.set(raw);
    const hex = normalizeHex(raw);
    if (hex) this.commit(hex);
  }

  /** @internal */
  protected onSwatchClick(index: number): void {
    this.focusedSwatch.set(index);
    this.commit(this.palette()[index]!);
  }

  /** @internal */
  protected onSwatchKeydown(event: KeyboardEvent, index: number): void {
    const palette = this.palette();
    const action = colorPresetKeydown(event.key, index, palette.length);
    if (!action) return;
    event.preventDefault();
    if ('select' in action) {
      this.commit(palette[index]!);
      return;
    }
    this.focusedSwatch.set(action.focus);
    (this.swatches()?.nativeElement.children[action.focus] as HTMLElement | undefined)?.focus();
  }

  private commit(color: string): void {
    const value = colorInputValue(color, this.format());
    this.value.set(value);
    this.form.changed(value);
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

  /** @internal ControlValueAccessor: the trigger is disabled with the form control. */
  setDisabledState(disabled: boolean): void {
    this.form.disabled.set(disabled);
  }
}
