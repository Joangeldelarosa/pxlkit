import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, computed, input, viewChild } from '@angular/core';
import {
  stepAriaLabel,
  stepClasses,
  stepConnectorClasses,
  stepConnectorCompleted,
  stepHiddenText,
  stepIndicator,
  stepSpinner,
  stepState,
  stepperKeyAction,
  stepperSlotClasses,
} from '@pxlkit/ui-kit-core';
import { booleanOr } from '../_internal/coercion';
import { injectId } from '../_internal/ids';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { PixelGlyph } from '../_internal/pixel-glyph';
import { injectStepperContext, type StepperStepEntry } from './stepper-context';

/**
 * One step of a `<pxl-stepper>`: an indicator (its number, a check mark once
 * completed, a cross on error, a custom `icon`, or a spinner while loading)
 * and its label. A clickable step is a button named by its position, label
 * and state and described by its description; any other step reads them as
 * visually hidden text. It also draws the connector to the next step. The
 * host is layout-neutral (`display: contents`).
 *
 * @example
 * <pxl-stepper-step label="Account" description="Create your account" completed />
 */
@Component({
  selector: 'pxl-stepper-step',
  imports: [NgTemplateOutlet, PxlOutlet, PixelGlyph],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.display]': '"contents"' },
  template: `
    @if (vertical()) {
      <div [class]="slotClasses">
        <ng-container [ngTemplateOutlet]="step" />
        @if (!last()) {
          <span
            aria-hidden="true"
            data-pxl-step-connector="true"
            data-pxl-step-connector-orientation="vertical"
            [class]="connectorClasses()"
          ></span>
        }
      </div>
    } @else {
      <ng-container [ngTemplateOutlet]="step" />
      @if (!last()) {
        <hr
          aria-hidden="true"
          data-pxl-step-connector="true"
          data-pxl-step-connector-orientation="horizontal"
          [class]="connectorClasses()"
        />
      }
    }
    <ng-template #step>
      <div
        #element
        data-pxl-step="true"
        [attr.data-pxl-step-index]="index()"
        [attr.data-pxl-step-state]="state()"
        [attr.role]="clickable() ? 'button' : null"
        [attr.aria-current]="index() === context.active() ? 'step' : null"
        [attr.aria-label]="clickable() ? ariaLabel() : null"
        [attr.aria-describedby]="clickable() && description() ? descriptionId : null"
        [attr.tabindex]="clickable() ? 0 : null"
        [class]="classes().root"
        (click)="onClick()"
        (keydown)="onKeydown($event)"
      >
        <span aria-hidden="true" data-pxl-step-indicator="true" [class]="classes().indicator">
          @switch (indicator()) {
            @case ('loading') {
              <svg
                [class]="classes().spinner"
                [attr.viewBox]="spinner.viewBox"
                fill="none"
                shape-rendering="crispEdges"
                aria-hidden="true"
                data-pxl-step-icon="loading"
              >
                @for (rect of spinner.rects; track $index) {
                  <svg:rect
                    [attr.x]="rect[0]"
                    [attr.y]="rect[1]"
                    [attr.width]="rect[2]"
                    [attr.height]="rect[3]"
                    fill="currentColor"
                    [attr.opacity]="rect[4]"
                  />
                }
              </svg>
            }
            @case ('check') {
              <span data-pxl-step-icon="check" [class]="classes().icon"><svg pxlGlyph="check"></svg></span>
            }
            @case ('error') {
              <span data-pxl-step-icon="error" [class]="classes().icon"><svg pxlGlyph="close"></svg></span>
            }
            @case ('custom') {
              <span data-pxl-step-icon="custom" [class]="classes().icon" aria-hidden="true">
                <ng-container *pxlOutlet="icon(); let text">{{ text }}</ng-container>
              </span>
            }
            @default {
              <span [class]="classes().number">{{ index() + 1 }}</span>
            }
          }
        </span>
        <div [class]="classes().body">
          @if (!clickable()) {
            <span [class]="classes().hidden">{{ hidden().before }}</span>
          }
          <span data-pxl-step-label="true" [class]="classes().label">{{ label() }}</span>
          @if (!clickable() && hidden().after) {
            <span [class]="classes().hidden">{{ hidden().after }}</span>
          }
          @if (description()) {
            <span
              [attr.id]="clickable() ? descriptionId : null"
              data-pxl-step-description="true"
              [class]="classes().description"
            >{{ description() }}</span>
          }
        </div>
      </div>
    </ng-template>
  `,
})
export class PixelStepperStep implements StepperStepEntry {
  /** Label under (or beside) the indicator. */
  readonly label = input.required<string>();
  /** Smaller text below the label. */
  readonly description = input<string>();
  /** Custom icon in the indicator, shown while the step is neither completed nor in error. */
  readonly icon = input<PxlContent>();
  /** Shows a spinner in the indicator. */
  readonly loading = input(false, { transform: booleanOr(false) });
  /** Marks the step done, with a check mark. */
  readonly completed = input(false, { transform: booleanOr(false) });
  /** Marks the step failed, with a cross; wins over `completed`. */
  readonly error = input(false, { transform: booleanOr(false) });

  /** @internal */
  protected readonly context = injectStepperContext();
  private readonly element = viewChild<ElementRef<HTMLElement>>('element');
  /** @internal */
  protected readonly index = computed(() => this.context.steps().indexOf(this));
  /** @internal The last step has no connector after it. */
  protected readonly last = computed(() => this.index() === this.context.steps().length - 1);
  /** @internal */
  protected readonly vertical = computed(() => this.context.orientation() === 'vertical');
  /** @internal */
  protected readonly state = computed(() =>
    stepState(this.index(), this.context.active(), { completed: this.completed(), error: this.error() }),
  );
  /** @internal */
  protected readonly clickable = computed(() => this.context.isClickable(this.index()));
  /** @internal */
  protected readonly indicator = computed(() => stepIndicator(this.state(), { loading: this.loading(), icon: !!this.icon() }));
  /** @internal */
  protected readonly ariaLabel = computed(() =>
    stepAriaLabel(this.index(), this.context.steps().length, this.label(), this.state()),
  );
  /** @internal */
  protected readonly hidden = computed(() => stepHiddenText(this.index(), this.context.steps().length, this.state()));
  /** @internal */
  protected readonly descriptionId = injectId();
  /** @internal */
  protected readonly classes = computed(() =>
    stepClasses(this.context.surface(), {
      orientation: this.context.orientation(),
      size: this.context.size(),
      state: this.state(),
      clickable: this.clickable(),
    }),
  );
  /** @internal */
  protected readonly connectorClasses = computed(() =>
    stepConnectorClasses(
      this.context.orientation(),
      this.context.size(),
      stepConnectorCompleted(this.index(), this.context.active()),
    ),
  );
  /** @internal */
  protected readonly slotClasses = stepperSlotClasses;
  /** @internal */
  protected readonly spinner = stepSpinner;

  /** @internal Focuses the step element (keyboard moves between steps). */
  focus(): void {
    this.element()?.nativeElement.focus();
  }

  /** @internal */
  protected onClick(): void {
    if (this.clickable()) this.context.select(this.index());
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    const action = stepperKeyAction(event.key, this.context.orientation());
    if (action === undefined) return;
    if (action === 'select') {
      if (!this.clickable()) return;
      event.preventDefault();
      this.context.select(this.index());
      return;
    }
    event.preventDefault();
    this.context.moveFocus(this.index(), action);
  }
}
