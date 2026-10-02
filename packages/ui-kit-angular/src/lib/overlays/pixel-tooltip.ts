import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  TOOLTIP_Z_INDEX,
  anchorFloating,
  anchoredMiddleware,
  describeTooltipTrigger,
  floatingStyles,
  resolveTooltipDelays,
  tooltipClasses,
  tooltipTriggerClasses,
  type Surface,
  type TooltipDelay,
  type TooltipPosition,
  type TooltipTrigger,
} from '@pxlkit/ui-kit-core';
import { booleanOr, numberOr, withDefault } from '../_internal/coercion';
import { injectId } from '../_internal/ids';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { PixelPortal } from '../overlay-foundation/pixel-portal';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { injectEscape, injectEventListener } from '../utilities/dom';

/**
 * Floating hint anchored to the projected trigger, rendered into `<body>`
 * and kept in view (it flips and shifts away from the edges). It opens on
 * hover and focus, on focus only, or on click, and describes the trigger
 * (`aria-describedby`) while open. Escape closes any tooltip — one that opens
 * on hover or focus stays closed until the pointer or focus has left the
 * trigger — and a click tooltip also closes on a press outside. Bind
 * `[(open)]` to control it, or leave it uncontrolled with `defaultOpen`.
 *
 * The host is layout-neutral (`display: contents`).
 *
 * @example
 * <pxl-tooltip label="Save your changes" [delay]="{ open: 0 }">
 *   <button pxlButton>Save</button>
 * </pxl-tooltip>
 */
@Component({
  selector: 'pxl-tooltip',
  imports: [PixelPortal, PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.display]': '"contents"' },
  template: `
    <span
      #wrapper
      [class]="triggerClasses"
      (mouseenter)="onHover(true)"
      (mouseleave)="onHover(false)"
      (focusin)="onFocusChange(true)"
      (focusout)="onFocusChange(false)"
      (click)="onClick()"
    >
      <ng-content />
    </span>
    @if (isOpen() && body() != null) {
      <ng-template pxlPortal>
        <span #tip [id]="tipId" role="tooltip" [style]="style()" [class]="classes()">
          <ng-container *pxlOutlet="body(); let text">{{ text }}</ng-container>
        </span>
      </ng-template>
    }
  `,
})
export class PixelTooltip {
  /** Tooltip content: text or an `<ng-template>`, in place of `label`. */
  readonly content = input<PxlContent>();
  /** Text of the tooltip. */
  readonly label = input<string>();
  /** Preferred side of the trigger; the tooltip flips and shifts to stay in view. */
  readonly position = input<TooltipPosition, TooltipPosition | undefined>('top', {
    transform: withDefault<TooltipPosition>('top'),
  });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /**
   * Open / close delays in ms (default `{ open: 200, close: 100 }`); a bare
   * number is the open delay.
   */
  readonly delay = input<TooltipDelay>();
  /** Whether the tooltip is open (`[(open)]`); leave unset for an uncontrolled tooltip. */
  readonly open = model<boolean | undefined>(undefined);
  /** Initial open state while uncontrolled. */
  readonly defaultOpen = input(false, { transform: booleanOr(false) });
  /** What opens it: `hover` (and focus), `focus` only, or `click` to toggle. */
  readonly trigger = input<TooltipTrigger, TooltipTrigger | undefined>('hover', {
    transform: withDefault<TooltipTrigger>('hover'),
  });
  /** Gap between the trigger and the tooltip, in px. */
  readonly sideOffset = input(8, { transform: numberOr(8) });

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly wrapper = viewChild.required<ElementRef<HTMLElement>>('wrapper');
  private readonly tip = viewChild<ElementRef<HTMLElement>>('tip');
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly coords = signal({ x: 0, y: 0 });
  // Like React's uncontrolled state, the default is read once, then kept.
  private seed: boolean | undefined;
  private openTimer: ReturnType<typeof setTimeout> | undefined;
  private closeTimer: ReturnType<typeof setTimeout> | undefined;
  // Set when Escape dismisses the tooltip: hover and focus leave it closed
  // until the pointer or focus has left the trigger.
  private dismissed = false;

