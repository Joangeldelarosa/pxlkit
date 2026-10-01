import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  ICON_IMAGE_STYLE,
  PARALLAX_CANVAS_STYLE,
  createParallaxController,
  isAnimatedIcon,
  parallaxContainerStyle,
  parallaxLayerStyle,
  parallaxSceneStyle,
  renderIconDataUri,
  resolveIconLabel,
  resolveParallaxGeometry,
  type AnimatedPxlKitData,
  type IconAppearance,
  type ParallaxController,
  type ParallaxPxlKitData,
  type StyleMap,
} from '@pxlkit/core/vanilla';
import { AnimatedPxlKitIcon } from './animated-pxl-kit-icon';
import { booleanOr, numberOr, optionalNumber, withDefault } from './coercion';

/** One rendered layer: an animated icon, or a static image already resolved. */
interface LayerView {
  readonly style: StyleMap;
  readonly animated: AnimatedPxlKitData | null;
  readonly image: { readonly src: string; readonly alt: string } | null;
}

/**
 * Renders a multi-layer pixel art icon with true CSS 3D parallax: the scene
 * tilts toward the page-wide mouse position, the layers peel apart on mount
 * and, when `interactive`, a click explodes them, jolts the scene, bursts
 * pixel particles and toggles a hue-shifted active state (emitted as
 * `activate`). The motion runs in the framework-agnostic controller shared
 * with the React and Vue components, outside the Angular zone.
 *
 * The `<pxl-parallax-icon>` host is the `role="img"` container.
 *
 * @example
 * ```html
 * <pxl-parallax-icon [icon]="coolEmoji" [size]="128" (activate)="pressed = $event" />
 * ```
 */
@Component({
  selector: 'pxl-parallax-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AnimatedPxlKitIcon],
  // Per-property host bindings (not a `[style]` map) so a consumer's own
  // `style` attribute keeps precedence over the container style.
  host: {
    role: 'img',
    '[attr.aria-label]': 'label()',
    '[style.display]': 'container().display',
    '[style.position]': 'container().position',
    '[style.overflow]': 'container().overflow',
    '[style.align-items]': 'container().alignItems',
    '[style.justify-content]': 'container().justifyContent',
    '[style.vertical-align]': 'container().verticalAlign',
    '[style.flex-shrink]': 'container().flexShrink',
    '[style.line-height]': 'container().lineHeight',
    '[style.width]': 'container().width',
    '[style.height]': 'container().height',
    '[style.perspective]': 'container().perspective',
    '[style.cursor]': 'container().cursor',
    '(click)': 'onClick()',
  },
  template: `
    <div #scene [style]="sceneStyle()">
      @for (layer of layers(); track $index) {
        <div [style]="layer.style">
          @if (layer.animated; as animated) {
            <pxl-animated-icon
              [icon]="animated"
              [size]="size()"
              [appearance]="appearance()"
              [color]="color()"
            />
          } @else if (layer.image; as image) {
            <img
              [src]="image.src"
              [attr.width]="size()"
              [attr.height]="size()"
              [alt]="image.alt"
              draggable="false"
              [style]="imageStyle"
            />
          }
        </div>
      }
    </div>
    @if (interactive()) {
      <canvas #canvas [attr.width]="size()" [attr.height]="size()" [style]="canvasStyle"></canvas>
    }
  `,
})
export class ParallaxPxlKitIcon {
  /** The multi-layer parallax icon data. */
  readonly icon = input.required<ParallaxPxlKitData>();
  /** Container size in px. */
  readonly size = input(64, { transform: numberOr(64) });
  /** Mouse reactivity: the maximum tilt is `clamp(strength × 2, 4, 45)` degrees. */
  readonly strength = input(18, { transform: numberOr(18) });
  /** Colour mode applied to every layer. */
  readonly appearance = input('palette', { transform: withDefault<IconAppearance>('palette') });
  /** Tint hue (`'tinted'`) or flat colour (`'solid'`). */
  readonly color = input<string>();
  /** Rotation lerp factor per frame, 0–1. */
  readonly smoothing = input(0.06, { transform: numberOr(0.06) });
  /** CSS perspective in px. Defaults to `max(200, size × 2.5)`. */
  readonly perspective = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Z distance between layers in px. Defaults to `max(12, size × 0.2)`. */
  readonly layerGap = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  /** Soft depth shadows between layers. */
  readonly shadow = input(true, { transform: booleanOr(true) });
  /** Click to explode the layers, jolt the scene and burst pixel particles. */
  readonly interactive = input(true, { transform: booleanOr(true) });
  /** Accessible name. Defaults to the icon name. */
  readonly ariaLabel = input<string>();

  /** Fired on click with the new active state. */
  readonly activate = output<boolean>();

  private readonly zone = inject(NgZone);
  private readonly scene = viewChild.required<ElementRef<HTMLElement>>('scene');
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly active = signal(false);
  private controller: ParallaxController | undefined;

  protected readonly imageStyle = ICON_IMAGE_STYLE;
  protected readonly canvasStyle = PARALLAX_CANVAS_STYLE;
  protected readonly label = computed(() => resolveIconLabel(this.icon(), this.ariaLabel()));
  private readonly geometry = computed(() =>
    resolveParallaxGeometry(this.size(), { perspective: this.perspective(), layerGap: this.layerGap() }),
  );
  protected readonly container = computed(() =>
    parallaxContainerStyle({
      size: this.size(),
      perspective: this.geometry().perspective,
      interactive: this.interactive(),
    }),
  );
  protected readonly sceneStyle = computed(() =>
    parallaxSceneStyle({ size: this.size(), active: this.active() }),
  );
  protected readonly layers = computed<LayerView[]>(() => {
    const { layers } = this.icon();
    const { layerGap } = this.geometry();
    const shadow = this.shadow();
    const colour = { appearance: this.appearance(), color: this.color() };
    return layers.map((layer, index) => ({
      style: parallaxLayerStyle({ index, layerCount: layers.length, layerGap, shadow }),
      animated: isAnimatedIcon(layer.icon) ? layer.icon : null,
      image: isAnimatedIcon(layer.icon)
        ? null
        : { src: renderIconDataUri(layer.icon, colour), alt: resolveIconLabel(layer.icon) },
    }));
  });

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    effect(() => {
      const options = {
        icon: this.icon(),
        size: this.size(),
        strength: this.strength(),
        smoothing: this.smoothing(),
        layerGap: this.geometry().layerGap,
      };
      untracked(() => {
        if (this.controller) this.controller.update(options);
        else this.controller = createParallaxController(options);
      });
    });

    // The particle canvas only exists while `interactive` is on.
    effect(() => {
      const canvas = this.canvas()?.nativeElement ?? null;
      untracked(() => this.controller?.setCanvas(canvas));
    });

    // Browser only: the animation loop and the page-wide mouse listener run
    // outside the zone and write transforms straight to the DOM.
    afterNextRender(() => {
      const controller = this.controller;
      if (!controller) return;
      this.zone.runOutsideAngular(() =>
        controller.connect({
          container: host,
          scene: this.scene().nativeElement,
          canvas: this.canvas()?.nativeElement ?? null,
        }),
      );
    });

    inject(DestroyRef).onDestroy(() => this.controller?.disconnect());
  }

  protected onClick(): void {
    if (!this.interactive()) return;
    const next = !this.active();
    this.active.set(next);
    this.activate.emit(next);
    this.controller?.burst();
  }
}
