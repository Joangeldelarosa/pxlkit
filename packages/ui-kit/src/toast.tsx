/**
 * Back-compat shim (Ola 4e). The toast implementations moved next to their
 * manifests in `feedback/`:
 *   - `feedback/PixelToast.tsx` — the individual toast card.
 *   - `feedback/PxlKitToastProvider.tsx` — provider, context, `useToast`, types.
 * This module re-exports the full original `./toast` API so existing imports
 * keep working unchanged.
 */
export { PixelToast, type PixelToastProps } from './feedback/PixelToast';
export {
  PxlKitToastProvider,
  useToast,
  type PxlKitToastProviderProps,
  type ToastTone,
  type ToastPosition,
  type ToastItem,
  type ToastInput,
  type ToastPatch,
  type ToastPromiseOptions,
  type ToastShortcut,
  type UseToastReturn,
} from './feedback/PxlKitToastProvider';
