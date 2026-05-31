import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { PixelToggleGroup, PixelToggle } from '../../forms/PixelToggleGroup';

  // In single-select mode, toggles expose role=radio + aria-checked so SR
  // users hear "one of N" semantics. In multi-select mode, they stay
  // role=button + aria-pressed. The check below uses aria-checked for single.
  function pressedAttr(el: HTMLElement, type: 'single' | 'multiple'): string | null {
    return type === 'single'
      ? el.getAttribute('aria-checked')
      : el.getAttribute('aria-pressed');
  }

describe('PixelToggleGroup', () => {
  it('type=single only allows one pressed at a time', () => {
    const onChange = vi.fn();
    function Wrapper() {
      const [val, setVal] = useState<string>('a');
      return (
        <PixelToggleGroup
          type="single"
          value={val}
          onChange={(next) => {
            onChange(next);
            setVal(next as string);
          }}
        >
          <PixelToggle value="a">A</PixelToggle>
          <PixelToggle value="b">B</PixelToggle>
          <PixelToggle value="c">C</PixelToggle>
        </PixelToggleGroup>
      );
    }

    const { getByText } = render(<Wrapper />);
    const a = getByText('A').closest('button')!;
    const b = getByText('B').closest('button')!;
    const c = getByText('C').closest('button')!;

    expect(pressedAttr(a, 'single')).toBe('true');
    expect(pressedAttr(b, 'single')).toBe('false');
    expect(pressedAttr(c, 'single')).toBe('false');
    expect(a.getAttribute('role')).toBe('radio');

    act(() => {
      fireEvent.click(b);
    });
    expect(onChange).toHaveBeenLastCalledWith('b');
    expect(pressedAttr(a, 'single')).toBe('false');
    expect(pressedAttr(b, 'single')).toBe('true');

    // Clicking pressed item in single-mode unsets it (empty string)
    act(() => {
      fireEvent.click(b);
    });
    expect(onChange).toHaveBeenLastCalledWith('');
    expect(pressedAttr(b, 'single')).toBe('false');
  });

  it('type=multiple allows multiple', () => {
    const onChange = vi.fn();
    function Wrapper() {
      const [val, setVal] = useState<string[]>(['a']);
      return (
        <PixelToggleGroup
          type="multiple"
          value={val}
          onChange={(next) => {
            onChange(next);
            setVal(next as string[]);
          }}
        >
          <PixelToggle value="a">A</PixelToggle>
          <PixelToggle value="b">B</PixelToggle>
          <PixelToggle value="c">C</PixelToggle>
        </PixelToggleGroup>
      );
    }

    const { getByText } = render(<Wrapper />);
    const a = getByText('A').closest('button')!;
    const b = getByText('B').closest('button')!;
    const c = getByText('C').closest('button')!;

    expect(a.getAttribute('aria-pressed')).toBe('true');
    expect(b.getAttribute('aria-pressed')).toBe('false');

    act(() => {
      fireEvent.click(b);
    });
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b']);
    expect(a.getAttribute('aria-pressed')).toBe('true');
    expect(b.getAttribute('aria-pressed')).toBe('true');

    act(() => {
      fireEvent.click(c);
    });
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b', 'c']);

    // Toggle off
    act(() => {
      fireEvent.click(a);
    });
    expect(onChange).toHaveBeenLastCalledWith(['b', 'c']);
    expect(a.getAttribute('aria-pressed')).toBe('false');
  });

  it('PixelToggle pressed state toggles (standalone, controlled)', () => {
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

  it('Arrow keys move focus with rovingFocus=true', () => {
    const { getByText } = render(
      <PixelToggleGroup type="multiple" rovingFocus loop>
        <PixelToggle value="a">A</PixelToggle>
        <PixelToggle value="b">B</PixelToggle>
        <PixelToggle value="c">C</PixelToggle>
      </PixelToggleGroup>,
    );
    const a = getByText('A').closest('button') as HTMLButtonElement;
    const b = getByText('B').closest('button') as HTMLButtonElement;
    const c = getByText('C').closest('button') as HTMLButtonElement;

    // Initial roving tabindex: first item = 0, others = -1
    expect(a.tabIndex).toBe(0);
    expect(b.tabIndex).toBe(-1);
    expect(c.tabIndex).toBe(-1);

    act(() => {
      a.focus();
    });
    expect(document.activeElement).toBe(a);

    act(() => {
      fireEvent.keyDown(a, { key: 'ArrowRight' });
    });
    expect(document.activeElement).toBe(b);

    act(() => {
      fireEvent.keyDown(b, { key: 'ArrowRight' });
    });
    expect(document.activeElement).toBe(c);

    // Loop wraps
    act(() => {
      fireEvent.keyDown(c, { key: 'ArrowRight' });
    });
    expect(document.activeElement).toBe(a);

    // ArrowLeft loops backwards
    act(() => {
      fireEvent.keyDown(a, { key: 'ArrowLeft' });
    });
    expect(document.activeElement).toBe(c);

    // Home / End
    act(() => {
      fireEvent.keyDown(c, { key: 'Home' });
    });
    expect(document.activeElement).toBe(a);

    act(() => {
      fireEvent.keyDown(a, { key: 'End' });
    });
    expect(document.activeElement).toBe(c);
  });

  it('forwards className', () => {
    const { container } = render(
      <PixelToggleGroup type="multiple" className="my-custom-group">
        <PixelToggle value="a" className="my-custom-toggle">
          A
        </PixelToggle>
      </PixelToggleGroup>,
    );
    const group = container.querySelector('.my-custom-group');
    expect(group).toBeTruthy();
    const toggle = container.querySelector('.my-custom-toggle');
    expect(toggle).toBeTruthy();
  });
});
