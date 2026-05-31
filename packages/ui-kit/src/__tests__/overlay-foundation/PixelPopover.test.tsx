import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { PixelPopover } from '../../overlay-foundation/PixelPopover';

describe('PixelPopover', () => {
  it('does not render Content in DOM when open=false', () => {
    const onOpenChange = vi.fn();
    const { queryByTestId } = render(
      <PixelPopover open={false} onOpenChange={onOpenChange}>
        <PixelPopover.Trigger>
          <button data-testid="trigger">open</button>
        </PixelPopover.Trigger>
        <PixelPopover.Content data-testid="content">
          <span>hello</span>
        </PixelPopover.Content>
      </PixelPopover>,
    );
    expect(queryByTestId('content')).toBeNull();
  });

  it('renders Content into portal (document.body) when open=true', () => {
    const onOpenChange = vi.fn();
    const { getByTestId, container } = render(
      <PixelPopover open onOpenChange={onOpenChange}>
        <PixelPopover.Trigger>
          <button data-testid="trigger">open</button>
        </PixelPopover.Trigger>
        <PixelPopover.Content data-testid="content">
          <span>hello</span>
        </PixelPopover.Content>
      </PixelPopover>,
    );
    const content = getByTestId('content');
    expect(content).toBeTruthy();
    // Portal escape: content is NOT a descendant of the test container root.
    expect(container.contains(content)).toBe(false);
    // But it is in the document.
    expect(document.body.contains(content)).toBe(true);
  });

  it('clicking the trigger calls onOpenChange(true)', () => {
    const onOpenChange = vi.fn();
    const { getByTestId } = render(
      <PixelPopover open={false} onOpenChange={onOpenChange}>
        <PixelPopover.Trigger>
          <button data-testid="trigger">open</button>
        </PixelPopover.Trigger>
        <PixelPopover.Content data-testid="content">
          <span>hello</span>
        </PixelPopover.Content>
      </PixelPopover>,
    );
    fireEvent.click(getByTestId('trigger'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('Escape calls onOpenChange(false) when closeOnEscape=true (default)', () => {
    const onOpenChange = vi.fn();
    render(
      <PixelPopover open onOpenChange={onOpenChange}>
        <PixelPopover.Trigger>
          <button data-testid="trigger">open</button>
        </PixelPopover.Trigger>
        <PixelPopover.Content data-testid="content">
          <span>hello</span>
        </PixelPopover.Content>
      </PixelPopover>,
    );
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does NOT call onOpenChange on Escape when closeOnEscape=false', () => {
    const onOpenChange = vi.fn();
    render(
      <PixelPopover open onOpenChange={onOpenChange} closeOnEscape={false}>
        <PixelPopover.Trigger>
          <button data-testid="trigger">open</button>
        </PixelPopover.Trigger>
        <PixelPopover.Content data-testid="content">
          <span>hello</span>
        </PixelPopover.Content>
      </PixelPopover>,
    );
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('clicking outside calls onOpenChange(false) when closeOnOutsideClick=true (default)', () => {
    const onOpenChange = vi.fn();
    render(
      <div>
        <PixelPopover open onOpenChange={onOpenChange}>
          <PixelPopover.Trigger>
            <button data-testid="trigger">open</button>
          </PixelPopover.Trigger>
          <PixelPopover.Content data-testid="content">
            <span>hello</span>
          </PixelPopover.Content>
        </PixelPopover>
        <button data-testid="outside">outside</button>
      </div>,
    );
    const outside = document.querySelector('[data-testid="outside"]') as HTMLElement;
    act(() => {
      outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does NOT close on outside click when closeOnOutsideClick=false', () => {
    const onOpenChange = vi.fn();
    render(
      <div>
        <PixelPopover open onOpenChange={onOpenChange} closeOnOutsideClick={false}>
          <PixelPopover.Trigger>
            <button data-testid="trigger">open</button>
          </PixelPopover.Trigger>
          <PixelPopover.Content data-testid="content">
            <span>hello</span>
          </PixelPopover.Content>
        </PixelPopover>
        <button data-testid="outside">outside</button>
      </div>,
    );
    const outside = document.querySelector('[data-testid="outside"]') as HTMLElement;
    act(() => {
      outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    });
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
