import { Directive, InjectionToken, TemplateRef, ViewContainerRef, inject } from '@angular/core';

/** Whether the projection of the card body being created came out empty. */
const EMPTY_BODY = new InjectionToken<{ empty: boolean }>('PxlCardBodyEmpty');

/**
 * Marks the fallback of the card body's `<ng-content>`: Angular renders it
 * only when nothing is projected, which tells `*pxlCardBody` the card has no
 * body.
 */
@Directive({ selector: '[pxlCardBodyEmpty]' })
export class PxlCardBodyEmpty {
  constructor() {
    inject(EMPTY_BODY).empty = true;
  }
}

/**
 * Renders the card body's wrapper — around the card's projected content —
 * only when there is content to project, as the React card renders it only
 * with children. Projected content cannot be inspected before it renders, so
 * the wrapper is created with the card and dropped at once when its
 * `<ng-content>` falls back to `[pxlCardBodyEmpty]`: the server and the
 * browser decide alike, before the first change detection, and hydration
 * finds the markup it expects.
 */
@Directive({
  selector: '[pxlCardBody]',
  providers: [{ provide: EMPTY_BODY, useFactory: () => ({ empty: false }) }],
})
export class PxlCardBody {
  constructor() {
    const container = inject(ViewContainerRef);
    container.createEmbeddedView(inject(TemplateRef));
    if (inject(EMPTY_BODY).empty) container.clear();
  }
}
