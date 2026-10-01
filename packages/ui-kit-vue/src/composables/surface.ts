import { computed, inject, type ComputedRef, type InjectionKey, type Ref } from 'vue';
import type { Surface } from '@pxlkit/ui-kit-core';

/** Injection key of the surface set by the nearest `PxlKitSurfaceProvider`. */
export const PXLKIT_SURFACE: InjectionKey<Readonly<Ref<Surface>>> = Symbol('pxlkit-surface');

/** The surface of the nearest `PxlKitSurfaceProvider` — `"pixel"` without one. */
export function usePxlKitSurface(): ComputedRef<Surface> {
  const provided = inject(PXLKIT_SURFACE, null);
  return computed(() => provided?.value ?? 'pixel');
}

/**
 * The surface a component renders with: its own `surface` prop wins, then the
 * nearest `PxlKitSurfaceProvider`, then `"pixel"`.
 */
export function useEffectiveSurface(prop: () => Surface | undefined): ComputedRef<Surface> {
  const provided = usePxlKitSurface();
  return computed(() => prop() ?? provided.value);
}
