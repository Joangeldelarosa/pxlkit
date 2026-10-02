import { InjectionToken, inject, type Signal } from '@angular/core';
import type {
  ToastFn,
  ToastInput as ToastInputOf,
  ToastItem as ToastItemOf,
  ToastPatch as ToastPatchOf,
  ToastPromiseOptions as ToastPromiseOptionsOf,
  ToastShortcut as ToastShortcutOf,
} from '@pxlkit/ui-kit-core';
import type { PxlContent } from '../_internal/outlet';

/**
 * One toast. `icon`, `animatedIcon` (which wins over `icon`) and `action`
 * take text or an `<ng-template>`.
 *
 * @example
 * toast({ title: 'File deleted', action: this.undoTemplate() });
 */
export type ToastItem = ToastItemOf<PxlContent>;

/** Input of `toast()`. `id` is generated if omitted. */
export type ToastInput = ToastInputOf<PxlContent>;

/** Patch of `update()`, merged into the toast. */
export type ToastPatch = ToastPatchOf<PxlContent>;

/** Options of `toast.promise()`. */
export type ToastPromiseOptions<T> = ToastPromiseOptionsOf<T, PxlContent>;

/** Tone-locked shorthand (`success` / `error` / `info` / `warning` / `loading`). */
export type ToastShortcut = ToastShortcutOf<PxlContent>;

/** The toast API of a `<pxl-toast-provider>`, from `injectToast()`. */
export interface ToastApi {
  /** Push a toast and get its id; with `success`, `error`, `info`, `warning`, `loading`, `update`, `dismiss` and `promise` attached. */
  readonly toast: ToastFn<PxlContent>;
  /** Dismiss a toast by id. */
  readonly dismiss: (id: string) => void;
  /** Merge a patch into a toast. */
  readonly update: (id: string, patch: ToastPatch) => void;
  /** Dismiss every toast at once. */
  readonly clear: () => void;
  /** The toasts on screen, oldest first. */
  readonly toasts: Signal<readonly ToastItem[]>;
}

/** The toast API of the nearest `<pxl-toast-provider>`. */
export const PXLKIT_TOAST = new InjectionToken<ToastApi>('PXLKIT_TOAST');

/**
 * The toast API of the nearest `<pxl-toast-provider>`: push toasts (with tone
 * shortcuts and `promise()`), update and dismiss them. Call in an injection
 * context; throws outside a provider.
 *
 * @example
 * private readonly toasts = injectToast();
 * save() {
 *   this.toasts.toast.success('Saved', 'Your changes were persisted.');
 * }
 */
export function injectToast(): ToastApi {
  const api = inject(PXLKIT_TOAST, { optional: true });
  if (!api) throw new Error('injectToast must be used inside <pxl-toast-provider>.');
  return api;
}
