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
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import {
  alertDialogClasses,
  alertDialogLayerClasses,
  overlayBackdropClasses,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { injectId } from '../_internal/ids';
import { PixelPortal } from '../overlay-foundation/pixel-portal';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { injectEscape, injectFocusTrap, injectScrollLock } from '../utilities/dom';
import { injectReducedMotion } from '../utilities/media-query';

/**
 * Modal confirmation dialog (`role="alertdialog"`) for destructive or
 * irreversible actions. Focus starts on Cancel; the dialog traps focus, locks
 * page scrolling and closes on Escape and on the backdrop. An action that
 * returns a promise keeps the dialog open, with a busy action button, until
 * it settles. Bind it with `[(open)]`.
 *
 * The host is layout-neutral (`display: contents`); the dialog renders into
 * `document.body`.
 *
 * @example
 * <pxl-alert-dialog
 *   [(open)]="open"
 *   title="Delete this item?"
 *   destructive
 *   [onAction]="remove"
 *   [onError]="showError"
 * />
 */
@Component({
  selector: 'pxl-alert-dialog',
  imports: [NgTemplateOutlet, PixelPortal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.display]': '"contents"',
    // `title` names the dialog; on the host it would show a native tooltip.
    '[attr.title]': 'null',
  },
  template: `
    @if (open()) {
      <ng-template pxlPortal>
        <div [class]="layerClasses">
          <div aria-hidden="true" data-pxl-overlay-backdrop="" [class]="backdropClasses" (click)="cancel()"></div>
          <div
            #panel
            role="alertdialog"
            aria-modal="true"
            [attr.aria-labelledby]="titleId"
            [attr.aria-describedby]="description() ? descriptionId : null"
            [class]="classes().panel"
          >
            @if (effectiveSurface() === 'pixel') {
              <div [class]="classes().header">
                <span aria-hidden="true" [class]="classes().accent"></span>
                <h2 [id]="titleId" [class]="classes().title">{{ title() }}</h2>
              </div>
              <!-- The pixel window's body holds the description and the buttons. -->
              <div [class]="classes().body">
                <ng-container *ngTemplateOutlet="descriptionBlock" />
                <ng-container *ngTemplateOutlet="actions" />
              </div>
            } @else {
              <div [class]="classes().header">
                <span aria-hidden="true" [class]="classes().accent"></span>
                <div [class]="classes().texts">
                  <h2 [id]="titleId" [class]="classes().title">{{ title() }}</h2>
                  <ng-container *ngTemplateOutlet="descriptionBlock" />
                </div>
              </div>
              <ng-container *ngTemplateOutlet="actions" />
            }
          </div>
        </div>
      </ng-template>
    }
    <ng-template #descriptionBlock>
      @if (description()) {
        <p [id]="descriptionId" [class]="classes().description">{{ description() }}</p>
      }
    </ng-template>
    <ng-template #actions>
      <div [class]="classes().actions">
        <button #cancelButton type="button" [disabled]="pending()" [class]="classes().cancel" (click)="cancel()">
          {{ cancelLabel() }}
        </button>
        <button type="button" [disabled]="pending()" [class]="classes().action" (click)="confirm()">
          @if (pending()) {
            <span aria-hidden="true" [class]="classes().spinner"></span>
          }
          <span>{{ actionLabel() }}</span>
        </button>
      </div>
    </ng-template>
  `,
})
export class PixelAlertDialog {
  /** Whether the dialog is visible (`[(open)]`). */
  readonly open = model.required<boolean>();
  /** Title; it names the dialog. */
  readonly title = input.required<string>();
  /** Text under the title, wired via `aria-describedby`. */
  readonly description = input<string>();
  /** Label of the button that dismisses the dialog. */
  readonly cancelLabel = input<string, string | undefined>('Cancel', { transform: withDefault('Cancel') });
  /** Label of the button that confirms. */
  readonly actionLabel = input<string, string | undefined>('Confirm', { transform: withDefault('Confirm') });
  /**
   * The confirmed action. Its result matters: the dialog closes once it
   * returns, or once the promise it returns resolves — and stays open, busy,
   * until then.
   */
  readonly onAction = input.required<() => void | Promise<void>>();
  /**
   * Receives what the action threw or rejected with; the dialog stays open
   * so you can show the error. Without one a thrown error propagates and a
   * rejection is logged to the console.
   */
  readonly onError = input<(error: unknown) => void>();
  /** Red accent for a destructive action (cyan otherwise). */
  readonly destructive = input(false, { transform: booleanOr(false) });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly reducedMotion = injectReducedMotion();
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly cancelButton = viewChild<ElementRef<HTMLButtonElement>>('cancelButton');

  /** @internal */
  protected readonly titleId = injectId();
  /** @internal */
  protected readonly descriptionId = injectId();
  /** @internal */
  protected readonly pending = signal(false);
  /** @internal */
  protected readonly layerClasses = alertDialogLayerClasses;
  /** @internal */
  protected readonly backdropClasses = overlayBackdropClasses('fixed');
  /** @internal */
  protected readonly classes = computed(() =>
    alertDialogClasses(this.effectiveSurface(), { destructive: this.destructive(), reducedMotion: this.reducedMotion() }),
  );

  constructor() {
    injectScrollLock(() => this.open());
    injectFocusTrap(
      () => this.open(),
      () => this.panel()?.nativeElement,
    );
    injectEscape(
      () => this.cancel(),
      () => this.open(),
    );
    const browser = isPlatformBrowser(inject(PLATFORM_ID));
    effect((onCleanup) => {
      // Closed from outside while an action was pending: start over next time.
      if (!this.open()) {
        this.pending.set(false);
        return;
      }
      if (!browser) return;
      // Cancel holds the initial focus — the safe default for destructive flows.
      const timer = setTimeout(() => this.cancelButton()?.nativeElement.focus(), 0);
      onCleanup(() => clearTimeout(timer));
    });
  }

  /** @internal */
  protected cancel(): void {
    if (!this.pending()) this.open.set(false);
  }

  /** @internal */
  protected confirm(): void {
    if (this.pending()) return;
    const onError = this.onError();
    let result: void | Promise<void>;
    try {
      result = this.onAction()();
    } catch (error) {
      // A synchronous throw keeps the dialog open so the error can be shown;
      // unhandled, it reaches the ErrorHandler from this click listener.
      if (!onError) throw error;
      onError(error);
      return;
    }
    if (!result || typeof (result as Promise<void>).then !== 'function') {
      this.open.set(false);
      return;
    }
    void this.await(result, onError);
  }

  private async await(result: Promise<void>, onError: ((error: unknown) => void) | undefined): Promise<void> {
    this.pending.set(true);
    try {
      await result;
      this.open.set(false);
    } catch (error) {
      if (onError) onError(error);
      else console.error('[PixelAlertDialog] onAction rejected:', error);
    } finally {
      this.pending.set(false);
    }
  }
}
