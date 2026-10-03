import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  modalClasses,
  modalLayerClasses,
  overlayBackdropClasses,
  type ModalSize,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { withDefault } from '../_internal/coercion';
import { injectId } from '../_internal/ids';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { PixelGlyph } from '../_internal/pixel-glyph';
import { PixelPortal } from '../overlay-foundation/pixel-portal';
import { injectPxlKitLocale } from '../overlay-foundation/pxl-kit-locale-provider';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { injectEscape, injectFocusTrap, injectScrollLock } from '../utilities/dom';
import { injectReducedMotion } from '../utilities/media-query';
import { injectOpenState } from './_internal/open-state';

/**
 * Centered modal dialog with a title bar, optional description and footer,
 * surface-aware chrome (the pixel surface draws an old-school window), focus
 * trap, scroll lock and Escape / backdrop dismissal. Bind it with
 * `[(open)]`, or pass `[open]` and listen to `(closed)`; the body is the
 * projected content. It shows what its parent binds: the close button,
 * Escape and the backdrop only ask to close, so a parent that keeps it open
 * keeps it as it is.
 *
 * The host is layout-neutral (`display: contents`); the dialog renders into
 * `document.body`.
 *
 * @example
 * <pxl-modal [(open)]="open" title="Save changes?" [footer]="actions">
 *   <p>Your edits are not saved yet.</p>
 * </pxl-modal>
 * <ng-template #actions><button pxlButton (click)="open.set(false)">Save</button></ng-template>
 */
@Component({
  selector: 'pxl-modal',
  imports: [NgTemplateOutlet, PixelPortal, PxlOutlet, PixelGlyph],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.display]': '"contents"',
    // `title` names the dialog; on the host it would show a native tooltip.
    '[attr.title]': 'null',
  },
  template: `
    @if (open()) {
      <ng-template pxlPortal [pxlPortalContainer]="container()">
        <div
          [class]="layerClasses"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          [attr.aria-describedby]="description() ? descriptionId : null"
        >
          <div aria-hidden="true" data-pxl-overlay-backdrop="" [class]="backdropClasses" (click)="dismiss()"></div>
          <div #panel [class]="classes().panel">
            <div [class]="classes().header">
              <h4 [id]="titleId" [class]="classes().title">{{ locale().upper(title()) }}</h4>
              <button
                type="button"
                [attr.aria-label]="closeLabel()"
                [attr.aria-busy]="closing() || null"
                [disabled]="closing()"
                [class]="classes().closeButton"
                (click)="requestClose()"
              >
                @if (closing()) {
                  <span aria-hidden="true" [class]="classes().busy"></span>
                } @else {
                  <svg pxlGlyph="close"></svg>
                }
              </button>
            </div>
            @if (description() && effectiveSurface() !== 'pixel') {
              <ng-container *ngTemplateOutlet="descriptionBlock" />
            }
            <div [class]="classes().body">
              <!-- The pixel window's body holds the description too. -->
              @if (description() && effectiveSurface() === 'pixel') {
                <ng-container *ngTemplateOutlet="descriptionBlock" />
              }
              <ng-content />
            </div>
            @if (footer()) {
              <div [class]="classes().footer">
                <ng-container *pxlOutlet="footer(); let text">{{ text }}</ng-container>
              </div>
            }
          </div>
        </div>
      </ng-template>
    }
    <ng-template #descriptionBlock>
      <p [id]="descriptionId" [class]="classes().description">
        <ng-container *pxlOutlet="description(); let text">{{ text }}</ng-container>
      </p>
    </ng-template>
  `,
})
export class PixelModal {
  /** Whether the modal is visible (`[(open)]`). */
  readonly open = input.required<boolean>();
  /** Title shown in the header; it names the dialog. */
  readonly title = input.required<string>();
  /** Width preset. */
  readonly size = input<ModalSize, ModalSize | undefined>('md', { transform: withDefault<ModalSize>('md') });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Accessible label of the close button. */
  readonly closeLabel = input<string, string | undefined>('Close', { transform: withDefault('Close') });
  /** Description under the title, wired via `aria-describedby`. */
  readonly description = input<PxlContent>();
  /** Actions at the bottom, set off by a divider. */
  readonly footer = input<PxlContent>();
  /**
   * Awaited before the modal closes — the close button shows a busy state
   * meanwhile. Lets you persist or animate out first.
   */
  readonly asyncClose = input<() => Promise<void>>();
  /** Portal target; `document.body` when left out. */
  readonly container = input<HTMLElement | null>();
  /** `false` when the modal asks to close (close button, Escape, backdrop), for `[(open)]`. */
  readonly openChange = output<boolean>();
  /** The user asked to close the modal (close button, Escape, backdrop). */
  readonly closed = output<void>();

  private readonly state = injectOpenState(this.open, this.openChange);
  private readonly zone = inject(NgZone);

  /** @internal */
  protected readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly reducedMotion = injectReducedMotion();
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  /** @internal */
  protected readonly locale = injectPxlKitLocale();
  /** @internal */
  protected readonly titleId = injectId();
  /** @internal */
  protected readonly descriptionId = injectId();
  /** @internal */
  protected readonly closing = signal(false);
  /** @internal */
  protected readonly layerClasses = modalLayerClasses;
  /** @internal */
  protected readonly backdropClasses = overlayBackdropClasses('fixed');
  /** @internal */
  protected readonly classes = computed(() =>
    modalClasses(this.effectiveSurface(), this.size(), { closing: this.closing(), reducedMotion: this.reducedMotion() }),
  );

  constructor() {
    injectFocusTrap(
      () => this.open(),
      () => this.panel()?.nativeElement,
    );
    injectScrollLock(() => this.open());
    injectEscape(
      () => this.dismiss(),
      () => this.open(),
    );
  }

  /** @internal */
  protected async requestClose(): Promise<void> {
    const asyncClose = this.asyncClose();
    if (!asyncClose) {
      this.close();
      return;
    }
    try {
      this.closing.set(true);
      await asyncClose();
    } finally {
      this.closing.set(false);
      this.close();
    }
  }

  /** @internal */
  protected dismiss(): void {
    if (!this.closing()) void this.requestClose();
  }

  private close(): void {
    // `(closed)` goes with the request, inside the zone (see injectOpenState):
    // Escape is heard outside it.
    this.zone.run(() => {
      this.state.request(false);
      this.closed.emit();
    });
  }
}
