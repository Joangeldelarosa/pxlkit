import { inject, type InjectionKey, type Ref } from 'vue';
import type {
  ToastFn,
  ToastInput as ToastInputOf,
  ToastItem as ToastItemOf,
  ToastPatch as ToastPatchOf,
  ToastPromiseOptions as ToastPromiseOptionsOf,
  ToastShortcut as ToastShortcutOf,
} from '@pxlkit/ui-kit-core';
import type { PxlNode } from '../_internal/render-node.js';

/**
 * One toast. `icon`, `animatedIcon` (which wins over `icon`) and `action`
 * take text, a VNode or a render function.
 *
 * @example
 * toast({ title: 'File deleted', action: () => h(PixelButton, { size: 'sm' }, () => 'Undo') });
 */
export type ToastItem = ToastItemOf<PxlNode>;

/** Input of `toast()`. `id` is generated if omitted. */
export type ToastInput = ToastInputOf<PxlNode>;

/** Patch of `update()`, merged into the toast. */
export type ToastPatch = ToastPatchOf<PxlNode>;

/** Options of `toast.promise()`. */
export type ToastPromiseOptions<T> = ToastPromiseOptionsOf<T, PxlNode>;

/** Tone-locked shorthand (`success` / `error` / `info` / `warning` / `loading`). */
export type ToastShortcut = ToastShortcutOf<PxlNode>;

/** What `useToast()` returns. */
export interface UseToastReturn {
  /** Push a toast and get its id; with `success`, `error`, `info`, `warning`, `loading`, `update`, `dismiss` and `promise` attached. */
  toast: ToastFn<PxlNode>;
  /** Dismiss a toast by id. */
  dismiss: (id: string) => void;
  /** Merge a patch into a toast. */
  update: (id: string, patch: ToastPatch) => void;
  /** Dismiss every toast at once. */
  clear: () => void;
  /** The toasts on screen, oldest first. */
  toasts: Readonly<Ref<readonly ToastItem[]>>;
}

/** Injection key of the API provided by the nearest `PxlKitToastProvider`. */
export const PXLKIT_TOAST: InjectionKey<UseToastReturn> = Symbol('pxlkit-toast');

/**
 * The toast API of the nearest `PxlKitToastProvider`: push toasts (with tone
 * shortcuts and `promise()`), update and dismiss them. Throws outside a
 * provider.
 *
 * @example
 * const { toast } = useToast();
 * toast.success('Saved', 'Your changes were persisted.');
 */
export function useToast(): UseToastReturn {
  const api = inject(PXLKIT_TOAST, null);
  if (!api) throw new Error('useToast must be used inside <PxlKitToastProvider>.');
  return api;
}
