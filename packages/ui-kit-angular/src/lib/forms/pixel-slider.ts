import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import {
  isSliderRange,
  moveSliderThumb,
  nearestSliderThumb,
  sliderClasses,
  sliderFill,
  sliderKeyValue,
  sliderPercent,
  sliderThumbLabel,
  sliderThumbLeft,
  sliderThumbValues,
  sliderTicks,
  sliderTooltipVisible,
  sliderValueAt,
  sliderValueText,
  type SliderThumb,
  type SliderTooltipMode,
  type SliderValue,
  type Surface,
  type Tone,
} from '@pxlkit/ui-kit-core';
import { booleanOr, numberOr, withDefault } from '../_internal/coercion';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { FormBridge, provideValueAccessor } from '../_internal/value-accessor';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/** A labelled mark on the track. */
export interface PixelSliderMark {
  /** Value the mark sits at. */
  value: number;
  /** Its label: text or an `<ng-template>`. */
  label: PxlContent;
}

/**
 * Slider with one thumb, or two bounding a range when its value is a
 * `[low, high]` pair — the lower thumb never passes the upper one. Drag the
 * thumbs or use the arrows (one step), PageUp / PageDown (ten steps), Home
 * and End. Optional marks, a tick per step and the values above the thumbs.
 * Bind the value with `[(value)]`, or use it as a form control (`ngModel`,
 * `formControlName`); with a `name` hidden inputs submit it (`name[0]` and
 * `name[1]` for a range). The host is the slider's root.
 *
 * @example
 * <pxl-slider label="Volume" [(value)]="volume" />
 * <pxl-slider label="Price" [(value)]="price" showTooltip="always" />
 */
@Component({
  selector: 'pxl-slider',
  imports: [PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-slider { display: block; } }',
  providers: [provideValueAccessor(() => PixelSlider)],
  host: {
    '[class]': 'classes().root',
    // These inputs describe the thumb and the hidden inputs; as attributes on
    // the host they would duplicate the id or mislead form tooling.
    '[attr.id]': 'null',
    '[attr.name]': 'null',
    '[attr.disabled]': 'null',
    '[attr.required]': 'null',
  },
  template: `
    @if (name(); as name) {
      @if (range()) {
        <input type="hidden" [attr.name]="name + '[0]'" [value]="thumbValues()[0]" [required]="required()" />
        <input type="hidden" [attr.name]="name + '[1]'" [value]="thumbValues()[1]" [required]="required()" />
      } @else {
        <input type="hidden" [attr.name]="name" [value]="thumbValues()[0]" [required]="required()" />
      }
    }
    <div [class]="classes().header">
      <span>{{ label() }}</span>
      <span [class]="classes().value">{{ valueText() }}</span>
    </div>
    <div
      #track
      [attr.role]="range() ? 'group' : null"
      [attr.aria-label]="range() ? label() : null"
      [class]="classes().track"
      (pointerdown)="onPointerDown($event)"
      (pointermove)="onPointerMove($event)"
      (pointerup)="onPointerUp()"
      (pointercancel)="onPointerUp()"
    >
      <div [class]="classes().fill" [style.left.%]="fill().left" [style.width.%]="fill().width" style="opacity: 0.8"></div>
      @for (thumb of thumbs(); track thumb) {
        <div
          role="slider"
          [attr.id]="thumb === 0 ? (id() ?? null) : null"
          [attr.tabindex]="isDisabled() ? -1 : 0"
          [attr.aria-valuemin]="min()"
          [attr.aria-valuemax]="max()"
          [attr.aria-valuenow]="thumbValues()[thumb]"
          [attr.aria-label]="thumbLabel(thumb)"
          [attr.aria-disabled]="isDisabled()"
          [attr.aria-required]="range() ? null : required() || null"
          [class]="classes().thumb"
          [style.left]="thumbLeft(thumb)"
          (keydown)="onKeydown(thumb, $event)"
          (focus)="active.set(thumb)"
          (blur)="onBlur(thumb)"
        >
          @if (tooltipVisible(thumb)) {
            <span role="tooltip" [class]="classes().tooltip">{{ thumbValues()[thumb] }}</span>
          }
        </div>
      }
    </div>
    @if (tickValues().length > 0) {
      <div [class]="classes().ticks" aria-hidden="true">
        @for (tick of tickValues(); track $index) {
          <span data-testid="pxl-slider-tick" [class]="classes().tick" [style.left.%]="percent(tick)"></span>
        }
      </div>
    }
    @if (marks()?.length) {
      <div [class]="classes().marks" data-testid="pxl-slider-marks">
        @for (mark of marks(); track $index) {
          <span [class]="classes().mark" [style.left.%]="percent(mark.value)">
            <ng-container *pxlOutlet="mark.label; let text">{{ text }}</ng-container>
          </span>
        }
      </div>
    }
    @if (showMinMax()) {
      <div [class]="classes().bounds">
        <span>{{ min() }}</span>
        <span>{{ max() }}</span>
      </div>
    }
  `,
})
export class PixelSlider implements ControlValueAccessor {
  /** Label above the track; also names the thumbs. */
  readonly label = input.required<string>();
  /** Value (`[(value)]`): a number, or a `[low, high]` pair for a range; `min` while unset. */
  readonly value = model<SliderValue | undefined>(undefined);
  /** Lowest value. */
  readonly min = input(0, { transform: numberOr(0) });
  /** Highest value. */
  readonly max = input(100, { transform: numberOr(100) });
  /** Values snap to multiples of the step. */
  readonly step = input(1, { transform: numberOr(1) });
  /** Disables dragging and the keys and greys out the track. */
  readonly disabled = input(false, { transform: booleanOr(false) });
  /** Tone of the fill and thumbs. */
  readonly tone = input<Tone, Tone | undefined>('cyan', { transform: withDefault<Tone>('cyan') });
  /** Shows `min` and `max` under the track. */
  readonly showMinMax = input(false, { transform: booleanOr(false) });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Form field name of the hidden inputs. */
  readonly name = input<string>();
  /** Marks the field as required for native form validation. */
  readonly required = input(false, { transform: booleanOr(false) });
  /** `id` of the single (or lower) thumb. */
  readonly id = input<string>();
  /** Labelled marks under the track. */
  readonly marks = input<PixelSliderMark[]>();
  /** When a thumb shows its value: `always`, while dragged or focused (`drag`), or `never`. */
  readonly showTooltip = input<SliderTooltipMode, SliderTooltipMode | undefined>('never', {
    transform: withDefault<SliderTooltipMode>('never'),
  });
  /** Draws a tick under the track for every step. */
  readonly ticks = input(false, { transform: booleanOr(false) });

