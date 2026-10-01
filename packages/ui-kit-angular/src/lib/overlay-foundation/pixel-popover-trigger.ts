import { DestroyRef, Directive, ElementRef, HostAttributeToken, Renderer2, inject, type OnInit } from '@angular/core';
import { injectPopoverContext } from './popover-context';

/**
 * Makes its element the trigger of the enclosing `<pxl-popover>`: a click
 * toggles the popover (unless one of the element's own click listeners calls
 * `preventDefault()`), and the element advertises `aria-expanded` and
 * `aria-haspopup` — a static `aria-haspopup` on the element wins.
 *
 * @example
 * <button type="button" pxlPopoverTrigger>Details</button>
 */
@Directive({
  selector: '[pxlPopoverTrigger]',
  host: {
    '[attr.aria-expanded]': 'context.open()',
    '[attr.aria-haspopup]': 'ownHasPopup ?? context.haspopup()',
  },
})
export class PixelPopoverTrigger implements OnInit {
  /** @internal */
  protected readonly context = injectPopoverContext('PixelPopoverTrigger');
  /** @internal */
  protected readonly ownHasPopup = inject(new HostAttributeToken('aria-haspopup'), { optional: true });

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.context.setTrigger(this.element);
    this.destroyRef.onDestroy(() => this.context.setTrigger(null));
  }

  ngOnInit(): void {
    // Listening from ngOnInit registers this listener after the element's own
    // (click) bindings, so they run first and can cancel the toggle.
    const unlisten = this.renderer.listen(this.element, 'click', (event: MouseEvent) => {
      if (!event.defaultPrevented) this.context.setOpen(!this.context.open());
    });
    this.destroyRef.onDestroy(unlisten);
  }
}
