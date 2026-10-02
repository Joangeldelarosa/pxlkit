import { Directive, ElementRef, Renderer2, computed, inject, input, type AfterContentChecked } from '@angular/core';
import {
  cn,
  equalHeightGridClasses,
  equalHeightGridItemClasses,
  gridClasses,
  type EqualHeightGridRowAlign,
} from '@pxlkit/ui-kit-core';
import { withDefault } from '../_internal/coercion';
import { PixelGridBase } from './pixel-grid';

const ITEM_CLASSES = equalHeightGridItemClasses.split(' ');

/**
 * A `pxlGrid` whose items share their row's height: each child element is
 * laid out as an auto header, a stretching body and an auto footer
 * (`grid-rows-[auto_1fr_auto]`), so footers line up across a row. Takes the
 * inputs of `pxlGrid` except `align`; put it on whichever element you need.
 *
 * @example
 * <div pxlEqualHeightGrid [cols]="{ base: 1, sm: 3 }" [gap]="4">
 *   <article>…</article>
 *   <article>…</article>
 * </div>
 */
@Directive({
  selector: '[pxlEqualHeightGrid]',
  host: {
    '[class]': 'classes()',
    '[style.grid-template-columns]': 'templateColumns()',
  },
})
export class PixelEqualHeightGrid extends PixelGridBase implements AfterContentChecked {
  /** `stretch` gives every item of a row the row's height; `top` keeps their own. */
  readonly rowAlign = input<EqualHeightGridRowAlign, EqualHeightGridRowAlign | undefined>('stretch', {
    transform: withDefault<EqualHeightGridRowAlign>('stretch'),
  });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);

  /** @internal */
  protected readonly classes = computed(() => {
    const surface = this.effectiveSurface();
    return cn(gridClasses(surface, this.gridOptions('stretch')), equalHeightGridClasses(surface, this.rowAlign()));
  });

  // The items are the element's children, whoever renders them, so they are
  // styled where they are: on the server too, and again whenever the content
  // changes.
  ngAfterContentChecked(): void {
    for (const item of Array.from(this.host.children)) {
      for (const name of ITEM_CLASSES) this.renderer.addClass(item, name);
    }
  }
}
