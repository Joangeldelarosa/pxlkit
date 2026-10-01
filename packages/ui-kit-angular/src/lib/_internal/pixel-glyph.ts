import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PIXEL_GLYPHS, PIXEL_GLYPH_STYLE, PIXEL_GLYPH_VIEWBOX, type PixelGlyphName } from '@pxlkit/ui-kit-core';

/**
 * One of the kit's built-in pixel glyphs, drawn into the `<svg>` it is placed
 * on — the counterpart of the React kit's glyph icons.
 *
 * @example
 * <svg pxlGlyph="close"></svg>
 */
@Component({
  selector: 'svg[pxlGlyph]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.viewBox]': 'viewBox',
    '[class]': 'glyph().className',
    'shape-rendering': 'crispEdges',
    fill: 'currentColor',
    preserveAspectRatio: 'xMidYMid meet',
    '[style]': 'style',
  },
  template: `
    @for (rect of glyph().rects; track $index) {
      <svg:rect [attr.x]="rect[0]" [attr.y]="rect[1]" [attr.width]="rect[2]" [attr.height]="rect[3]" />
    }
  `,
})
export class PixelGlyph {
  /** Which glyph to draw. */
  readonly pxlGlyph = input.required<PixelGlyphName>();

  /** @internal */
  protected readonly glyph = computed(() => PIXEL_GLYPHS[this.pxlGlyph()]);
  /** @internal */
  protected readonly viewBox = PIXEL_GLYPH_VIEWBOX;
  /** @internal */
  protected readonly style = PIXEL_GLYPH_STYLE;
}
