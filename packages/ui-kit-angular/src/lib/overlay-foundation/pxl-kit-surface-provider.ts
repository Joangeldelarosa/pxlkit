import {
  Directive,
  InjectionToken,
  computed,
  inject,
  input,
  type Provider,
  type Signal,
} from '@angular/core';
import type { Surface } from '@pxlkit/ui-kit-core';
import { withDefault } from '../_internal/coercion';

/** The surface every nested Pxlkit component renders with by default. */
export const PXLKIT_SURFACE = new InjectionToken<Signal<Surface>>('PXLKIT_SURFACE');

/**
 * Change the default `surface` of every Pxlkit component inside an element —
 * or inside an `<ng-container>`, which renders nothing — without setting the
 * input on each one.
 *
 * @example
 * <ng-container pxlKitSurface="linear">
 *   <button pxlButton>Looks modern</button>
 * </ng-container>
 */
@Directive({
  selector: '[pxlKitSurface]',
  providers: [{ provide: PXLKIT_SURFACE, useFactory: () => inject(PxlKitSurfaceProvider).surface }],
})
export class PxlKitSurfaceProvider {
  /** Surface of the components inside. */
  readonly pxlKitSurface = input<Surface, Surface | '' | undefined>('pixel', {
    // A bare `pxlKitSurface` attribute keeps the default.
    transform: (value) => withDefault<Surface>('pixel')(value || undefined),
  });

  /** @internal */
  readonly surface: Signal<Surface> = computed(() => this.pxlKitSurface());
}

/**
 * Application-wide default surface, for `bootstrapApplication` or a route's
 * providers.
 *
 * @example
 * bootstrapApplication(App, { providers: [providePxlKitSurface('linear')] });
 */
export function providePxlKitSurface(surface: Surface): Provider {
  return { provide: PXLKIT_SURFACE, useValue: computed(() => surface) };
}

/** The surface of the nearest provider — `"pixel"` without one. */
export function injectPxlKitSurface(): Signal<Surface> {
  const provided = inject(PXLKIT_SURFACE, { optional: true });
  return computed(() => provided?.() ?? 'pixel');
}

/**
 * The surface a component renders with: its own `surface` input wins, then
 * the nearest provider, then `"pixel"`.
 */
export function injectEffectiveSurface(own: () => Surface | undefined): Signal<Surface> {
  const provided = injectPxlKitSurface();
  return computed(() => own() ?? provided());
}
