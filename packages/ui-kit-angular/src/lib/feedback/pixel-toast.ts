import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  output,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  TOAST_DISMISS_LABEL,
  createToastCountdown,
  holdToastCountdown,
  resetToastCountdown,
  startToastCountdown,
  toastClasses,
  toastCountdownDelay,
  toastCountdownStyle,
  toastDuration,
  toastLeading,
  toastTone,
  type Surface,
  type ToastCountdown,
  type ToastHolds,
} from '@pxlkit/ui-kit-core';
import { PxlOutlet } from '../_internal/outlet';
import { PixelGlyph } from '../_internal/pixel-glyph';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { injectEventListener } from '../utilities/dom';
import type { ToastItem } from './toast-context';

/**
 * One toast card: title in the tone colour, optional message, leading icon
 * (a spinner while loading) and action, a dismiss button and the countdown
 * bar of its auto-dismiss, which holds still while the card is hovered or
 * focused, the page is hidden or the window is in the background. The card
 * is no live region: `<pxl-toast-provider>` announces its toasts. Usually
 * rendered by `<pxl-toast-provider>` through `injectToast()`; use it
 * directly for custom rendering. The host is the card.
 *
 * Its tag is `pxl-toast-card`: `<pxl-toast>` is the icon toast of
 * `@pxlkit/angular`, which applications often use alongside the kit.
 *
 * @example
 * <pxl-toast-card [toast]="{ id: 'saved', title: 'Saved', tone: 'green' }" (dismiss)="saved.set(false)" />
 */
@Component({
  selector: 'pxl-toast-card',
  imports: [PxlOutlet, PixelGlyph],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-toast-card { display: block; } }',
  host: {
    'data-pxl-toast': 'true',
    '[attr.data-tone]': 'tone()',
    '[attr.data-loading]': 'toast().loading ? "true" : "false"',
    '[class]': 'classes().root',
    '(mouseenter)': 'hold({ hover: true })',
    '(mouseleave)': 'onMouseleave()',
    '(focusin)': 'hold({ focus: true })',
    '(focusout)': 'onFocusout($event)',
  },
  template: `
    <div [class]="classes().row">
      @if (effectiveSurface() === 'pixel') {
        <span aria-hidden="true" [class]="classes().stripe"></span>
      }
      @if (leading(); as leading) {
        <span data-pxl-toast-leading="true" [class]="classes().leading" aria-hidden="true">
          @if (leading.kind === 'spinner') {
            <span role="presentation" aria-hidden="true" [class]="classes().spinner"></span>
          } @else {
            <ng-container *pxlOutlet="leading.node; let text">{{ text }}</ng-container>
          }
        </span>
      }
      <div [class]="classes().body">
        <p [class]="classes().title">{{ toast().title }}</p>
        @if (toast().message) {
          <p [class]="classes().message">{{ toast().message }}</p>
        }
        @if (toast().action) {
          <div [class]="classes().action"><ng-container *pxlOutlet="toast().action; let text">{{ text }}</ng-container></div>
        }
      </div>
      <button
        type="button"
        [attr.aria-label]="dismissLabel"
        data-pxl-toast-dismiss="true"
        [class]="classes().dismiss"
        (click)="dismiss.emit()"
      >
        <svg pxlGlyph="close"></svg>
      </button>
    </div>
    @if (countdown().duration > 0) {
      <div [class]="classes().track" aria-hidden="true">
        <div
          #bar
          [class]="classes().bar"
          [style.width]="barStyle().width"
          [style.transition-duration]="barStyle().transitionDuration"
        ></div>
      </div>
    }
  `,
})
export class PixelToast {
  /** The toast to show. */
  readonly toast = input.required<ToastItem>();
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** The dismiss button was pressed, or the countdown ran out. */
  readonly dismiss = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly bar = viewChild<ElementRef<HTMLElement>>('bar');

  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  /** @internal */
  protected readonly tone = computed(() => toastTone(this.toast()));
  /** @internal */
  protected readonly classes = computed(() => toastClasses(this.effectiveSurface(), this.tone()));
  /** @internal */
  protected readonly leading = computed(() => toastLeading(this.toast()));
  /** @internal */
  protected readonly dismissLabel = TOAST_DISMISS_LABEL;
  private readonly duration = computed(() => toastDuration(this.toast()));
  /**
   * @internal Counts down afresh when the toast changes its duration (a
   * promise toast settling flips it from 0 to 4500).
   */
  protected readonly countdown = linkedSignal({
    source: this.duration,
    computation: (duration: number, previous?: { value: ToastCountdown }) =>
      previous ? resetToastCountdown(previous.value, duration) : createToastCountdown(duration),
  });
  /** @internal */
  protected readonly barStyle = computed(() => toastCountdownStyle(this.countdown()));

  constructor() {
    // A page nobody looks at — hidden, or in a window in the background —
    // holds the countdown too.
    injectEventListener(
      'visibilitychange',
      () => this.hold({ hidden: this.document.hidden }),
      () => this.document,
    );
    injectEventListener('blur', () => this.hold({ blurred: true }));
    injectEventListener('focus', () => this.hold({ blurred: false }));
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    // The timer runs outside the zone, so a zone.js application stays
    // stable meanwhile; the dismissal is handled inside it.
    const zone = inject(NgZone);
    effect((onCleanup) => {
      const delay = toastCountdownDelay(this.countdown(), Date.now());
      if (delay === null) return;
      const timer = zone.runOutsideAngular(() => setTimeout(() => zone.run(() => this.dismiss.emit()), delay));
      onCleanup(() => clearTimeout(timer));
    });
    // Start once the full bar is on the page: reading its width commits that
    // style first, so the bar shrinks from full rather than starting empty.
    afterRenderEffect(() => {
      if (this.countdown().startedAt !== null) return;
      void this.bar()?.nativeElement.offsetWidth;
      this.countdown.update((current) => startToastCountdown(current, Date.now()));
    });
  }

  // The pointer over the card or focus inside it holds the countdown, until
  // both have left. Focus is re-read when the pointer leaves: a focused
  // element removed from the page takes focus away and need not fire a blur.
  /** @internal */
  protected hold(holds: Partial<ToastHolds>): void {
    this.countdown.update((current) => holdToastCountdown(current, holds, Date.now()));
  }

  /** @internal */
  protected onMouseleave(): void {
    this.hold({ hover: false, focus: this.host.nativeElement.contains(this.document.activeElement) });
  }

  /** @internal */
  protected onFocusout(event: FocusEvent): void {
    if (!this.host.nativeElement.contains(event.relatedTarget as Node | null)) this.hold({ focus: false });
  }
}
