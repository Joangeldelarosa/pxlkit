import { NgZone, computed, inject, signal, untracked, type OutputEmitterRef, type Signal } from '@angular/core';

/** The open state of an overlay, and the way it asks for another. */
export interface OverlayOpenState {
  /** Whether the overlay shows. */
  readonly open: Signal<boolean>;
  /** Asks for `open`: kept while uncontrolled, and reported through `openChange` either way. */
  request(open: boolean): void;
}

/**
 * The open state of an overlay, decided as in React's and Vue's kits.
 * Controlled (`open()` is a boolean), the overlay shows what its parent
 * binds; uncontrolled (`undefined`), it keeps a state of its own, which
 * starts from `defaultOpen` — read once, as React reads it. A change is only
 * asked for, through `openChange` (which `[(open)]` takes), so a parent that
 * keeps its value keeps the overlay as it is. Requests are made inside the
 * Angular zone: many come from page-wide listeners, which run outside it,
 * and a zone.js application renders the parent's answer only from inside.
 * Call in an injection context.
 */
export function injectOpenState(
  open: Signal<boolean | undefined>,
  openChange: OutputEmitterRef<boolean>,
  defaultOpen: () => boolean = () => false,
): OverlayOpenState {
  const zone = inject(NgZone);
  const own = signal<boolean | undefined>(undefined);
  let seed: boolean | undefined;
  return {
    open: computed(() => open() ?? own() ?? (seed ??= defaultOpen())),
    request(next) {
      if (untracked(open) === undefined) own.set(next);
      zone.run(() => openChange.emit(next));
    },
  };
}