  /** @internal */
  protected readonly form = new FormBridge<SliderValue>();
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly track = viewChild.required<ElementRef<HTMLDivElement>>('track');

  /** @internal */
  protected readonly isDisabled = computed(() => this.disabled() || this.form.disabled());
  /** @internal */
  protected readonly current = computed(() => this.value() ?? this.min());
  /** @internal */
  protected readonly range = computed(() => isSliderRange(this.current()));
  /** @internal */
  protected readonly thumbValues = computed(() => sliderThumbValues(this.current()));
  /** @internal */
  protected readonly thumbs = computed<SliderThumb[]>(() => (this.range() ? [0, 1] : [0]));
  /** @internal */
  protected readonly valueText = computed(() => sliderValueText(this.current()));
  /** @internal */
  protected readonly fill = computed(() => sliderFill(this.current(), this.min(), this.max()));
  /** @internal */
  protected readonly tickValues = computed(() => (this.ticks() ? sliderTicks(this.bounds()) : []));
  /** @internal */
  protected readonly classes = computed(() =>
    sliderClasses(this.effectiveSurface(), { tone: this.tone(), disabled: this.isDisabled() }),
  );
  /** @internal The thumb dragged or focused, which shows a `drag` tooltip. */
  protected readonly active = signal<SliderThumb | null>(null);
  private readonly bounds = computed(() => ({ min: this.min(), max: this.max(), step: this.step() }));
  private dragging: SliderThumb | null = null;

  /** @internal */
  protected percent(value: number): number {
    return sliderPercent(value, this.min(), this.max());
  }

  /** @internal */
  protected thumbLabel(thumb: SliderThumb): string {
    return sliderThumbLabel(this.label(), this.range(), thumb);
  }

  /** @internal */
  protected thumbLeft(thumb: SliderThumb): string {
    return sliderThumbLeft(this.percent(this.thumbValues()[thumb]));
  }

  /** @internal */
  protected tooltipVisible(thumb: SliderThumb): boolean {
    return sliderTooltipVisible(this.showTooltip(), this.active(), thumb);
  }

  /** @internal */
  protected onPointerDown(event: PointerEvent): void {
    if (this.isDisabled()) return;
    event.preventDefault();
    const thumb = this.range() ? nearestSliderThumb(this.current(), this.valueAt(event.clientX)) : 0;
    this.dragging = thumb;
    this.active.set(thumb);
    // Captured, the track keeps getting the moves when the pointer leaves it.
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.moveThumb(thumb, this.valueAt(event.clientX));
  }

  /** @internal */
  protected onPointerMove(event: PointerEvent): void {
    if (this.dragging === null || this.isDisabled()) return;
    this.moveThumb(this.dragging, this.valueAt(event.clientX));
  }

  /** @internal */
  protected onPointerUp(): void {
    this.dragging = null;
    this.active.set(null);
  }

  /** @internal */
  protected onKeydown(thumb: SliderThumb, event: KeyboardEvent): void {
    if (this.isDisabled()) return;
    const next = sliderKeyValue(event.key, this.thumbValues()[thumb], this.bounds());
    if (next === undefined) return;
    event.preventDefault();
    this.moveThumb(thumb, next);
  }

  /** @internal */
  protected onBlur(thumb: SliderThumb): void {
    if (this.active() === thumb) this.active.set(null);
    this.form.touched();
  }

  private valueAt(clientX: number): number {
    return sliderValueAt(clientX, this.track().nativeElement.getBoundingClientRect(), this.min(), this.max());
  }

  private moveThumb(thumb: SliderThumb, next: number): void {
    const value = moveSliderThumb(this.current(), thumb, next, this.bounds());
    this.value.set(value);
    this.form.changed(value);
  }

  /** @internal ControlValueAccessor */
  writeValue(value: unknown): void {
    this.value.set(typeof value === 'number' || isPair(value) ? value : undefined);
  }

  /** @internal ControlValueAccessor */
  registerOnChange(fn: (value: SliderValue) => void): void {
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

function isPair(value: unknown): value is [number, number] {
  return Array.isArray(value) && value.length === 2 && value.every((bound) => typeof bound === 'number');
}
