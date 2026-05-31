import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { PixelPortal } from '../../overlay-foundation/PixelPortal';

describe('PixelPortal', () => {
  it('renders children inline on server (no window) so SSR HTML is non-empty', () => {
    // PixelPortal is now SSR-streamable: when window is undefined it
    // returns a Fragment around children so server output isn't blank.
    // The post-mount client effect swaps to a real portal.
    const originalWindow = globalThis.window;
    delete (globalThis as { window?: Window }).window;
    try {
      // forwardRef component exposes a `.render` callable with (props, ref).
      const render = (PixelPortal as unknown as {
        render: (
          p: { children: React.ReactNode },
          ref: React.Ref<HTMLDivElement>,
        ) => React.ReactElement | null;
      }).render;
      const result = render({ children: <div>x</div> }, null);
      // Should be a Fragment containing the children (NOT null).
      expect(result).not.toBeNull();
    } finally {
      (globalThis as { window?: Window }).window = originalWindow;
    }
  });

  it('renders into document.body by default', () => {
    const { getByTestId, baseElement } = render(
      <PixelPortal>
        <div data-testid="portal-child">hello</div>
      </PixelPortal>,
    );
    const child = getByTestId('portal-child');
    expect(child).toBeInTheDocument();
    // Child should live under document.body (which equals baseElement in RTL).
    expect(baseElement.contains(child)).toBe(true);
    expect(document.body.contains(child)).toBe(true);
  });

  it('renders into custom container when provided', () => {
    const container = document.createElement('div');
    container.setAttribute('data-testid', 'custom-container');
    document.body.appendChild(container);
    try {
      const { getByTestId } = render(
        <PixelPortal container={container}>
          <div data-testid="portal-child">hi</div>
        </PixelPortal>,
      );
      const child = getByTestId('portal-child');
      expect(container.contains(child)).toBe(true);
    } finally {
      container.remove();
    }
  });

  it('renders inline when disabled=true', () => {
    const { getByTestId } = render(
      <div data-testid="inline-parent">
        <PixelPortal disabled>
          <span data-testid="inline-child">inline</span>
        </PixelPortal>
      </div>,
    );
    const parent = getByTestId('inline-parent');
    const child = getByTestId('inline-child');
    expect(parent.contains(child)).toBe(true);
  });
});
