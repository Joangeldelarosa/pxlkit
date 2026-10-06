import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {
  NO_TOAST_MESSAGES,
  TOAST_DURATION,
  TOAST_HOTKEY,
  TOAST_MAX,
  TOAST_STACK_VISIBLE,
  addToast,
  createToastAnnouncer,
  createToastFn,
  isToastHotkey,
  keepToastFocus,
  liveToastMessages,
  removeToast,
  toToastItem,
  toastFocusOrigin,
  toastLiveRegionClasses,
  toastSlotClasses,
  toastSlots,
  toastViewportClasses,
  toastViewportLabel,
  updateToast,
  type Surface,
  type ToastLiveRegions,
  type ToastPosition,
} from '@pxlkit/ui-kit-core';
import { booleanOr, numberOr, withDefault } from '../_internal/coercion';
import type { PxlContent } from '../_internal/outlet';
import { PixelPortal } from '../overlay-foundation/pixel-portal';
import { injectEventListener } from '../utilities/dom';
import { PixelToast } from './pixel-toast';
import { PXLKIT_TOAST, type ToastApi, type ToastInput, type ToastItem, type ToastPatch } from './toast-context';

/**
 * Holds the toast queue of everything inside it and renders the toasts in a
 * viewport portalled to `document.body`, once rendered in the browser
 * (nothing on the server): a `role="region"` landmark named "Notifications
 * (F8)" that the hotkey moves focus to, holding the two live regions —
 * `role="status"` and `role="alert"` — that announce the toasts. When the
 * toast holding focus leaves, focus moves to the next toast, the previous
 * one, or back where it came from. Components inside reach the API with
 * `injectToast()`; the template reaches it through a reference to the
 * provider, which implements it.
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
        <!-- The hotkey moves focus to the viewport, from where Tab reaches the toasts' buttons. -->
        <div
          #viewport
          role="region"
          [attr.aria-label]="viewportLabel()"
          tabindex="-1"
          data-pxl-toast-viewport="true"
          [attr.data-expanded]="expanded() ? 'true' : 'false'"
          [attr.data-stacked]="stacked() ? 'true' : 'false'"
          [class]="viewportClasses()"
          (mouseenter)="onMouseenter()"
          (mouseleave)="onMouseleave($event)"
          (focusin)="onFocusin($event)"
          (focusout)="onFocusout($event)"
        >
          @for (slot of slots(); track slot.toast.id) {
            <div data-pxl-toast-slot="true" [attr.data-depth]="slot.depth" [style]="slot.style" [class]="slotClasses">
              <pxl-toast-card [toast]="slot.toast" [surface]="surface()" (dismiss)="dismiss(slot.toast.id)" />
            </div>
          }
          <!-- The live regions are on the page before any toast: one inserted with its text already in it is read unreliably. -->
          <div role="status" [class]="liveRegionClasses">
            @for (message of live().polite; track message.key) {
              <p>{{ message.text }}</p>
            }
          </div>
          <div role="alert" [class]="liveRegionClasses">
            @for (message of live().assertive; track message.key) {
              <p>{{ message.text }}</p>
            }
          </div>
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
  /**
   * Auto-dismiss delay, in ms, of the toasts that set no `duration` of their
   * own; `0` keeps them until dismissed. A promise's error toast stays at
   * least 6 s, unless this is `0`.
   */
  readonly duration = input(TOAST_DURATION, { transform: numberOr(TOAST_DURATION) });
  /**
   * Key that moves focus to the toasts, written like `F8` or `alt+t`, or
   * `false` for none; the viewport's accessible name tells it.
   */
  readonly hotkey = input<string | false, string | false | undefined>(TOAST_HOTKEY, {
    transform: withDefault<string | false>(TOAST_HOTKEY),
  });
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
  private readonly messages = signal<ToastLiveRegions>(NO_TOAST_MESSAGES);
  private readonly announce = createToastAnnouncer((messages) => this.messages.set(messages));
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly viewport = viewChild<ElementRef<HTMLElement>>('viewport');
  // Where focus entered the viewport from: it goes back there once no toast is left.
  private returnTo: HTMLElement | null = null;

  /** The toasts on screen, oldest first. */
  readonly toasts = this.items.asReadonly();
  /** Dismiss a toast by id. */
  readonly dismiss = (id: string): void => this.change(removeToast(this.items(), id));
  /** Merge a patch into a toast. */
  readonly update = (id: string, patch: ToastPatch): void => {
    const previous = this.items().find((t) => t.id === id);
    this.change(updateToast(this.items(), id, patch));
    const toast = this.items().find((t) => t.id === id);
    if (toast) this.announce(toast, previous);
  };
  /** Dismiss every toast at once. */
  readonly clear = (): void => this.change([]);
  /** Push a toast and get its id; with the tone shortcuts, `update`, `dismiss` and `promise` attached. */
  readonly toast = createToastFn<PxlContent>(
    {
      push: (input: ToastInput) => {
        const toast = toToastItem(input, this.duration());
        this.change(addToast(this.items(), toast, this.max()));
        this.announce(toast);
        return toast.id;
      },
      update: this.update,
      dismiss: this.dismiss,
    },
    () => this.duration(),
  );

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
  protected readonly viewportLabel = computed(() => toastViewportLabel(this.hotkey()));
  /** @internal */
  protected readonly slotClasses = toastSlotClasses;
  /** @internal */
  protected readonly liveRegionClasses = toastLiveRegionClasses;
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
  /** @internal What the live regions say about the toasts on screen. */
  protected readonly live = computed(() => liveToastMessages(this.messages(), this.items()));

  constructor() {
    afterNextRender(() => this.mounted.set(true));
    // The hotkey takes focus to the toasts on screen.
    injectEventListener('keydown', (event) => {
      if (!this.items().length || !isToastHotkey(event, this.hotkey())) return;
      event.preventDefault();
      this.viewport()?.nativeElement.focus();
    });
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
  protected onFocusin(event: FocusEvent): void {
    this.returnTo = toastFocusOrigin(event.currentTarget as HTMLElement, event.relatedTarget) ?? this.returnTo;
    if (this.stacked()) this.focused.set(true);
  }

  /** @internal */
  protected onFocusout(event: FocusEvent): void {
    // Only collapse when focus leaves the viewport entirely.
    if (this.stacked() && !(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
      this.focused.set(false);
    }
  }

  // A toast that leaves while it holds focus hands it on once the change has
  // rendered.
  private change(next: ToastItem[]): void {
    const restoreFocus = keepToastFocus(this.viewport()?.nativeElement, () => this.returnTo);
    this.items.set(next);
    if (restoreFocus) afterNextRender(restoreFocus, { injector: this.injector });
  }
}