  /** @internal */
  protected readonly tipId = injectId();
  /** @internal */
  protected readonly triggerClasses = tooltipTriggerClasses;
  /** @internal */
  protected readonly isOpen = computed(() => this.open() ?? (this.seed ??= this.defaultOpen()));
  /** @internal */
  protected readonly body = computed(() => this.content() ?? this.label());
  /** @internal */
  protected readonly classes = computed(() => tooltipClasses(this.effectiveSurface(), this.trigger()));
  /** @internal */
  protected readonly style = computed(() => {
    const { x, y } = this.coords();
    // Only positioned in the browser: the server renders the initial styles.
    const floating = this.browser ? (this.tip()?.nativeElement ?? null) : null;
    return { ...floatingStyles(floating, x, y), zIndex: String(TOOLTIP_Z_INDEX) };
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearTimers());
    // Escape dismisses the tooltip in every mode (WCAG 1.4.13), a pending
    // open included.
    injectEscape(
      () => {
        this.clearTimers();
        if (this.trigger() !== 'click') this.dismissed = true;
        if (this.isOpen()) this.open.set(false);
      },
      () => this.isOpen() || this.openTimer !== undefined,
    );
    // A click tooltip also closes on a press outside it.
    const document = inject(DOCUMENT);
    injectEventListener(
      'pointerdown',
      (event) => {
        const target = event.target as Node | null;
        if (this.trigger() !== 'click' || !this.isOpen() || !target) return;
        if (this.wrapper().nativeElement.contains(target) || this.tip()?.nativeElement.contains(target)) return;
        this.open.set(false);
      },
      () => document,
    );
    if (!this.browser) return;
    // Keep the tooltip anchored to the trigger while it is on the page.
    effect((onCleanup) => {
      const floating = this.tip()?.nativeElement;
      if (!floating) return;
      const placement = this.position();
      const middleware = anchoredMiddleware(this.sideOffset());
      onCleanup(
        anchorFloating(this.wrapper().nativeElement, floating, { placement, middleware }, ({ x, y }) =>
          this.coords.set({ x, y }),
        ),
      );
    });
    // While shown, the tooltip describes the element that takes focus — the
    // first focusable one inside the wrapper, else the wrapper itself.
    afterRenderEffect((onCleanup) => {
      if (!this.tip()) return;
      onCleanup(describeTooltipTrigger(this.wrapper().nativeElement, this.tipId));
    });
  }

  /** @internal */
  protected onHover(entered: boolean): void {
    if (this.trigger() !== 'hover') return;
    if (entered) this.enter();
    else this.leave();
  }

  /** @internal */
  protected onFocusChange(focused: boolean): void {
    if (this.trigger() === 'click') return;
    if (focused) this.enter();
    else this.leave();
  }

  // The wrapper stays non-interactive: clicks bubble up from the trigger,
  // whose own keyboard activation (a button's Enter / Space) then toggles too.
  /** @internal */
  protected onClick(): void {
    if (this.trigger() !== 'click') return;
    this.clearTimers();
    this.open.set(!this.isOpen());
  }

  private enter(): void {
    if (!this.dismissed) this.schedule(true);
  }

  private leave(): void {
    this.dismissed = false;
    this.schedule(false);
  }

  private schedule(open: boolean): void {
    this.clearTimers();
    const delays = resolveTooltipDelays(this.delay());
    const wait = open ? delays.open : delays.close;
    if (wait <= 0) {
      this.open.set(open);
      return;
    }
    const timer = setTimeout(() => {
      this.openTimer = this.closeTimer = undefined;
      this.open.set(open);
    }, wait);
    if (open) this.openTimer = timer;
    else this.closeTimer = timer;
  }

  private clearTimers(): void {
    clearTimeout(this.openTimer);
    clearTimeout(this.closeTimer);
    this.openTimer = this.closeTimer = undefined;
  }
}
