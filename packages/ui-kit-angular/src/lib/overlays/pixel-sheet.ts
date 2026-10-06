import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, input, output, viewChild } from '@angular/core';
import {
  overlayBackdropClasses,
  sheetClasses,
  sheetLayerClasses,
  type SheetSide,
  type SheetSize,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { injectId } from '../_internal/ids';
import { PixelPortal } from '../overlay-foundation/pixel-portal';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { injectEscape, injectFocusTrap, injectScrollLock } from '../utilities/dom';
import { injectOpenState } from './_internal/open-state';

/**
 * Mobile-first modal sheet docked to the bottom or the top of the viewport,
 * with focus trap, scroll lock, Escape / backdrop dismissal and an optional
 * (decorative) drag handle. Name it with `title` or `ariaLabel`. Bind it with
 * `[(open)]`; the body is the projected content. It shows what its parent
 * binds: Escape and the backdrop only ask to close, so a parent that keeps it
 * open keeps it as it is.
 *
 * The host is layout-neutral (`display: contents`); the sheet renders into
 * `document.body`.
 *
 * @example
 * <pxl-sheet [(open)]="open" title="Quick actions" dragHandle>
 *   <p>Sheet content.</p>
 * </pxl-sheet>
 */
@Component({
  selector: 'pxl-sheet',
  imports: [PixelPortal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.display]': '"contents"',
    // `title` names the dialog; on the host it would show a native tooltip.
    '[attr.title]': 'null',
  },
  template: `
    @if (open()) {
      <ng-template pxlPortal>
        <div [class]="layerClasses" data-pixel-sheet="">
          <div aria-hidden="true" data-pxl-overlay-backdrop="" [class]="backdropClasses" (click)="close()"></div>
          <div
            #panel
            role="dialog"
            aria-modal="true"
            [attr.aria-label]="title() ? null : ariaLabel()"
            [attr.aria-labelledby]="title() ? titleId : null"
            [attr.aria-describedby]="description() ? descriptionId : null"
            [attr.data-side]="side()"
            [attr.data-size]="size()"
            [class]="classes().panel"
          >
            <!-- On a top sheet the handle is drawn last, next to its free edge. -->
            @if (dragHandle()) {
              <div data-testid="pixel-sheet-drag-handle" aria-hidden="true" [class]="classes().handle">
                <span [class]="classes().handleBar"></span>
              </div>
            }
            @if (title() || description()) {
              <div [class]="classes().header">
                @if (title()) {
                  <h4 [id]="titleId" [class]="classes().title">{{ title() }}</h4>
                }
                @if (description()) {
                  <p [id]="descriptionId" [class]="classes().description">{{ description() }}</p>
                }
              </div>
            }
            <div [class]="classes().body"><ng-content /></div>
          </div>
        </div>
      </ng-template>
    }
  `,
})
export class PixelSheet {
  /** Whether the sheet is visible (`[(open)]`). */
  readonly open = input.required<boolean>();
  /** Edge of the viewport the sheet is docked to. */
  readonly side = input<SheetSide, SheetSide | undefined>('bottom', { transform: withDefault<SheetSide>('bottom') });
  /** Height preset. */
  readonly size = input<SheetSize, SheetSize | undefined>('md', { transform: withDefault<SheetSize>('md') });
  /** Draw a drag handle affordance (decorative). */
  readonly dragHandle = input(false, { transform: booleanOr(false) });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Title shown at the top; it names the dialog. */
  readonly title = input<string>();
  /** Text under the title, wired via `aria-describedby`. */
  readonly description = input<string>();
  /** Accessible name when there is no `title` — every dialog needs one (WCAG 4.1.2). */
  readonly ariaLabel = input<string>();
  /** `false` when the sheet asks to close (Escape, backdrop), for `[(open)]`. */
  readonly openChange = output<boolean>();

  private readonly state = injectOpenState(this.open, this.openChange);
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  /** @internal */
  protected readonly titleId = injectId();
  /** @internal */
  protected readonly descriptionId = injectId();
  /** @internal */
  protected readonly layerClasses = sheetLayerClasses;
  /** @internal */
  protected readonly backdropClasses = overlayBackdropClasses('absolute');
  /** @internal */
  protected readonly classes = computed(() => sheetClasses(this.effectiveSurface(), this.side(), this.size()));

  constructor() {
    injectFocusTrap(
      () => this.open(),
      () => this.panel()?.nativeElement,
    );
    injectScrollLock(() => this.open());
    injectEscape(
      () => this.close(),
      () => this.open(),
    );
    effect(() => {
      if ((typeof ngDevMode === 'undefined' || ngDevMode) && this.open() && !this.title() && !this.ariaLabel()) {
        console.warn('[PixelSheet] role="dialog" has no accessible name. Pass either `title` or `aria-label`.');
      }
    });
  }

  /** @internal */
  protected close(): void {
    this.state.request(false);
  }
}
