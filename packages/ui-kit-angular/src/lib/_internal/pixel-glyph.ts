import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  PIXEL_GLYPHS,
  PIXEL_GLYPH_STYLE,
  PIXEL_GLYPH_VIEWBOX,
  pixelGlyphClasses,
  type PixelGlyphName,
} from '@pxlkit/ui-kit-core';

/**
 * One of the kit's built-in pixel glyphs, drawn into the `<svg>` it is placed
 * on — the counterpart of the React kit's glyph icons. A height or width
 * among the element's classes replaces the glyph's own size.
 *
 * @example
 * <svg pxlGlyph="close" class="h-2 w-2"></svg>
 */
@Component({
  selector: 'svg[pxlGlyph]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.viewBox]': 'viewBox',
    '[class]': 'classes()',
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
  /**
   * The element's `class` and `[class]`, which the glyph renders after its
   * own size classes, without the ones they replace.
   */
  readonly className = input<string | undefined>(undefined, { alias: 'class' });

  /** @internal */
  protected readonly glyph = computed(() => PIXEL_GLYPHS[this.pxlGlyph()]);
  /** @internal */
  protected readonly classes = computed(() => pixelGlyphClasses(this.pxlGlyph(), this.className()));
  /** @internal */
  protected readonly viewBox = PIXEL_GLYPH_VIEWBOX;
  /** @internal */
  protected readonly style = PIXEL_GLYPH_STYLE;
}
