import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  PLATFORM_ID,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  anchorFloating,
  anchoredMiddleware,
  floatingStyles,
  returnFocusOnRemoval,
  toPlacement,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { booleanOr, numberOr, withDefault } from '../_internal/coercion';
import {
  PIXEL_POPOVER,
  type PixelPopoverContext,
  type PopoverAlign,
  type PopoverHasPopup,
  type PopoverRole,
  type PopoverSide,
} from './popover-context';
import { injectEffectiveSurface } from './pxl-kit-surface-provider';

/**
 * Controlled floating panel anchored to a trigger. Put `pxlPopoverTrigger` on
 * the element that opens it and `*pxlPopoverContent` on the panel; bind the
 * open state with `[(open)]`. Escape and a press outside close it, and
 * content that closes while it holds focus hands focus back to the trigger.
 *
 * The host is layout-neutral (`display: contents`).
 *
 * @example
 * <pxl-popover [(open)]="open">
 *   <button type="button" pxlPopoverTrigger>Details</button>
 *   <div *pxlPopoverContent aria-labelledby="details-title">…</div>
 * </pxl-popover>
 */
@Component({
  selector: 'pxl-popover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: PIXEL_POPOVER, useFactory: () => inject(PixelPopover).context }],
  host: {
    '[style.display]': '"contents"',
    // `role` describes the content panel; on the host it would add a stray role.
    '[attr.role]': 'null',
  },
  template: '<ng-content />',
})
export class PixelPopover {
  /** Whether the popover is open (`[(open)]`). */
  readonly open = model.required<boolean>();
  /** Side of the trigger the content opens on; flips when there is no room. */
  readonly side = input<PopoverSide, PopoverSide | undefined>('bottom', { transform: withDefault<PopoverSide>('bottom') });
  /** Alignment of the content along that side. */
  readonly align = input<PopoverAlign, PopoverAlign | undefined>('center', {
    transform: withDefault<PopoverAlign>('center'),
  });
  /** Gap between trigger and content, in px. */
  readonly sideOffset = input(8, { transform: numberOr(8) });
  /** Close when Escape is pressed. */
  readonly closeOnEscape = input(true, { transform: booleanOr(true) });
  /** Close on a press outside the trigger and the content. */
  readonly closeOnOutsideClick = input(true, { transform: booleanOr(true) });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /**
   * `aria-haspopup` advertised on the trigger: `listbox` for combobox
   * patterns, `menu` for menus. A static `aria-haspopup` on the trigger wins.
   */
  readonly haspopup = input<PopoverHasPopup, PopoverHasPopup | undefined>('dialog', {
    transform: withDefault<PopoverHasPopup>('dialog'),
  });
  /**
   * Role of the content. Set `none` when an inner widget owns the semantics
   * (e.g. a listbox inside a combobox).
   */
  readonly role = input<PopoverRole, PopoverRole | undefined>('dialog', { transform: withDefault<PopoverRole>('dialog') });

  private readonly trigger = signal<HTMLElement | null>(null);
  private readonly content = signal<HTMLElement | null>(null);
  private readonly position = signal({ x: 0, y: 0 });
  // True while a press outside is closing the popover: focus then follows the
  // pointer instead of returning to the trigger.
  private pressOutside = false;

  /** @internal */
  readonly context: PixelPopoverContext = {
    open: this.open.asReadonly(),
    side: this.side,
    surface: injectEffectiveSurface(() => this.surface()),
    haspopup: this.haspopup,
    role: this.role,
    floatingStyles: computed(() => {
      const { x, y } = this.position();
      return floatingStyles(this.content(), x, y);
    }),
    setOpen: (open) => this.open.set(open),
    setTrigger: (element) => this.trigger.set(element),
    setContent: (element) => {
      const previous = untracked(this.content);
      if (!element && previous && !this.pressOutside) {
        returnFocusOnRemoval(previous, () => untracked(this.trigger));
      }
      this.content.set(element);
    },
  };

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const document = inject(DOCUMENT);

    // Keep the content anchored to the trigger while both are on the page.
    effect((onCleanup) => {
      const reference = this.trigger();
      const floating = this.content();
      if (!reference || !floating) return;
      const placement = toPlacement(this.side(), this.align());
      const middleware = anchoredMiddleware(this.sideOffset());
      onCleanup(
        anchorFloating(reference, floating, { placement, middleware }, ({ x, y }) => this.position.set({ x, y })),
      );
    });

    // Dismissal listeners, attached while open.
    afterRenderEffect((onCleanup) => {
      if (!this.open()) return;
      this.pressOutside = false;
      const view = document.defaultView;
      const onKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this.closeOnEscape()) this.open.set(false);
      };
      // The trigger sits outside the content panel, so both are excluded —
      // otherwise a trigger press would close the popover and its click reopen it.
      const onPointerDown = (event: PointerEvent) => {
        const target = event.target as Node | null;
        if (!target || !this.closeOnOutsideClick()) return;
        if (untracked(this.content)?.contains(target)) return;
        if (untracked(this.trigger)?.contains(target)) return;
        this.pressOutside = true;
        this.open.set(false);
      };
      // A press outside that did not close the popover (the parent kept it
      // open) ends with the pointer release.
      const onPointerRelease = () => {
        this.pressOutside = false;
      };
      view?.addEventListener('keydown', onKeydown);
      document.addEventListener('pointerdown', onPointerDown);
      document.addEventListener('pointerup', onPointerRelease);
      document.addEventListener('pointercancel', onPointerRelease);
      onCleanup(() => {
        view?.removeEventListener('keydown', onKeydown);
        document.removeEventListener('pointerdown', onPointerDown);
        document.removeEventListener('pointerup', onPointerRelease);
        document.removeEventListener('pointercancel', onPointerRelease);
      });
    });
  }
}
