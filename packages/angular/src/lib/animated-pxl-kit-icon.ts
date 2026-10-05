import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  Renderer2,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import {
  ICON_IMAGE_STYLE,
  animatedIconWrapperStyle,
  createAnimatedIconPlayer,
  getAnimationFrame,
  renderIconDataUri,
  resolveIconLabel,
  type AnimatedIconPlayer,
  type AnimatedPxlKitData,
  type AnimationTrigger,
  type IconAppearance,
} from '@pxlkit/core/vanilla';
import { booleanOr, numberOr, optionalBoolean, optionalNumber, withDefault } from './coercion';

/**
 * Renders an animated pixel art icon by cycling through its frames.
 *
 * Triggers: `loop` (default for `loop: true` icons), `once`, `hover`,
 * `appear` (plays once when 30 % of the icon first enters the viewport) and
 * `ping-pong`. Looping icons pause while off-screen. Playback runs in the
 * framework-agnostic player shared with the React and Vue components, outside
 * the Angular zone, and each frame is written straight to the `<img>`: an
 * animation never triggers change detection, with or without zone.js.
 *
 * The `<pxl-animated-icon>` host is the exact `size`×`size` inline-flex box
 * that frames the image.
 *
 * @example
 * ```html
 * <pxl-animated-icon [icon]="fireSword" [size]="48" />
 * <pxl-animated-icon [icon]="fireSword" trigger="hover" [speed]="2" />
 * ```
 */
@Component({
  selector: 'pxl-animated-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Per-property host bindings (not a `[style]` map) so a consumer's own
  // `style` attribute keeps precedence over the wrapper style.
  host: {
    '[style.display]': 'wrapper().display',
    '[style.align-items]': 'wrapper().alignItems',
    '[style.justify-content]': 'wrapper().justifyContent',
    '[style.vertical-align]': 'wrapper().verticalAlign',
    '[style.flex-shrink]': 'wrapper().flexShrink',
    '[style.width]': 'wrapper().width',
    '[style.height]': 'wrapper().height',
    '[style.line-height]': 'wrapper().lineHeight',
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
  template: `<img
    #frame
    [src]="src()"
    [attr.width]="size()"
    [attr.height]="size()"
    [alt]="alt()"
    draggable="false"
    [style]="imageStyle"
  />`,
})
export class AnimatedPxlKitIcon {
  /** The animated icon data. */
  readonly icon = input.required<AnimatedPxlKitData>();
  /** Rendered width and height in px. */
  readonly size = input(32, { transform: numberOr(32) });
  /** Colour mode: `'palette'` (artwork colours), `'tinted'` or `'solid'`. */
  readonly appearance = input('palette', { transform: withDefault<IconAppearance>('palette') });
  /** Tint hue (`'tinted'`) or flat colour (`'solid'`). */
  readonly color = input<string>();
  /** Explicit play / pause override; leave unset to let the trigger drive playback. */
  readonly playing = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  /** Overrides the icon's trigger: `loop`, `once`, `hover`, `appear` or `ping-pong`. */
  readonly trigger = input<AnimationTrigger>();
  /** Playback speed multiplier, clamped to 0.1–10. */
  readonly speed = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Fixed frame rate, clamped to 1–60. Takes priority over `speed`. */
  readonly fps = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Accessible name of the frames. Unset or empty falls back to the icon name. */
  readonly ariaLabel = input<string>();
  /**
   * The icon only illustrates visible text that already says what it means:
   * every frame renders with an empty `alt` and assistive technology skips
   * it. Wins over `ariaLabel`.
   */
  readonly decorative = input(false, { transform: booleanOr(false) });

  private player: AnimatedIconPlayer | undefined;
  private readonly zone = inject(NgZone);
  private readonly frame = viewChild.required<ElementRef<HTMLImageElement>>('frame');

  protected readonly imageStyle = ICON_IMAGE_STYLE;
  protected readonly wrapper = computed(() => animatedIconWrapperStyle(this.size()));
  /**
   * Bound to the `<img>` whenever an input changes; the frames played in
   * between are written by the player subscription.
   */
  protected readonly src = computed(() => this.frameSrc());
  protected readonly alt = computed(() =>
    resolveIconLabel(this.icon(), { label: this.ariaLabel(), decorative: this.decorative() }),
  );

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const renderer = inject(Renderer2);
    let unsubscribe: (() => void) | undefined;

    // Component effects run during change detection, before the template is
    // refreshed: a new icon restarts playback before `src` is read, so it never
    // paints a stale frame.
    effect(() => {
      const options = {
        icon: this.icon(),
        playing: this.playing(),
        trigger: this.trigger(),
        speed: this.speed(),
        fps: this.fps(),
      };
      untracked(() => {
        if (this.player) {
          this.outsideZone((player) => player.update(options));
          return;
        }
        const player = createAnimatedIconPlayer(options);
        unsubscribe = player.subscribe(() =>
          renderer.setProperty(this.frame().nativeElement, 'src', untracked(() => this.frameSrc())),
        );
        this.player = player;
      });
    });

    // Browser only: the clock and the viewport observers start after the
    // first render.
    afterNextRender(() => this.outsideZone((player) => player.connect(host)));

    inject(DestroyRef).onDestroy(() => {
      unsubscribe?.();
      this.player?.disconnect();
    });
  }

  /** The frame the player is on, in the current colours. */
  private frameSrc(): string {
    return renderIconDataUri(getAnimationFrame(this.icon(), this.player?.getFrameIndex() ?? 0), {
      appearance: this.appearance(),
      color: this.color(),
    });
  }

  protected onMouseEnter(): void {
    this.outsideZone((player) => player.hoverStart());
  }

  protected onMouseLeave(): void {
    this.outsideZone((player) => player.hoverEnd());
  }

  /**
   * Runs a player call outside the Angular zone, so the interval and the
   * observers it starts never trigger change detection.
   */
  private outsideZone(call: (player: AnimatedIconPlayer) => void): void {
    const player = this.player;
    if (player) this.zone.runOutsideAngular(() => call(player));
  }
}
