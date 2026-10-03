import { DestroyRef, Directive, ElementRef, Renderer2, inject, type OnInit } from '@angular/core';
import { injectPopoverContext } from '../../overlay-foundation/popover-context';

/**
 * The field of a combobox that sits beside other controls (a multi-select's
 * chips and clear button), in a `<pxl-popover>`: the field anchors the
 * popover, and a click on it toggles the popover unless one of the element's
 * own click listeners, or a button inside it, calls `preventDefault()`.
 * Unlike `pxlListboxTrigger`, it adds no ARIA: the combobox carries the
 * popup's.
 */
@Directive({ selector: '[pxlListboxField]' })
export class PixelListboxField implements OnInit {
  private readonly context = injectPopoverContext('PixelListboxField');
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
