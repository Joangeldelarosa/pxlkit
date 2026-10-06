import { DestroyRef, Directive, ElementRef, Renderer2, inject, type OnInit } from '@angular/core';
import { injectPopoverContext } from '../../overlay-foundation/popover-context';

/**
 * The trigger of a combobox's `<pxl-popover>`: like `pxlPopoverTrigger` it
 * anchors the popover, toggles it on click (unless one of the element's own
 * click listeners calls `preventDefault()`) and advertises `aria-expanded`,
 * but it leaves `aria-controls` and `aria-haspopup` to the combobox, which
 * points them at its listbox whether or not it is open. A disabled trigger
 * ignores clicks, as React does with a click dispatched to a disabled button.
 */
@Directive({
  selector: '[pxlListboxTrigger]',
  host: {
    '[attr.aria-expanded]': 'context.open()',
  },
})
export class PixelListboxTrigger implements OnInit {
  /** @internal */
  protected readonly context = injectPopoverContext('PixelListboxTrigger');

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
      if (event.defaultPrevented || (this.element as HTMLButtonElement).disabled) return;
      this.context.setOpen(!this.context.open());
    });
    this.destroyRef.onDestroy(unlisten);
  }
}
