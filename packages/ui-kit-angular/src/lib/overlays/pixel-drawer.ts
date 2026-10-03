import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import {
  drawerLayerClasses,
  drawerPanelClasses,
  overlayBackdropClasses,
  type DrawerSide,
  type DrawerSize,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { injectId } from '../_internal/ids';
import { PixelPortal } from '../overlay-foundation/pixel-portal';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { injectEscape, injectFocusTrap, injectScrollLock } from '../utilities/dom';
import { injectOpenState } from './_internal/open-state';

/**
 * Modal panel anchored to an edge of the viewport (right, left, top or
 * bottom), with focus trap, scroll lock and Escape / backdrop dismissal.
 * Compose its content from `<pxl-drawer-header>`, `<pxl-drawer-body>` and
 * `<pxl-drawer-footer>`. Name it with `title` or `ariaLabel`. Bind it with
 * `[(open)]`. It shows what its parent binds: Escape and the backdrop only
 * ask to close, so a parent that keeps it open keeps it as it is.
 *
 * The host is layout-neutral (`display: contents`); the drawer renders into
 * `document.body`.
 *
 * @example
 * <pxl-drawer [(open)]="open" title="Settings">
 *   <pxl-drawer-header>Settings</pxl-drawer-header>
 *   <pxl-drawer-body>…</pxl-drawer-body>
 *   <pxl-drawer-footer><button pxlButton (click)="open.set(false)">Done</button></pxl-drawer-footer>
 * </pxl-drawer>
 */
@Component({
  selector: 'pxl-drawer',
  imports: [PixelPortal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.display]': '"contents"',
    // `title` names the dialog; on the host it would show a native tooltip.
    '[attr.title]': 'null',
  },
  template: `
    @if (open()) {
      <ng-template pxlPortal [pxlPortalContainer]="container()">
        <div [class]="layerClasses">
          @if (overlay()) {
            <div
              aria-hidden="true"
              data-pxl-overlay-backdrop=""
              data-pxl-drawer-overlay=""
              [class]="backdropClasses"
              (click)="onBackdropClick()"
            ></div>
          }
          <div
            #panel
            data-pxl-drawer-panel="true"
            role="dialog"
            aria-modal="true"
            [attr.aria-label]="title() ? null : ariaLabel()"
            [attr.aria-labelledby]="title() ? titleId : null"
            [attr.aria-describedby]="description() ? descriptionId : null"
            [class]="panelClasses()"
          >
            @if (title() || description()) {
              <div class="sr-only">
                @if (title()) {
                  <span [id]="titleId">{{ title() }}</span>
                }
                @if (description()) {
                  <span [id]="descriptionId">{{ description() }}</span>
                }
              </div>
            }
            <ng-content />
          </div>
        </div>
      </ng-template>
    }
  `,
})
export class PixelDrawer {
  /** Whether the drawer is visible (`[(open)]`). */
  readonly open = input.required<boolean>();
  /** Edge of the viewport the drawer is anchored to. */
  readonly side = input<DrawerSide, DrawerSide | undefined>('right', { transform: withDefault<DrawerSide>('right') });
  /** Width (left / right) or height (top / bottom) preset. */
  readonly size = input<DrawerSize, DrawerSize | undefined>('md', { transform: withDefault<DrawerSize>('md') });
  /** Dim the page behind the drawer. */
  readonly overlay = input(true, { transform: booleanOr(true) });
  /** Close when the backdrop is clicked. */
  readonly dismissOnOverlay = input(true, { transform: booleanOr(true) });
  /** Keep Tab focus inside the drawer while it is open. */
  readonly trapFocus = input(true, { transform: booleanOr(true) });
  /** Accessible name of the dialog (visually hidden). */
  readonly title = input<string>();
  /** Accessible description of the dialog (visually hidden). */
  readonly description = input<string>();
  /** Accessible name when there is no `title` — every dialog needs one (WCAG 4.1.2). */
  readonly ariaLabel = input<string>();
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Portal target; `document.body` when left out. */
  readonly container = input<HTMLElement | null>();
  /** `false` when the drawer asks to close (Escape, backdrop), for `[(open)]`. */
  readonly openChange = output<boolean>();

  private readonly state = injectOpenState(this.open, this.openChange);
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  /** @internal */
  protected readonly titleId = injectId();
  /** @internal */
  protected readonly descriptionId = injectId();
  /** @internal */
  protected readonly layerClasses = drawerLayerClasses;
  /** @internal */
  protected readonly backdropClasses = overlayBackdropClasses('absolute');
  /** @internal */
  protected readonly panelClasses = computed(() => drawerPanelClasses(this.effectiveSurface(), this.side(), this.size()));

  constructor() {
    injectFocusTrap(
      () => this.open() && this.trapFocus(),
      () => this.panel()?.nativeElement,
    );
    injectScrollLock(() => this.open());
    injectEscape(
      () => this.state.request(false),
      () => this.open(),
    );
    effect(() => {
      if ((typeof ngDevMode === 'undefined' || ngDevMode) && this.open() && !this.title() && !this.ariaLabel()) {
        console.warn('[PixelDrawer] role="dialog" has no accessible name. Pass either `title` or `aria-label`.');
      }
    });
  }

  /** @internal */
  protected onBackdropClick(): void {
    if (this.dismissOnOverlay()) this.state.request(false);
  }
}
