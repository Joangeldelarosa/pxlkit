import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PxlKitSurfaceProvider } from '../../overlay-foundation/PxlKitSurfaceProvider';
import { useEffectiveSurface, usePxlKitSurface, type Surface } from '../../common';

/** Helper consumer that reads the surface context the way components do. */
function SurfaceInspector({ surfaceProp }: { surfaceProp?: Surface }) {
  const ctx = usePxlKitSurface();
  const effective = useEffectiveSurface(surfaceProp);
  return (
    <div>
      <span data-testid="ctx-surface">{ctx}</span>
      <span data-testid="effective-surface">{effective}</span>
    </div>
  );
}

describe('PxlKitSurfaceProvider', () => {
  it('renders its children', () => {
    render(
      <PxlKitSurfaceProvider>
        <span data-testid="child">content</span>
      </PxlKitSurfaceProvider>,
    );
    expect(screen.getByTestId('child').textContent).toBe('content');
  });

  it('defaults to the "pixel" surface without a provider', () => {
    render(<SurfaceInspector />);
    expect(screen.getByTestId('ctx-surface').textContent).toBe('pixel');
    expect(screen.getByTestId('effective-surface').textContent).toBe('pixel');
  });

  it('provides surface="linear" to nested consumers', () => {
    render(
      <PxlKitSurfaceProvider surface="linear">
        <SurfaceInspector />
      </PxlKitSurfaceProvider>,
    );
    expect(screen.getByTestId('ctx-surface').textContent).toBe('linear');
    expect(screen.getByTestId('effective-surface').textContent).toBe('linear');
  });

  it('defaults to surface="pixel" when the prop is omitted', () => {
    render(
      <PxlKitSurfaceProvider>
        <SurfaceInspector />
      </PxlKitSurfaceProvider>,
    );
    expect(screen.getByTestId('ctx-surface').textContent).toBe('pixel');
  });

  it('a component-level surface prop overrides the provider context', () => {
    render(
      <PxlKitSurfaceProvider surface="linear">
        <SurfaceInspector surfaceProp="pixel" />
      </PxlKitSurfaceProvider>,
    );
    expect(screen.getByTestId('ctx-surface').textContent).toBe('linear');
    expect(screen.getByTestId('effective-surface').textContent).toBe('pixel');
  });

  it('nested providers: the innermost surface wins', () => {
    render(
      <PxlKitSurfaceProvider surface="linear">
        <PxlKitSurfaceProvider surface="pixel">
          <SurfaceInspector />
        </PxlKitSurfaceProvider>
      </PxlKitSurfaceProvider>,
    );
    expect(screen.getByTestId('effective-surface').textContent).toBe('pixel');
  });
});
