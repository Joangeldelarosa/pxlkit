import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { PixelModal } from '../overlay';

describe('PixelModal — hardening', () => {
  it('renders into document.body via portal by default', () => {
    const { container } = render(
      <div data-testid="inline-parent">
        <PixelModal open title="Title" onClose={() => {}}>
          <button data-testid="modal-child">action</button>
        </PixelModal>
      </div>,
    );
    const child = screen.getByTestId('modal-child');
    expect(document.body.contains(child)).toBe(true);
    // Critical: child must NOT live inside the inline parent (it must be portaled out).
    const inline = container.querySelector('[data-testid="inline-parent"]');
    expect(inline?.contains(child)).toBe(false);
  });

  it('traps Tab focus inside the modal — Tab from last cycles to first', async () => {
    render(
      <PixelModal open title="Trap" onClose={() => {}}>
        <button data-testid="first">first</button>
        <button data-testid="second">second</button>
        <button data-testid="last">last</button>
      </PixelModal>,
    );

    // useFocusTrap focuses the first focusable element (the close button in title bar)
    // We grab the LAST focusable element (the "last" button) and ensure that pressing
    // Tab from there wraps back to the first focusable (the close button).
    const last = screen.getByTestId('last');
    last.focus();
    expect(document.activeElement).toBe(last);

    // Tab from last → should cycle to first focusable (close button).
    fireEvent.keyDown(document, { key: 'Tab' });
    const closeBtn = screen.getByRole('button', { name: /close/i });
    expect(document.activeElement).toBe(closeBtn);

    // Shift+Tab from first focusable → should cycle to last.
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('escape key closes the modal', () => {
    const onClose = vi.fn();
    render(
      <PixelModal open title="Esc" onClose={onClose}>
        body
      </PixelModal>,
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders footer when provided', () => {
    render(
      <PixelModal open title="With footer" onClose={() => {}} footer={<button data-testid="footer-btn">Save</button>}>
        body
      </PixelModal>,
    );
    expect(screen.getByTestId('footer-btn')).toBeInTheDocument();
  });

  it('renders description and wires aria-describedby', () => {
    render(
      <PixelModal open title="Described" onClose={() => {}} description="Helper text for AT users.">
        body
      </PixelModal>,
    );
    const dialog = screen.getByRole('dialog');
    const describedBy = dialog.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const descNode = document.getElementById(describedBy!);
    expect(descNode).not.toBeNull();
    expect(descNode!.textContent).toContain('Helper text');
  });

  it('size="full" applies full-viewport classes', () => {
    render(
      <PixelModal open title="Full" onClose={() => {}} size="full">
        body
      </PixelModal>,
    );
    const dialog = screen.getByRole('dialog');
    // The inner dialog box (child after the overlay div) has the size classes.
    const box = dialog.querySelector('.bg-retro-bg') as HTMLElement;
    expect(box).not.toBeNull();
    expect(box.className).toMatch(/max-w-\[95vw\]/);
    expect(box.className).toMatch(/max-h-\[95vh\]/);
    expect(box.className).toMatch(/overflow-y-auto/);
  });

  it('size="xl" applies max-w-4xl', () => {
    render(
      <PixelModal open title="XL" onClose={() => {}} size="xl">
        body
      </PixelModal>,
    );
    const dialog = screen.getByRole('dialog');
    const box = dialog.querySelector('.bg-retro-bg') as HTMLElement;
    expect(box.className).toMatch(/max-w-4xl/);
  });

  it('scroll lock applied while open and released on close', () => {
    const { rerender } = render(
      <PixelModal open title="Locked" onClose={() => {}}>
        body
      </PixelModal>,
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <PixelModal open={false} title="Locked" onClose={() => {}}>
        body
      </PixelModal>,
    );
    // After unmounting (open=false), scroll lock should release.
    expect(document.body.style.overflow).toBe('');
  });

  it('asyncClose awaits before invoking onClose and shows loading state', async () => {
    let resolveClose: (() => void) | null = null;
    const asyncClose = vi.fn(() => new Promise<void>((res) => { resolveClose = res; }));
    const onClose = vi.fn();

    render(
      <PixelModal open title="Async" onClose={onClose} asyncClose={asyncClose}>
        body
      </PixelModal>,
    );

    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);

    // Loading state: button busy + disabled until promise resolves.
    await waitFor(() => {
      expect(closeBtn.getAttribute('aria-busy')).toBe('true');
    });
    expect((closeBtn as HTMLButtonElement).disabled).toBe(true);
    expect(asyncClose).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();

    // Resolve the promise — onClose fires after.
    await act(async () => {
      resolveClose?.();
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
