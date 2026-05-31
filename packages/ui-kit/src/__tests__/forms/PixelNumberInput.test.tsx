import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { PixelNumberInput } from '../../forms/PixelNumberInput';

describe('PixelNumberInput', () => {
  it('renders default value', () => {
    const { container } = render(<PixelNumberInput defaultValue={5} />);
    const input = container.querySelector('input[inputmode="decimal"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toBe('5');
  });

  it('up button increments by step', () => {
    const onChange = vi.fn();
    render(<PixelNumberInput defaultValue={3} step={2} onChange={onChange} />);
    const up = screen.getByRole('button', { name: /increment/i });
    fireEvent.click(up);
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('down button decrements', () => {
    const onChange = vi.fn();
    render(<PixelNumberInput defaultValue={3} step={1} onChange={onChange} />);
    const down = screen.getByRole('button', { name: /decrement/i });
    fireEvent.click(down);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('min clamps when clampBehavior="strict"', () => {
    const onChange = vi.fn();
    const { container } = render(
      <PixelNumberInput defaultValue={5} min={0} max={10} clampBehavior="strict" onChange={onChange} />,
    );
    const input = container.querySelector('input[inputmode="decimal"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '-3' } });
    // strict clamps to min
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it('precision=2 formats with 2 decimals on blur', () => {
    const { container } = render(<PixelNumberInput defaultValue={3.5} precision={2} />);
    const input = container.querySelector('input[inputmode="decimal"]') as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(input.value).toBe('3.50');
  });

  it('prefix renders before input', () => {
    const { container, getByText } = render(<PixelNumberInput defaultValue={10} prefix="$" />);
    expect(getByText('$')).toBeTruthy();
    const input = container.querySelector('input[inputmode="decimal"]') as HTMLInputElement;
    expect(input).toBeTruthy();
  });

  it('allowNegative=false strips minus on input', () => {
    const onChange = vi.fn();
    const { container } = render(
      <PixelNumberInput defaultValue={0} allowNegative={false} onChange={onChange} />,
    );
    const input = container.querySelector('input[inputmode="decimal"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '-42' } });
    // minus stripped → 42
    expect(onChange).toHaveBeenLastCalledWith(42);
    expect(input.value).not.toContain('-');
  });

  it('controlled mode tracks value prop', () => {
    function Wrap() {
      const [v, setV] = useState(2);
      return (
        <>
          <PixelNumberInput value={v} onChange={setV} />
          <button onClick={() => setV(99)}>set99</button>
        </>
      );
    }
    const { container, getByText } = render(<Wrap />);
    const input = container.querySelector('input[inputmode="decimal"]') as HTMLInputElement;
    expect(input.value).toBe('2');
    fireEvent.click(getByText('set99'));
    expect(input.value).toBe('99');
  });
});
