import React from 'react';
import { PxlKitSurfaceProvider } from '../common';

export function Default() {
  return (
    <PxlKitSurfaceProvider surface="pixel">
      <p>Nested PxlKit components default to the pixel surface.</p>
    </PxlKitSurfaceProvider>
  );
}

export function Linear() {
  return (
    <PxlKitSurfaceProvider surface="linear">
      <p>Nested PxlKit components default to the linear surface.</p>
    </PxlKitSurfaceProvider>
  );
}
