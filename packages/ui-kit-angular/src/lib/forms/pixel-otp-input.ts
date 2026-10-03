import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  ViewEncapsulation,
  afterRenderEffect,
  computed,
  inject,
  input,
  model,
  output,
  untracked,
  viewChildren,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import {
  isOtpComplete,
  otpCellLabel,
  otpCells,
  otpGroupLabel,
  otpInputClasses,
  otpInputMode,
  otpKeydown,
  otpPattern,
  pasteOtp,
  typeOtpCell,
  type OtpInputVariant,
  type Size,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { booleanOr, numberOr, withDefault } from '../_internal/coercion';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { FormBridge, provideValueAccessor } from '../_internal/value-accessor';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * One-time passcode input: one cell per character, in a group named "One-time
 * passcode". Typing fills a cell and moves on, Backspace empties the cell or
 * goes back to empty the previous one, the arrows, Home and End move between
 * cells, and a paste fills the cells from the one pasted into. The first
 * cell offers the code a phone receives by SMS (`autocomplete="one-time-code"`).
 * Bind the code with `[(value)]`, use it as a form control (`ngModel`,
 * `formControlName`), or leave it uncontrolled with `defaultValue`; with a
 * `name` a hidden input submits it. The host is the group.
 *
 * @example
 * <pxl-otp-input [length]="6" [(value)]="code" (complete)="verify($event)" />
 */
@Component({
  selector: 'pxl-otp-input',
  imports: [PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-otp-input { display: block; } }',
  providers: [provideValueAccessor(() => PixelOTPInput)],
  host: {
    role: 'group',
    '[attr.aria-label]': 'groupLabel',
    '[class]': 'classes().root',
    // These inputs describe the cells and the hidden input; as attributes on
    // the host they would mislead form tooling.
    '[attr.name]': 'null',
    '[attr.disabled]': 'null',
  },
  template: `
    @for (char of cells(); track $index; let i = $index, last = $last) {
      <input
        #cell
        data-pxl-otp-cell="true"
        [attr.data-pxl-otp-index]="i"
        [attr.type]="mask() ? 'password' : 'text'"
        [attr.inputmode]="inputMode()"
        [attr.pattern]="pattern()"
        [attr.autocomplete]="i === 0 ? 'one-time-code' : 'off'"
        maxlength="1"
        [disabled]="isDisabled()"
        [value]="char"
        [attr.aria-label]="cellLabel(i)"
        [class]="classes().cell"
        (input)="onInput(i, $event)"
        (keydown)="onKeydown(i, $event)"
        (paste)="onPaste(i, $event)"
        (focus)="onFocus($event)"
        (blur)="form.touched()"
      />
      @if (separator() && !last) {
        <span aria-hidden="true" [class]="classes().separator">
          <ng-container *pxlOutlet="separator(); let text">{{ text }}</ng-container>
        </span>
      }
    }
    @if (name()) {
      <input type="hidden" [attr.name]="name()" [value]="current()" readonly />
    }
  `,
})
export class PixelOTPInput implements ControlValueAccessor {
  /** Number of cells. */
  readonly length = input(6, { transform: numberOr(6) });
  /** Code (`[(value)]`); leave unset for an uncontrolled input. */
  readonly value = model<string | undefined>(undefined);
  /** Initial code while uncontrolled. */
  readonly defaultValue = input<string>();
  /** Hides the characters, as a password field does. */
  readonly mask = input(false, { transform: booleanOr(false) });
  /** Characters the cells accept: digits (`numeric`), or digits and letters (`alphanumeric`). */
  readonly variant = input<OtpInputVariant>();
  /** @deprecated Use `variant`. */
  readonly type = input<OtpInputVariant>();
  /** Focuses the first cell once rendered. */
  readonly autoFocus = input(false, { transform: booleanOr(false) });
  /** Shown between two cells, hidden from assistive technology: text or an `<ng-template>`. */
  readonly separator = input<PxlContent>();
  /** Cell size. */
  readonly size = input<Size, Size | undefined>('md', { transform: withDefault<Size>('md') });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Form field name — a hidden input submits the code. */
  readonly name = input<string>();
  /** Disables every cell. */
  readonly disabled = input(false, { transform: booleanOr(false) });
  /** The code, each time it comes to fill every cell. */
  readonly complete = output<string>();

  /** @internal */
  protected readonly form = new FormBridge<string>();
  /** @internal */
  protected readonly groupLabel = otpGroupLabel;
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly cellElements = viewChildren<ElementRef<HTMLInputElement>>('cell');
  private readonly zone = inject(NgZone);

  /** @internal */
  protected readonly classes = computed(() => otpInputClasses(this.effectiveSurface(), this.size()));
  /** @internal */
  protected readonly isDisabled = computed(() => this.disabled() || this.form.disabled());
  /** @internal */
  protected readonly current = computed(() => this.value() ?? this.defaultValue() ?? '');
  /** @internal */
  protected readonly cells = computed(() => otpCells(this.current(), this.length()));
  private readonly resolvedVariant = computed<OtpInputVariant>(() => this.variant() ?? this.type() ?? 'numeric');
  /** @internal */
  protected readonly inputMode = computed(() => otpInputMode(this.resolvedVariant()));
  /** @internal */
  protected readonly pattern = computed(() => otpPattern(this.resolvedVariant()));

  constructor() {
    afterRenderEffect(() => {
      if (this.autoFocus()) untracked(() => this.cellElements()[0]?.nativeElement.focus());
    });
    let completed = false;
    afterRenderEffect(() => {
      const value = this.current();
      const full = isOtpComplete(value, this.length());
      if (full && !completed) untracked(() => this.complete.emit(value));
      completed = full;
    });
  }

  /** @internal */
  protected cellLabel(index: number): string {
    return otpCellLabel(index, this.length());
  }

  /** @internal */
  protected onInput(index: number, event: Event): void {
    const cell = event.target as HTMLInputElement;
    const edit = typeOtpCell(this.cells(), index, cell.value, this.resolvedVariant());
    this.setCode(edit.value);
    // The cell shows the code's character even when its binding did not
    // change, as a controlled React input does: a rejected character goes away.
    cell.value = this.cells()[index];
    if (edit.focus !== undefined) this.focusCell(edit.focus);
  }

  /** @internal */
  protected onKeydown(index: number, event: KeyboardEvent): void {
    const edit = otpKeydown(this.cells(), index, event.key);
    if (!edit) return;
    event.preventDefault();
    if (edit.value !== undefined) this.setCode(edit.value);
    if (edit.focus !== undefined) this.focusCell(edit.focus);
  }

  /** @internal */
  protected onPaste(index: number, event: ClipboardEvent): void {
    event.preventDefault();
    const edit = pasteOtp(this.cells(), index, event.clipboardData?.getData?.('text') ?? '', this.resolvedVariant());
    if (!edit) return;
    this.setCode(edit.value);
    // Focus once the cells show the pasted code, a frame later as in React.
    // The frame runs outside the zone: a zone.js application checks nothing
    // for it, only for the focused cell's own listener.
    this.zone.runOutsideAngular(() => requestAnimationFrame(() => this.focusCell(edit.focus)));
  }

  /** @internal */
  protected onFocus(event: FocusEvent): void {
    // The cell's character is selected, so the next key replaces it.
    (event.target as HTMLInputElement).select();
  }

  private setCode(code: string): void {
    this.value.set(code);
    this.form.changed(code);
  }

  private focusCell(index: number): void {
    const cell = this.cellElements()[index]?.nativeElement;
    if (!cell) return;
    cell.focus();
    // A caret at the end, so the next key replaces the character cleanly.
    cell.setSelectionRange(cell.value.length, cell.value.length);
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
