import React, { useState } from 'react';
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

  it('ignores a click dispatched to a disabled trigger', () => {
    const onOpenChange = vi.fn();
    const { getByTestId } = render(
      <PixelPopover open={false} onOpenChange={onOpenChange}>
        <PixelPopover.Trigger>
          <button data-testid="trigger" disabled>open</button>
        </PixelPopover.Trigger>
        <PixelPopover.Content data-testid="content">
          <span>hello</span>
        </PixelPopover.Content>
      </PixelPopover>,
    );
    act(() => {
      getByTestId('trigger').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(onOpenChange).not.toHaveBeenCalled();
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

  describe('focus return', () => {
    // Settles React's update, then the focus-return microtask.
    const settle = () => act(async () => {
      await new Promise((done) => setTimeout(done, 0));
    });

    function Harness({ keepOpenOnOutside = false }: { keepOpenOnOutside?: boolean }) {
      const [open, setOpen] = useState(true);
      return (
        <div>
          <PixelPopover
            open={open}
            onOpenChange={(next) => {
              if (!next && keepOpenOnOutside) return;
              setOpen(next);
            }}
          >
            <PixelPopover.Trigger>
              <button data-testid="trigger">open</button>
            </PixelPopover.Trigger>
            <PixelPopover.Content data-testid="content">
              <input data-testid="field" aria-label="Field" />
              <button data-testid="done" onClick={() => setOpen(false)}>
                Done
              </button>
            </PixelPopover.Content>
          </PixelPopover>
          <button data-testid="outside">outside</button>
        </div>
      );
    }

    it('returns focus to the trigger when Escape closes focused content', async () => {
      const { getByTestId, queryByTestId } = render(<Harness />);
      await settle();
      getByTestId('field').focus();
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });
      await settle();
      expect(queryByTestId('content')).toBeNull();
      expect(document.activeElement).toBe(getByTestId('trigger'));
    });

    it('returns focus to the trigger when the parent closes focused content', async () => {
      const { getByTestId, queryByTestId } = render(<Harness />);
      await settle();
      const done = getByTestId('done');
      done.focus();
      fireEvent.click(done);
      await settle();
      expect(queryByTestId('content')).toBeNull();
      expect(document.activeElement).toBe(getByTestId('trigger'));
    });

    it('lets focus follow the pointer when a press outside closes the content', async () => {
      const { getByTestId, queryByTestId } = render(<Harness />);
      await settle();
      getByTestId('field').focus();
      act(() => {
        getByTestId('outside').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      });
      await settle();
      expect(queryByTestId('content')).toBeNull();
      expect(document.activeElement).not.toBe(getByTestId('trigger'));
    });

    it('still returns focus after a press outside the parent declined', async () => {
      const { getByTestId, queryByTestId } = render(<Harness keepOpenOnOutside />);
      await settle();
      const outside = getByTestId('outside');
      act(() => {
        outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        outside.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      });
      await settle();
      const done = getByTestId('done');
      done.focus();
      fireEvent.click(done);
      await settle();
      expect(queryByTestId('content')).toBeNull();
      expect(document.activeElement).toBe(getByTestId('trigger'));
    });

    it('leaves focus alone when the content did not hold it', async () => {
      const { getByTestId, queryByTestId } = render(<Harness />);
      await settle();
      const outside = getByTestId('outside');
      outside.focus();
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });
      await settle();
      expect(queryByTestId('content')).toBeNull();
      expect(document.activeElement).toBe(outside);
    });
  });

  describe('aria-controls', () => {
    function Harness({ contentId, triggerControls }: { contentId?: string; triggerControls?: string }) {
      const [open, setOpen] = useState(false);
      return (
        <PixelPopover open={open} onOpenChange={setOpen}>
          <PixelPopover.Trigger>
            <button data-testid="trigger" aria-controls={triggerControls}>open</button>
          </PixelPopover.Trigger>
          <PixelPopover.Content data-testid="content" id={contentId}>
            hello
          </PixelPopover.Content>
        </PixelPopover>
      );
    }

    it('points the trigger at the content only while the content is on the page', () => {
      const { getByTestId, queryByTestId } = render(<Harness />);
      const trigger = getByTestId('trigger');
      expect(trigger.hasAttribute('aria-controls')).toBe(false);
      fireEvent.click(trigger);
      const content = getByTestId('content');
      expect(content.id).not.toBe('');
      expect(trigger.getAttribute('aria-controls')).toBe(content.id);
      fireEvent.click(trigger);
      expect(queryByTestId('content')).toBeNull();
      expect(trigger.hasAttribute('aria-controls')).toBe(false);
    });

    it('keeps an id given to the content', () => {
      const { getByTestId } = render(<Harness contentId="details" />);
      fireEvent.click(getByTestId('trigger'));
      expect(getByTestId('content').id).toBe('details');
      expect(getByTestId('trigger').getAttribute('aria-controls')).toBe('details');
    });

    it("keeps the trigger's own aria-controls", () => {
      const { getByTestId } = render(<Harness triggerControls="listbox" />);
      const trigger = getByTestId('trigger');
      fireEvent.click(trigger);
      expect(getByTestId('content')).toBeTruthy();
      expect(trigger.getAttribute('aria-controls')).toBe('listbox');
    });
  });
});
