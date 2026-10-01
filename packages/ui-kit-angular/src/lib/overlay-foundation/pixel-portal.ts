import {
  DOCUMENT,
  DestroyRef,
  Directive,
  TemplateRef,
  ViewContainerRef,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { preserveFocus } from '@pxlkit/ui-kit-core';
import { booleanOr } from '../_internal/coercion';

/**
 * Renders its template into `container` (default `document.body`). On the
 * server and in the first client render the content stays in place, so the
 * server-rendered page and hydration agree; it moves once rendered, keeping
 * focus on an element inside it that already had it (a modal's focus trap).
 *
 * @example
 * <div *pxlPortal>Rendered into document.body</div>
 * <ng-template pxlPortal [pxlPortalContainer]="host" [pxlPortalDisabled]="inline()">…</ng-template>
 */
@Directive({ selector: '[pxlPortal]' })
export class PixelPortal {
  /** Target element; `document.body` when left out. */
  readonly pxlPortalContainer = input<HTMLElement | null>();
  /** Keep the content in place. */
  readonly pxlPortalDisabled = input(false, { transform: booleanOr(false) });

  private readonly document = inject(DOCUMENT);
  private readonly anchor = inject(ViewContainerRef);
  private readonly view = this.anchor.createEmbeddedView(inject(TemplateRef));
  private readonly rendered = signal(false);

  constructor() {
    afterNextRender(() => this.rendered.set(true));
    effect(() => {
      if (!this.rendered()) return;
      const target = this.pxlPortalDisabled() ? null : (this.pxlPortalContainer() ?? this.document.body);
      this.place(target);
    });
    // Destroying the view removes its nodes wherever they are.
    inject(DestroyRef).onDestroy(() => this.view.destroy());
  }

  /** Move the content into `target`, or back in place for `null`. */
  private place(target: HTMLElement | null): void {
    const comment = this.anchor.element.nativeElement as Comment;
    // Moving focused nodes drops their focus; put it back afterwards.
    const restoreFocus = preserveFocus();
    for (const node of this.view.rootNodes as Node[]) {
      if (target) target.appendChild(node);
      else comment.parentNode?.insertBefore(node, comment);
    }
    restoreFocus();
  }
}
