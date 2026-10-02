import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  afterNextRender,
  computed,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  TOAST_MAX,
  TOAST_STACK_VISIBLE,
  TOAST_VIEWPORT_LABEL,
  addToast,
  createToastFn,
  removeToast,
  toToastItem,
  toastSlotClasses,
  toastSlots,
  toastViewportClasses,
  updateToast,
  type Surface,
  type ToastPosition,
} from '@pxlkit/ui-kit-core';
import { booleanOr, numberOr, withDefault } from '../_internal/coercion';
import type { PxlContent } from '../_internal/outlet';
import { PixelPortal } from '../overlay-foundation/pixel-portal';
import { PixelToast } from './pixel-toast';
import { PXLKIT_TOAST, type ToastApi, type ToastInput, type ToastItem, type ToastPatch } from './toast-context';

/**
 * Holds the toast queue of everything inside it and renders the toasts in a
 * viewport portalled to `document.body`: a `role="region"` landmark named
 * "Notifications", rendered once in the browser (nothing on the server).
 * Components inside reach the API with `injectToast()`; the template
 * reaches it through a reference to the provider, which implements it.
 *
 * The host is layout-neutral (`display: contents`).
 *
 * @example
 * <pxl-toast-provider position="bottom-right">
 *   <router-outlet />
 * </pxl-toast-provider>
 *
 * // In a component inside:
 * private readonly toasts = injectToast();
 * save() {
 *   this.toasts.toast.success('Saved', 'Your changes were persisted.');
 * }
 *
 * // Or in the template itself:
 * <pxl-toast-provider #toaster>
 *   <button pxlButton (click)="toaster.toast({ title: 'Saved' })">Save</button>
 * </pxl-toast-provider>
 */
@Component({
  selector: 'pxl-toast-provider',
  imports: [PixelPortal, PixelToast],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: PXLKIT_TOAST, useExisting: forwardRef(() => PxlKitToastProvider) }],
  host: { '[style.display]': '"contents"' },
  template: `
    <ng-content />
    @if (mounted()) {
      <ng-template pxlPortal>
        <div
          role="region"
          [attr.aria-label]="viewportLabel"
          data-pxl-toast-viewport="true"
          [attr.data-expanded]="expanded() ? 'true' : 'false'"
          [attr.data-stacked]="stacked() ? 'true' : 'false'"
          [class]="viewportClasses()"
          (mouseenter)="onMouseenter()"
          (mouseleave)="onMouseleave($event)"
          (focusin)="onFocusin()"
          (focusout)="onFocusout($event)"
        >
          @for (slot of slots(); track slot.toast.id) {
            <div data-pxl-toast-slot="true" [attr.data-depth]="slot.depth" [style]="slot.style" [class]="slotClasses">
              <pxl-toast-card [toast]="slot.toast" [surface]="surface()" (dismiss)="dismiss(slot.toast.id)" />
            </div>
          }
        </div>
      </ng-template>
    }
  `,
})
export class PxlKitToastProvider implements ToastApi {
  /** Corner, or edge centre, of the screen the toasts appear at. */
  readonly position = input<ToastPosition, ToastPosition | undefined>('top-right', {
    transform: withDefault<ToastPosition>('top-right'),
  });
  /** Maximum simultaneous toasts. Oldest is dropped if exceeded. */
  readonly max = input(TOAST_MAX, { transform: numberOr(TOAST_MAX) });
  /** Surface of the toasts; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /**
   * Sonner-style stacked-offset visual: toasts collapse into a small stack
   * showing only the front card; hovering or focusing it expands it into a
   * vertical list.
   */
  readonly stacked = input(true, { transform: booleanOr(true) });
  /** How many additional cards peek behind the front when stacked. */
  readonly stackVisible = input(TOAST_STACK_VISIBLE, { transform: numberOr(TOAST_STACK_VISIBLE) });

  private readonly items = signal<ToastItem[]>([]);
  private readonly document = inject(DOCUMENT);

  /** The toasts on screen, oldest first. */
  readonly toasts = this.items.asReadonly();
  /** Dismiss a toast by id. */
  readonly dismiss = (id: string): void => this.items.update((toasts) => removeToast(toasts, id));
  /** Merge a patch into a toast. */
  readonly update = (id: string, patch: ToastPatch): void => this.items.update((toasts) => updateToast(toasts, id, patch));
  /** Dismiss every toast at once. */
  readonly clear = (): void => this.items.set([]);
  /** Push a toast and get its id; with the tone shortcuts, `update`, `dismiss` and `promise` attached. */
  readonly toast = createToastFn<PxlContent>({
    push: (input: ToastInput) => {
      const toast = toToastItem(input);
      this.items.update((toasts) => addToast(toasts, toast, this.max()));
      return toast.id;
    },
    update: this.update,
    dismiss: this.dismiss,
  });

  // Like the React kit's, the viewport renders once in the browser: the
  // server and hydration render the content alone.
  /** @internal */
  protected readonly mounted = signal(false);
  // Hovered or focused, a stack opens into a list — and stays open until
  // both the pointer and focus have left.
  private readonly hovered = signal(false);
  private readonly focused = signal(false);
  /** @internal */
  protected readonly expanded = computed(() => this.hovered() || this.focused());
  /** @internal */
  protected readonly viewportLabel = TOAST_VIEWPORT_LABEL;
  /** @internal */
  protected readonly slotClasses = toastSlotClasses;
  /** @internal */
  protected readonly viewportClasses = computed(() => toastViewportClasses(this.position()));
  /** @internal */
  protected readonly slots = computed(() =>
    toastSlots(this.items(), {
      position: this.position(),
      stacked: this.stacked(),
      expanded: this.expanded(),
      stackVisible: this.stackVisible(),
    }),
  );

  constructor() {
    afterNextRender(() => this.mounted.set(true));
  }

  /** @internal */
  protected onMouseenter(): void {
    if (this.stacked()) this.hovered.set(true);
  }

  /** @internal */
  protected onMouseleave(event: MouseEvent): void {
    if (!this.stacked()) return;
    this.hovered.set(false);
    // Removing the focused toast takes focus away, and need not fire a blur.
    this.focused.set((event.currentTarget as HTMLElement).contains(this.document.activeElement));
  }

  /** @internal */
  protected onFocusin(): void {
    if (this.stacked()) this.focused.set(true);
  }

  /** @internal */
  protected onFocusout(event: FocusEvent): void {
    // Only collapse when focus leaves the viewport entirely.
    if (this.stacked() && !(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
      this.focused.set(false);
    }
  }
}
