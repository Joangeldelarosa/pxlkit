import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  ICON_IMAGE_STYLE,
  renderIconDataUri,
  resolveIconLabel,
  type IconAppearance,
  type PxlKitData,
  type StyleMap,
} from '@pxlkit/core/vanilla';
import { booleanOr, numberOr, withDefault } from './coercion';

/** The `<pxl-icon>` host is the icon box; the image fills it, pixel-perfect. */
const FILL_IMAGE_STYLE: StyleMap = Object.freeze({
  display: 'block',
  width: '100%',
  height: '100%',
  imageRendering: ICON_IMAGE_STYLE.imageRendering,
});

/**
 * Renders a pixel art icon as an `<img>` whose `src` is an inline SVG data
 * URI, scaled with `image-rendering: pixelated` so every source pixel stays
 * crisp at any size. The image is byte-identical to the React and Vue
 * components'.
 *
 * The `<pxl-icon>` host is an exact `size`×`size` inline-block box (middle
 * aligned, never shrunk in flex rows); `class` and `style` set on it style
 * the icon box.
 *
 * @example
 * ```html
 * <pxl-icon [icon]="trophy" [size]="32" />
 * <pxl-icon [icon]="trophy" appearance="tinted" color="#FF4D4D" ariaLabel="Gold trophy" />
 * <button><pxl-icon [icon]="trash" [size]="16" decorative /> Delete</button>
 * ```
 */
@Component({
  selector: 'pxl-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Per-property host bindings (not a `[style]` map) so a consumer's own
  // `style` attribute keeps precedence over these defaults.
  host: {
    '[style.display]': 'box.display',
    '[style.vertical-align]': 'box.verticalAlign',
    '[style.flex-shrink]': 'box.flexShrink',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
  },
  template: `<img
    [src]="src()"
    [attr.width]="size()"
    [attr.height]="size()"
    [alt]="alt()"
    draggable="false"
    [style]="imageStyle"
  />`,
})
export class PxlKitIcon {
  /** The icon data to render. */
  readonly icon = input.required<PxlKitData>();
  /** Rendered width and height in px. */
  readonly size = input(32, { transform: numberOr(32) });
  /** Colour mode: `'palette'` (artwork colours), `'tinted'` or `'solid'`. */
  readonly appearance = input('palette', { transform: withDefault<IconAppearance>('palette') });
  /**
   * Tint hue (`'tinted'`) or flat colour (`'solid'`); ignored by `'palette'`.
   * Falls back to `#FFFFFF` — `currentColor` cannot reach inside an `<img>`.
   */
  readonly color = input<string>();
  /**
   * Accessible name, rendered as the image `alt`. Unset or empty falls back
   * to the icon name.
   */
  readonly ariaLabel = input<string>();
  /**
   * The icon only illustrates visible text that already says what it means:
   * it renders with an empty `alt` and assistive technology skips it. Wins
   * over `ariaLabel`. An icon that is the only content of a button or link
   * is not decorative — give it an `ariaLabel` instead.
   */
  readonly decorative = input(false, { transform: booleanOr(false) });

  protected readonly box = ICON_IMAGE_STYLE;
  protected readonly imageStyle = FILL_IMAGE_STYLE;
  protected readonly src = computed(() =>
    renderIconDataUri(this.icon(), { appearance: this.appearance(), color: this.color() }),
  );
  protected readonly alt = computed(() =>
    resolveIconLabel(this.icon(), { label: this.ariaLabel(), decorative: this.decorative() }),
  );
}
