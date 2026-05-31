import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { PixelSheet } from '../../overlays/PixelSheet';

describe('PixelSheet', () => {
  it('renders nothing when open=false', () => {
    const onOpenChange = vi.fn();
    const { queryByTestId } = render(
      <PixelSheet open={false} onOpenChange={onOpenChange}>
        <div data-testid="sheet-body">body</div>
      </PixelSheet>,
    );
    expect(queryByTestId('sheet-body')).toBeNull();
  });

  it('renders into portal (document.body) when open=true', () => {
    const onOpenChange = vi.fn();
    const { getByTestId, container } = render(
      <PixelSheet open onOpenChange={onOpenChange}>
        <div data-testid="sheet-body">body</div>
      </PixelSheet>,
    );
    const body = getByTestId('sheet-body');
    expect(body).toBeTruthy();
    // Portal escape: child is NOT a descendant of the test container root.
    expect(container.contains(body)).toBe(false);
    // But it IS in the document.
    expect(document.body.contains(body)).toBe(true);
  });

  it('defaults side="bottom" (panel anchored to bottom edge)', () => {
    const onOpenChange = vi.fn();
    const { getByRole } = render(
      <PixelSheet open onOpenChange={onOpenChange}>
        <div>body</div>
      </PixelSheet>,
    );
    const dialog = getByRole('dialog');
    expect(dialog).toHaveAttribute('data-side', 'bottom');
  });

  it('renders drag handle when dragHandle=true', () => {
    const onOpenChange = vi.fn();
    const { getByTestId, rerender } = render(
      <PixelSheet open onOpenChange={onOpenChange} dragHandle>
        <div>body</div>
      </PixelSheet>,
    );
    expect(getByTestId('pixel-sheet-drag-handle')).toBeInTheDocument();

    rerender(
      <PixelSheet open onOpenChange={onOpenChange} dragHandle={false}>
        <div>body</div>
      </PixelSheet>,
    );
    expect(() => getByTestId('pixel-sheet-drag-handle')).toThrow();
  });
});
