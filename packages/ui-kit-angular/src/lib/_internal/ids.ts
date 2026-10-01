import { APP_ID, Injectable, inject } from '@angular/core';

/**
 * Element ids for ARIA relationships (`aria-labelledby`, `for`, …).
 *
 * One counter per application injector: the server and the browser create
 * components in the same order, so a server-rendered page and its hydrated
 * app agree on every id. The application id keeps two applications on one
 * page apart.
 */
@Injectable({ providedIn: 'root' })
export class PxlIdGenerator {
  private readonly appId = inject(APP_ID);
  private next = 0;

  /** A new id, unique within the document. */
  id(): string {
    return `pxl-${this.appId}-${this.next++}`;
  }
}

/** A new id for the calling component (call in an injection context). */
export function injectId(): string {
  return inject(PxlIdGenerator).id();
}
