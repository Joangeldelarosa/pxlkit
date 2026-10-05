'use client';

import React from 'react';
// Intentional cycle with ../common: common.tsx re-exports PxlKitSurfaceProvider
// from this file via a re-export-only statement at the END of common.tsx, while
// this file value-imports the shared PxlKitSurfaceContext back from common.
// That ordering (shared values initialized above the re-export) makes the
// cycle safe — see forms/PixelToggleGroup.tsx for the same convention.
import { PxlKitSurfaceContext, type Surface } from '../common';

/**
 * Wrap a subtree to change the default `surface` of every nested Pxlkit
 * component without setting the prop on each one individually.
 *
 * @example
 * <PxlKitSurfaceProvider surface="linear">
 *   <PixelButton>Looks modern</PixelButton>
 * </PxlKitSurfaceProvider>
 */
export function PxlKitSurfaceProvider({
  surface = 'pixel',
  children,
}: {
  /** Surface of every nested component that does not set its own. */
  surface?: Surface;
  /** The part of the app the surface applies to. */
  children: React.ReactNode;
}) {
  return (
    <PxlKitSurfaceContext.Provider value={surface}>
      {children}
    </PxlKitSurfaceContext.Provider>
  );
}
