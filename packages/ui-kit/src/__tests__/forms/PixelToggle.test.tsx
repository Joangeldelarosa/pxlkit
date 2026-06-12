import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { PixelToggle } from '../../forms/PixelToggle';

/* Group-driven behavior (single/multiple selection, roving focus) is covered
   in ./PixelToggleGroup.test.tsx — this file covers the STANDALONE toggle. */

describe('PixelToggle — standalone', () => {
  it('pressed state toggles (controlled)', () => {
    const onPressedChange = vi.fn();
    function Wrapper() {
      const [pressed, setPressed] = useState(false);
      return (
        <PixelToggle
          value="bold"
          pressed={pressed}
          onPressedChange={(next) => {
            onPressedChange(next);
            setPressed(next);
          }}
        >
          B
        </PixelToggle>
      );
    }

    const { getByText } = render(<Wrapper />);
    const btn = getByText('B').closest('button')!;
    expect(btn.getAttribute('aria-pressed')).toBe('false');

    act(() => {
      fireEvent.click(btn);
    });
    expect(onPressedChange).toHaveBeenLastCalledWith(true);
    expect(btn.getAttribute('aria-pressed')).toBe('true');

    act(() => {
      fireEvent.click(btn);
    });
    expect(onPressedChange).toHaveBeenLastCalledWith(false);
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  it('toggles internally when uncontrolled (no pressed prop)', () => {
    const onPressedChange = vi.fn();
    const { getByRole } = render(
      <PixelToggle value="italic" onPressedChange={onPressedChange}>
        I
      </PixelToggle>,
    );
    const btn = getByRole('button');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    expect(btn.getAttribute('data-state')).toBe('off');

    fireEvent.click(btn);
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(btn.getAttribute('data-state')).toBe('on');
    expect(onPressedChange).toHaveBeenLastCalledWith(true);

    fireEvent.click(btn);
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    expect(onPressedChange).toHaveBeenLastCalledWith(false);
  });

  it('disabled blocks toggling and sets the disabled attribute', () => {
    const onPressedChange = vi.fn();
    const { getByRole } = render(
      <PixelToggle value="code" disabled onPressedChange={onPressedChange}>
        C
      </PixelToggle>,
    );
    const btn = getByRole('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    fireEvent.click(btn);
    expect(onPressedChange).not.toHaveBeenCalled();
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  it('defaults to type="button", forwards className + DOM props', () => {
    const { getByRole } = render(
      <PixelToggle value="x" className="my-toggle" data-testid="tg">
        X
      </PixelToggle>,
    );
    const btn = getByRole('button') as HTMLButtonElement;
    expect(btn.type).toBe('button');
    expect(btn.className).toContain('my-toggle');
    expect(btn.getAttribute('data-testid')).toBe('tg');
    expect(btn.getAttribute('data-pxl-toggle-value')).toBe('x');
  });
});
